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
var InvoiceService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceService = void 0;
const common_1 = require("@nestjs/common");
const zoho_client_1 = require("../client/zoho.client");
let InvoiceService = InvoiceService_1 = class InvoiceService {
    constructor(zohoClient) {
        this.zohoClient = zohoClient;
        this.logger = new common_1.Logger(InvoiceService_1.name);
        this.endpoint = 'invoices';
    }
    async createInvoice(invoiceDto) {
        this.logger.log(`Attempting to create invoice for customer ID: ${invoiceDto.customer_id}`);
        try {
            const response = await this.zohoClient.post(this.endpoint, invoiceDto);
            if (response.data && response.data.invoice) {
                this.logger.log(`Successfully created invoice with ID: ${response.data.invoice.invoice_id}`);
                return response.data.invoice;
            }
            else {
                this.logger.error(`Failed to create invoice. Unexpected response structure: ${JSON.stringify(response.data)}`);
                throw new Error('Failed to create invoice due to unexpected response structure.');
            }
        }
        catch (error) {
            this.logger.error(`Error creating invoice for customer ${invoiceDto.customer_id}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getInvoice(invoiceId) {
        this.logger.log(`Attempting to retrieve invoice with ID: ${invoiceId}`);
        try {
            const response = await this.zohoClient.get(`${this.endpoint}/${invoiceId}`);
            if (response.data && response.data.invoice) {
                return response.data.invoice;
            }
            this.logger.warn(`Invoice with ID ${invoiceId} not found or error in response.`);
            return null;
        }
        catch (error) {
            if (error.status === 404) {
                this.logger.warn(`Invoice with ID ${invoiceId} not found (404).`);
                return null;
            }
            this.logger.error(`Error retrieving invoice ${invoiceId}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async listInvoices(params) {
        this.logger.log(`Attempting to list invoices with params: ${JSON.stringify(params)}`);
        try {
            const response = await this.zohoClient.get(this.endpoint, params);
            if (response.data && response.data.invoices) {
                return response.data.invoices;
            }
            else {
                this.logger.warn(`No invoices found or unexpected response structure: ${JSON.stringify(response.data)}`);
                return [];
            }
        }
        catch (error) {
            this.logger.error(`Error listing invoices: ${error.message}`, error.stack);
            throw error;
        }
    }
    async updateInvoice(invoiceId, updateDto) {
        this.logger.log(`Attempting to update invoice with ID: ${invoiceId}`);
        try {
            const response = await this.zohoClient.put(`${this.endpoint}/${invoiceId}`, updateDto);
            if (response.data && response.data.invoice) {
                this.logger.log(`Successfully updated invoice with ID: ${response.data.invoice.invoice_id}`);
                return response.data.invoice;
            }
            else {
                this.logger.error(`Failed to update invoice. Unexpected response structure: ${JSON.stringify(response.data)}`);
                throw new Error('Failed to update invoice due to unexpected response structure.');
            }
        }
        catch (error) {
            this.logger.error(`Error updating invoice ${invoiceId}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async deleteInvoice(invoiceId) {
        this.logger.log(`Attempting to delete invoice with ID: ${invoiceId}`);
        try {
            await this.zohoClient.delete(`${this.endpoint}/${invoiceId}`);
            this.logger.log(`Successfully deleted invoice with ID: ${invoiceId} (or request accepted)`);
            return true;
        }
        catch (error) {
            if (error.status === 404) {
                this.logger.warn(`Invoice with ID ${invoiceId} not found for deletion (404).`);
                return false;
            }
            this.logger.error(`Error deleting invoice ${invoiceId}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async emailInvoice(invoiceId, emailDto) {
        this.logger.log(`Attempting to email invoice with ID: ${invoiceId}`);
        try {
            const response = await this.zohoClient.post(`${this.endpoint}/${invoiceId}/email`, emailDto || {});
            if (response.data && response.data.code === 0 && response.data.message === 'success') {
                this.logger.log(`Successfully sent email for invoice ID: ${invoiceId}. Message: ${response.data.message}`);
                return true;
            }
            this.logger.warn(`Emailing invoice ${invoiceId} may not have been successful or message was unexpected: ${JSON.stringify(response.data)}`);
            return response.data && response.data.code === 0;
        }
        catch (error) {
            this.logger.error(`Error emailing invoice ${invoiceId}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async markAsSent(invoiceId) {
        this.logger.log(`Attempting to mark invoice ${invoiceId} as sent.`);
        try {
            const response = await this.zohoClient.post(`${this.endpoint}/${invoiceId}/status/sent`, {});
            if (response.data && response.data.invoice) {
                this.logger.log(`Invoice ${invoiceId} marked as sent.`);
                return response.data.invoice;
            }
            else if (response.data && response.data.code === 0) {
                this.logger.log(`Invoice ${invoiceId} status change to sent successful (message: ${response.data.message}). Fetching updated invoice.`);
                return this.getInvoice(invoiceId);
            }
            this.logger.error(`Failed to mark invoice ${invoiceId} as sent. Unexpected response: ${JSON.stringify(response.data)}`);
            throw new Error('Failed to mark invoice as sent due to unexpected response structure.');
        }
        catch (error) {
            this.logger.error(`Error marking invoice ${invoiceId} as sent: ${error.message}`, error.stack);
            throw error;
        }
    }
    async voidInvoice(invoiceId) {
        this.logger.log(`Attempting to void invoice ${invoiceId}.`);
        try {
            const response = await this.zohoClient.post(`${this.endpoint}/${invoiceId}/status/void`, {});
            if (response.data && response.data.invoice) {
                this.logger.log(`Invoice ${invoiceId} voided.`);
                return response.data.invoice;
            }
            else if (response.data && response.data.code === 0) {
                this.logger.log(`Invoice ${invoiceId} status change to void successful (message: ${response.data.message}). Fetching updated invoice.`);
                return this.getInvoice(invoiceId);
            }
            this.logger.error(`Failed to void invoice ${invoiceId}. Unexpected response: ${JSON.stringify(response.data)}`);
            throw new Error('Failed to void invoice due to unexpected response structure.');
        }
        catch (error) {
            this.logger.error(`Error voiding invoice ${invoiceId}: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.InvoiceService = InvoiceService;
exports.InvoiceService = InvoiceService = InvoiceService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [zoho_client_1.ZohoClient])
], InvoiceService);
//# sourceMappingURL=invoice.service.js.map