import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { ZohoConfig, ZohoOAuthConfig } from './interfaces/zoho.config.interface';
import { AxiosRequestConfig, AxiosError, AxiosResponse } from 'axios';

@Injectable()
export class ZohoClient {
  private readonly logger = new Logger(ZohoClient.name);
  private zohoConfig: ZohoConfig;
  private readonly ZOHO_ACCOUNTS_BASE_URL = 'https://accounts.zoho.';
  private readonly ZOHO_API_BASE_URL = 'https://www.zohoapis.';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.zohoConfig = {
      region: this.configService.get<string>('ZOHO_REGION', 'com'),
      clientId: this.configService.get<string>('ZOHO_CLIENT_ID'),
      clientSecret: this.configService.get<string>('ZOHO_CLIENT_SECRET'),
      redirectUri: this.configService.get<string>('ZOHO_REDIRECT_URI'),
      organizationId: this.configService.get<string>('ZOHO_ORGANIZATION_ID'),
      refreshToken: this.configService.get<string>('ZOHO_REFRESH_TOKEN'),
      accessToken: this.configService.get<string>('ZOHO_ACCESS_TOKEN'), // This might be managed more dynamically
    };

    if (
      !this.zohoConfig.clientId ||
      !this.zohoConfig.clientSecret ||
      !this.zohoConfig.organizationId
      // !this.zohoConfig.redirectUri // Not strictly needed if refresh token is present
    ) {
      this.logger.error('Zoho API client ID, client secret, or organization ID is missing from configuration.');
      throw new Error('Zoho API configuration is incomplete.');
    }
  }

  /**
   * Constructs the Zoho Books API base URL based on the configured region.
   * @returns The Zoho Books API base URL string.
   * @private
   */
  private getApiBaseUrl(): string {
    return `${this.ZOHO_API_BASE_URL}${this.zohoConfig.region}/books/v3`;
  }

  /**
   * Constructs the Zoho Accounts API base URL for OAuth operations.
   * @returns The Zoho Accounts API base URL string.
   * @private
   */
  private getAccountsBaseUrl(): string {
    return `${this.ZOHO_ACCOUNTS_BASE_URL}${this.zohoConfig.region}`;
  }

  /**
   * Retrieves the current access token. If an access token is not available or expired (simplified check),
   * it attempts to refresh it using the refresh token.
   * @returns A promise that resolves to the access token string.
   * @throws HttpException if the access token cannot be obtained or refreshed.
   * @private
   */
  private async getAccessToken(): Promise<string> {
    // In a real scenario, this would check expiry and refresh if needed
    // For now, we assume a valid access token is provided or can be refreshed
    if (this.zohoConfig.accessToken) { // Simplified: check for expiry in real app
      return this.zohoConfig.accessToken;
    }
    if (this.zohoConfig.refreshToken) {
      return this.refreshAccessToken();
    }
    throw new HttpException('Zoho access token is unavailable and no refresh token is configured.', HttpStatus.UNAUTHORIZED);
  }

  /**
   * Refreshes the Zoho access token using the stored refresh token.
   * Updates the in-memory `zohoConfig.accessToken`.
   * In a production scenario, consider persisting the new access token if it's managed outside `ConfigService`.
   * @returns A promise that resolves to the new access token string.
   * @throws HttpException if the refresh token is missing or if the refresh process fails.
   */
  async refreshAccessToken(): Promise<string> {
    if (!this.zohoConfig.refreshToken) {
      this.logger.error('Zoho refresh token is not available.');
      throw new HttpException('Zoho refresh token is not available.', HttpStatus.UNAUTHORIZED);
    }

    const refreshTokenUrl = `${this.getAccountsBaseUrl()}/oauth/v2/token`;
    const params = new URLSearchParams();
    params.append('refresh_token', this.zohoConfig.refreshToken);
    params.append('client_id', this.zohoConfig.clientId);
    params.append('client_secret', this.zohoConfig.clientSecret);
    params.append('grant_type', 'refresh_token');

    try {
      this.logger.log('Attempting to refresh Zoho access token.');
      const response = await firstValueFrom(
        this.httpService.post<ZohoOAuthConfig>(refreshTokenUrl, params, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }),
      );

      if (response.data.access_token) {
        this.zohoConfig.accessToken = response.data.access_token;
        // TODO: Persist the new access token and potentially new refresh token if it changes
        // For now, we'll just update it in memory. In a real app, update ConfigService or a secure store.
        this.logger.log('Successfully refreshed Zoho access token.');
        // If a new refresh token is issued, it should be saved as well.
        // Zoho typically doesn't change refresh tokens frequently unless they are revoked.
        return this.zohoConfig.accessToken;
      } else {
        this.logger.error(`Failed to refresh Zoho access token. Response: ${JSON.stringify(response.data)}`);
        throw new HttpException('Failed to refresh Zoho access token.', HttpStatus.UNAUTHORIZED);
      }
    } catch (error) {
      this.logger.error(
        `Error refreshing Zoho access token: ${error.message}`,
        error.stack,
      );
      if (error.response?.data) {
        this.logger.error(`Zoho error response: ${JSON.stringify(error.response.data)}`);
        throw new HttpException(
          `Zoho API error during token refresh: ${error.response.data.error || error.message}`,
          error.response.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw new HttpException(
        `Network or other error refreshing Zoho access token: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Makes a generic request to the Zoho Books API.
   * Handles token acquisition, request formation, and retries on 401 errors.
   * @template T The expected response data type.
   * @param method The HTTP method ('GET', 'POST', 'PUT', 'DELETE').
   * @param endpoint The API endpoint path (e.g., 'contacts', 'invoices/invoice_id').
   * @param data Optional data payload for POST or PUT requests.
   * @param params Optional query parameters for the request.
   * @returns A promise that resolves to the AxiosResponse from Zoho.
   * @throws HttpException if the request fails after retries or for other reasons.
   */
  async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: any,
    params?: Record<string, any>,
  ): Promise<AxiosResponse<T>> {
    const accessToken = await this.getAccessToken();
    const url = `${this.getApiBaseUrl()}/${endpoint}`;

    const headers: Record<string, string> = {
      Authorization: `Zoho-oauthtoken ${accessToken}`,
      'X-Zoho-Organization-Id': this.zohoConfig.organizationId, // Deprecated, but good to have for older versions
      'Content-Type': 'application/json;charset=UTF-8',
    };

    // Zoho expects organization_id as a query parameter for some endpoints
    // and as a header for others. It's safer to include it as a query param by default.
    const queryParams = { ...params, organization_id: this.zohoConfig.organizationId };


    const config: AxiosRequestConfig = {
      method,
      url,
      headers,
      params: queryParams, // Use queryParams here
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      config.data = data;
    }

    this.logger.debug(`Making Zoho API request: ${method} ${url} with params: ${JSON.stringify(queryParams)}`);

    try {
      const response = await firstValueFrom(this.httpService.request<T>(config));
      return response;
    } catch (error) {
      const axiosError = error as AxiosError;
      this.logger.error(
        `Zoho API request failed: ${method} ${url} - Status: ${
          axiosError.response?.status
        } - Response: ${JSON.stringify(axiosError.response?.data)}`,
        axiosError.stack,
      );

      if (axiosError.response?.status === 401) { // Unauthorized
        this.logger.warn('Zoho API returned 401. Attempting token refresh.');
        try {
          await this.refreshAccessToken();
          // Retry the request once after token refresh
          this.logger.log('Retrying Zoho API request after token refresh.');
          const newAccessToken = await this.getAccessToken();
          config.headers.Authorization = `Zoho-oauthtoken ${newAccessToken}`;
          const retryResponse = await firstValueFrom(this.httpService.request<T>(config));
          return retryResponse;
        } catch (refreshError) {
          this.logger.error('Failed to refresh token or retry request after 401.', refreshError.stack);
          throw new HttpException(
            `Zoho API authentication failed after retry: ${refreshError.message}`,
            HttpStatus.UNAUTHORIZED,
          );
        }
      }

      let errorMessage = 'Error interacting with Zoho API';
      let errorStatus = HttpStatus.INTERNAL_SERVER_ERROR;

      if (axiosError.response) {
        const zohoError = axiosError.response.data as any; // Zoho error structure can vary
        errorMessage = zohoError.message || JSON.stringify(zohoError);
        errorStatus = axiosError.response.status;
      } else if (axiosError.request) {
        errorMessage = 'No response received from Zoho API';
        errorStatus = HttpStatus.SERVICE_UNAVAILABLE;
      } else {
        errorMessage = axiosError.message;
      }

      throw new HttpException(errorMessage, errorStatus);
    }
  }

  /**
   * Makes a GET request to the Zoho Books API.
   * @template T The expected response data type.
   * @param endpoint The API endpoint path.
   * @param params Optional query parameters.
   * @returns A promise that resolves to the AxiosResponse.
   */
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<AxiosResponse<T>> {
    return this.request<T>('GET', endpoint, undefined, params);
  }

  /**
   * Makes a POST request to the Zoho Books API.
   * @template T The expected response data type.
   * @param endpoint The API endpoint path.
   * @param data The data payload for the request.
   * @param params Optional query parameters.
   * @returns A promise that resolves to the AxiosResponse.
   */
  async post<T>(endpoint: string, data: any, params?: Record<string, any>): Promise<AxiosResponse<T>> {
    return this.request<T>('POST', endpoint, data, params);
  }

  /**
   * Makes a PUT request to the Zoho Books API.
   * @template T The expected response data type.
   * @param endpoint The API endpoint path.
   * @param data The data payload for the request.
   * @param params Optional query parameters.
   * @returns A promise that resolves to the AxiosResponse.
   */
  async put<T>(endpoint: string, data: any, params?: Record<string, any>): Promise<AxiosResponse<T>> {
    return this.request<T>('PUT', endpoint, data, params);
  }

  /**
   * Makes a DELETE request to the Zoho Books API.
   * @template T The expected response data type.
   * @param endpoint The API endpoint path.
   * @param params Optional query parameters.
   * @returns A promise that resolves to the AxiosResponse.
   */
  async delete<T>(endpoint: string, params?: Record<string, any>): Promise<AxiosResponse<T>> {
    return this.request<T>('DELETE', endpoint, undefined, params);
  }
}
