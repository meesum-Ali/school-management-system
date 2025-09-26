import { Test, TestingModule } from '@nestjs/testing';
import { ZohoClient } from './zoho.client';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of, throwError } from 'rxjs';
import { HttpException, HttpStatus } from '@nestjs/common';
import { AxiosError, AxiosResponse } from 'axios';

// Mock data and services
const mockConfigService = {
  get: jest.fn((key: string, defaultValue?: any) => {
    switch (key) {
      case 'ZOHO_REGION':
        return 'com';
      case 'ZOHO_CLIENT_ID':
        return 'test_client_id';
      case 'ZOHO_CLIENT_SECRET':
        return 'test_client_secret';
      case 'ZOHO_REDIRECT_URI':
        return 'test_redirect_uri';
      case 'ZOHO_ORGANIZATION_ID':
        return 'test_org_id';
      case 'ZOHO_REFRESH_TOKEN':
        return 'test_refresh_token';
      case 'ZOHO_ACCESS_TOKEN':
        return 'test_access_token';
      default:
        return defaultValue;
    }
  }),
};

const mockHttpService = {
  post: jest.fn(),
  request: jest.fn(),
  get: jest.fn(), // Added for consistency if direct get is used, though `request` is primary
};

describe('ZohoClient', () => {
  let client: ZohoClient;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ZohoClient,
        { provide: HttpService, useValue: mockHttpService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    client = module.get<ZohoClient>(ZohoClient);
    httpService = module.get<HttpService>(HttpService);
    jest.clearAllMocks(); // Clear mocks before each test
  });

  it('should be defined', () => {
    expect(client).toBeDefined();
  });

  describe('Constructor', () => {
    it('should initialize with config values', () => {
      expect(client['zohoConfig'].region).toBe('com');
      expect(client['zohoConfig'].clientId).toBe('test_client_id');
      expect(client['zohoConfig'].organizationId).toBe('test_org_id');
    });

    it('should throw error if essential config is missing', () => {
      const tempConfigService = {
        get: jest.fn((key: string) => {
          if (key === 'ZOHO_CLIENT_ID') return undefined;
          return 'test_value';
        }),
      };
      expect(
        () => new ZohoClient(mockHttpService as any, tempConfigService as any),
      ).toThrow('Zoho API configuration is incomplete.');
    });
  });

  describe('getApiBaseUrl', () => {
    it('should return correct API base URL', () => {
      expect(client['getApiBaseUrl']()).toBe('https://www.zohoapis.com/books/v3');
    });
  });

  describe('getAccountsBaseUrl', () => {
    it('should return correct Accounts base URL', () => {
      expect(client['getAccountsBaseUrl']()).toBe('https://accounts.zoho.com');
    });
  });

  describe('refreshAccessToken', () => {
    it('should refresh token successfully', async () => {
      const mockTokenResponse = {
        data: {
          access_token: 'new_access_token',
          api_domain: 'https://www.zohoapis.com',
          token_type: 'Bearer',
          expires_in: 3600,
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };
      mockHttpService.post.mockReturnValue(of(mockTokenResponse));

      const newToken = await client.refreshAccessToken();
      expect(newToken).toBe('new_access_token');
      expect(client['zohoConfig'].accessToken).toBe('new_access_token');
      expect(mockHttpService.post).toHaveBeenCalledWith(
        'https://accounts.zoho.com/oauth/v2/token',
        expect.any(URLSearchParams),
        expect.objectContaining({
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }),
      );
    });

    it('should throw error if refresh token is missing', async () => {
       // Override ZOHO_REFRESH_TOKEN for this specific test case
      const originalGet = mockConfigService.get;
      mockConfigService.get = jest.fn((key: string, defaultValue?: any) => {
        if (key === 'ZOHO_REFRESH_TOKEN') return null;
        return originalGet(key, defaultValue);
      });

      // Re-initialize client with modified config for this test
      const tempClient = new ZohoClient(httpService, mockConfigService as any);

      await expect(tempClient.refreshAccessToken()).rejects.toThrow(
        new HttpException('Zoho refresh token is not available.', HttpStatus.UNAUTHORIZED),
      );
      mockConfigService.get = originalGet; // Restore original mock
    });

    it('should throw error if API call fails during refresh', async () => {
      mockHttpService.post.mockReturnValue(
        throwError(() => new AxiosError(
          'Network Error',
          'ECONNREFUSED',
          {} as any,
          null,
          { status: 500, data: { error: 'failed' } } as any)
        )
      );
      await expect(client.refreshAccessToken()).rejects.toThrow(HttpException);
    });
  });


  describe('request', () => {
    beforeEach(() => {
       // Ensure access token is set for most request tests
      client['zohoConfig'].accessToken = 'initial_access_token';
      client['zohoConfig'].refreshToken = 'initial_refresh_token'; // Ensure refresh token is available
    });

    it('should make a successful GET request', async () => {
      const mockApiResponse = { data: { id: '123', name: 'Test Item' }, status: 200, statusText: 'OK', headers: {}, config: {} as any };
      mockHttpService.request.mockReturnValue(of(mockApiResponse));

      const response = await client.get<{ id: string; name: string }>('items/123');

      expect(response.data.name).toBe('Test Item');
      expect(mockHttpService.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: 'https://www.zohoapis.com/books/v3/items/123',
          headers: expect.objectContaining({
            Authorization: 'Zoho-oauthtoken initial_access_token',
            'Content-Type': 'application/json;charset=UTF-8',
          }),
          params: { organization_id: 'test_org_id' },
        }),
      );
    });

    it('should make a successful POST request', async () => {
      const postData = { name: 'New Item' };
      const mockApiResponse: AxiosResponse = { data: { id: '456', ...postData }, status: 201, statusText: 'Created', headers: {}, config: {} as any };
      mockHttpService.request.mockReturnValue(of(mockApiResponse));

      const response = await client.post<{id: string, name: string}>('items', postData);
      expect(response.data.id).toBe('456');
      expect(mockHttpService.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: 'https://www.zohoapis.com/books/v3/items',
          data: postData,
          headers: expect.objectContaining({
            Authorization: 'Zoho-oauthtoken initial_access_token',
          }),
          params: { organization_id: 'test_org_id' },
        }),
      );
    });

    it('should attempt token refresh on 401 and retry request', async () => {
      const errorResponse: AxiosError = {
        isAxiosError: true,
        name: 'AxiosError',
        message: 'Request failed with status code 401',
        config: {} as any,
        response: { data: { message: 'Unauthorized' }, status: 401, statusText: 'Unauthorized', headers: {}, config: {} as any },
        toJSON: () => ({}),
      };
      const successResponse: AxiosResponse = { data: { id: '123' }, status: 200, statusText: 'OK', headers: {}, config: {} as any };
      const refreshTokenResponse: AxiosResponse = {
        data: { access_token: 'new_refreshed_token', expires_in: 3600, token_type: 'Bearer' },
        status: 200, statusText: 'OK', headers: {}, config: {} as any
      };

      // First call to request (original) -> 401
      mockHttpService.request.mockReturnValueOnce(throwError(() => errorResponse));
      // Call to httpService.post for token refresh
      mockHttpService.post.mockReturnValueOnce(of(refreshTokenResponse));
      // Second call to request (retry) -> success
      mockHttpService.request.mockReturnValueOnce(of(successResponse));

      const response = await client.get<{id: string, name: string}>('items/123');
      expect(response.data.id).toBe('123');
      expect(client['zohoConfig'].accessToken).toBe('new_refreshed_token');
      expect(mockHttpService.post).toHaveBeenCalledTimes(1); // Token refresh
      expect(mockHttpService.request).toHaveBeenCalledTimes(2); // Original + Retry
    });


    it('should throw HttpException if API returns non-401 error', async () => {
      const errorResponse: AxiosError = {
        isAxiosError: true,
        name: 'AxiosError',
        message: 'Request failed with status code 500',
        config: {} as any,
        response: { data: { message: 'Server Error' }, status: 500, statusText: 'Internal Server Error', headers: {}, config: {} as any },
        toJSON: () => ({}),
      };
      mockHttpService.request.mockReturnValue(throwError(() => errorResponse));

      await expect(client.get('items/error')).rejects.toThrow(
        new HttpException('Server Error', HttpStatus.INTERNAL_SERVER_ERROR),
      );
    });

    it('should throw HttpException if token refresh fails after 401', async () => {
      const error401: AxiosError = {
        isAxiosError: true, name: 'AxiosError', message: 'Request failed with status code 401', config: {} as any,
        response: { data: { message: 'Unauthorized' }, status: 401, statusText: 'Unauthorized', headers: {}, config: {} as any },
        toJSON: () => ({}),
      };
      const refreshError: AxiosError = {
        isAxiosError: true, name: 'AxiosError', message: 'Refresh failed', config: {} as any,
        response: { data: { error: 'invalid_grant' }, status: 400, statusText: 'Bad Request', headers: {}, config: {} as any },
        toJSON: () => ({}),
      };

      mockHttpService.request.mockReturnValueOnce(throwError(() => error401)); // Initial request fails with 401
      mockHttpService.post.mockReturnValueOnce(throwError(() => refreshError));    // Token refresh fails

      await expect(client.get('items/123')).rejects.toThrow(
         new HttpException('Zoho API authentication failed after retry: Zoho API error during token refresh: invalid_grant', HttpStatus.UNAUTHORIZED)
      );
      expect(mockHttpService.request).toHaveBeenCalledTimes(1);
      expect(mockHttpService.post).toHaveBeenCalledTimes(1);
    });
  });

  // TODO: Add more tests for PUT, DELETE, different error scenarios, etc.
});