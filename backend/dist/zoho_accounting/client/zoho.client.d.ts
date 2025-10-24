import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';
export declare class ZohoClient {
    private readonly httpService;
    private readonly configService;
    private readonly logger;
    private zohoConfig;
    private readonly ZOHO_ACCOUNTS_BASE_URL;
    private readonly ZOHO_API_BASE_URL;
    constructor(httpService: HttpService, configService: ConfigService);
    private getApiBaseUrl;
    private getAccountsBaseUrl;
    private getAccessToken;
    refreshAccessToken(): Promise<string>;
    request<T>(method: 'GET' | 'POST' | 'PUT' | 'DELETE', endpoint: string, data?: any, params?: Record<string, any>): Promise<AxiosResponse<T>>;
    get<T>(endpoint: string, params?: Record<string, any>): Promise<AxiosResponse<T>>;
    post<T>(endpoint: string, data: any, params?: Record<string, any>): Promise<AxiosResponse<T>>;
    put<T>(endpoint: string, data: any, params?: Record<string, any>): Promise<AxiosResponse<T>>;
    delete<T>(endpoint: string, params?: Record<string, any>): Promise<AxiosResponse<T>>;
}
