"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ZohoClient_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZohoClient = void 0;
const axios_1 = require("@nestjs/axios");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const rxjs_1 = require("rxjs");
let ZohoClient = ZohoClient_1 = class ZohoClient {
    constructor(httpService, configService) {
        this.httpService = httpService;
        this.configService = configService;
        this.logger = new common_1.Logger(ZohoClient_1.name);
        this.ZOHO_ACCOUNTS_BASE_URL = 'https://accounts.zoho.';
        this.ZOHO_API_BASE_URL = 'https://www.zohoapis.';
        this.zohoConfig = {
            region: this.configService.get('ZOHO_REGION', 'com'),
            clientId: this.configService.get('ZOHO_CLIENT_ID'),
            clientSecret: this.configService.get('ZOHO_CLIENT_SECRET'),
            redirectUri: this.configService.get('ZOHO_REDIRECT_URI'),
            organizationId: this.configService.get('ZOHO_ORGANIZATION_ID'),
            refreshToken: this.configService.get('ZOHO_REFRESH_TOKEN'),
            accessToken: this.configService.get('ZOHO_ACCESS_TOKEN'),
        };
        if (!this.zohoConfig.clientId ||
            !this.zohoConfig.clientSecret ||
            !this.zohoConfig.organizationId) {
            this.logger.error('Zoho API client ID, client secret, or organization ID is missing from configuration.');
            throw new Error('Zoho API configuration is incomplete.');
        }
    }
    getApiBaseUrl() {
        return `${this.ZOHO_API_BASE_URL}${this.zohoConfig.region}/books/v3`;
    }
    getAccountsBaseUrl() {
        return `${this.ZOHO_ACCOUNTS_BASE_URL}${this.zohoConfig.region}`;
    }
    async getAccessToken() {
        if (this.zohoConfig.accessToken) {
            return this.zohoConfig.accessToken;
        }
        if (this.zohoConfig.refreshToken) {
            return this.refreshAccessToken();
        }
        throw new common_1.HttpException('Zoho access token is unavailable and no refresh token is configured.', common_1.HttpStatus.UNAUTHORIZED);
    }
    async refreshAccessToken() {
        if (!this.zohoConfig.refreshToken) {
            this.logger.error('Zoho refresh token is not available.');
            throw new common_1.HttpException('Zoho refresh token is not available.', common_1.HttpStatus.UNAUTHORIZED);
        }
        const refreshTokenUrl = `${this.getAccountsBaseUrl()}/oauth/v2/token`;
        const params = new URLSearchParams();
        params.append('refresh_token', this.zohoConfig.refreshToken);
        params.append('client_id', this.zohoConfig.clientId);
        params.append('client_secret', this.zohoConfig.clientSecret);
        params.append('grant_type', 'refresh_token');
        try {
            this.logger.log('Attempting to refresh Zoho access token.');
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(refreshTokenUrl, params, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            }));
            if (response.data.access_token) {
                this.zohoConfig.accessToken = response.data.access_token;
                this.logger.log('Successfully refreshed Zoho access token.');
                return this.zohoConfig.accessToken;
            }
            else {
                this.logger.error(`Failed to refresh Zoho access token. Response: ${JSON.stringify(response.data)}`);
                throw new common_1.HttpException('Failed to refresh Zoho access token.', common_1.HttpStatus.UNAUTHORIZED);
            }
        }
        catch (error) {
            this.logger.error(`Error refreshing Zoho access token: ${error.message}`, error.stack);
            if (error.response?.data) {
                this.logger.error(`Zoho error response: ${JSON.stringify(error.response.data)}`);
                throw new common_1.HttpException(`Zoho API error during token refresh: ${error.response.data.error || error.message}`, error.response.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
            throw new common_1.HttpException(`Network or other error refreshing Zoho access token: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async request(method, endpoint, data, params) {
        const accessToken = await this.getAccessToken();
        const url = `${this.getApiBaseUrl()}/${endpoint}`;
        const headers = {
            Authorization: `Zoho-oauthtoken ${accessToken}`,
            'X-Zoho-Organization-Id': this.zohoConfig.organizationId,
            'Content-Type': 'application/json;charset=UTF-8',
        };
        const queryParams = { ...params, organization_id: this.zohoConfig.organizationId };
        const config = {
            method,
            url,
            headers,
            params: queryParams,
        };
        if (data && (method === 'POST' || method === 'PUT')) {
            config.data = data;
        }
        this.logger.debug(`Making Zoho API request: ${method} ${url} with params: ${JSON.stringify(queryParams)}`);
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.request(config));
            return response;
        }
        catch (error) {
            const axiosError = error;
            this.logger.error(`Zoho API request failed: ${method} ${url} - Status: ${axiosError.response?.status} - Response: ${JSON.stringify(axiosError.response?.data)}`, axiosError.stack);
            if (axiosError.response?.status === 401) {
                this.logger.warn('Zoho API returned 401. Attempting token refresh.');
                try {
                    await this.refreshAccessToken();
                    this.logger.log('Retrying Zoho API request after token refresh.');
                    const newAccessToken = await this.getAccessToken();
                    config.headers.Authorization = `Zoho-oauthtoken ${newAccessToken}`;
                    const retryResponse = await (0, rxjs_1.firstValueFrom)(this.httpService.request(config));
                    return retryResponse;
                }
                catch (refreshError) {
                    this.logger.error('Failed to refresh token or retry request after 401.', refreshError.stack);
                    throw new common_1.HttpException(`Zoho API authentication failed after retry: ${refreshError.message}`, common_1.HttpStatus.UNAUTHORIZED);
                }
            }
            let errorMessage = 'Error interacting with Zoho API';
            let errorStatus = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
            if (axiosError.response) {
                const zohoError = axiosError.response.data;
                errorMessage = zohoError.message || JSON.stringify(zohoError);
                errorStatus = axiosError.response.status;
            }
            else if (axiosError.request) {
                errorMessage = 'No response received from Zoho API';
                errorStatus = common_1.HttpStatus.SERVICE_UNAVAILABLE;
            }
            else {
                errorMessage = axiosError.message;
            }
            throw new common_1.HttpException(errorMessage, errorStatus);
        }
    }
    async get(endpoint, params) {
        return this.request('GET', endpoint, undefined, params);
    }
    async post(endpoint, data, params) {
        return this.request('POST', endpoint, data, params);
    }
    async put(endpoint, data, params) {
        return this.request('PUT', endpoint, data, params);
    }
    async delete(endpoint, params) {
        return this.request('DELETE', endpoint, undefined, params);
    }
};
exports.ZohoClient = ZohoClient;
exports.ZohoClient = ZohoClient = ZohoClient_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        config_1.ConfigService])
], ZohoClient);
//# sourceMappingURL=zoho.client.js.map