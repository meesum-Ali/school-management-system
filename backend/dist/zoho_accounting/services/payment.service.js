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
var PaymentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const common_1 = require("@nestjs/common");
const zoho_client_1 = require("../client/zoho.client");
let PaymentService = PaymentService_1 = class PaymentService {
    constructor(zohoClient) {
        this.zohoClient = zohoClient;
        this.logger = new common_1.Logger(PaymentService_1.name);
        this.endpoint = 'customerpayments';
    }
    async recordPayment(paymentDto) {
        this.logger.log(`Attempting to record payment for customer ID: ${paymentDto.customer_id} of amount ${paymentDto.amount}`);
        try {
            const response = await this.zohoClient.post(this.endpoint, paymentDto);
            if (response.data && response.data.payment) {
                this.logger.log(`Successfully recorded payment with ID: ${response.data.payment.payment_id}`);
                return response.data.payment;
            }
            else {
                this.logger.error(`Failed to record payment. Unexpected response structure: ${JSON.stringify(response.data)}`);
                throw new Error('Failed to record payment due to unexpected response structure.');
            }
        }
        catch (error) {
            this.logger.error(`Error recording payment for customer ${paymentDto.customer_id}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getPayment(paymentId) {
        this.logger.log(`Attempting to retrieve payment with ID: ${paymentId}`);
        try {
            const response = await this.zohoClient.get(`${this.endpoint}/${paymentId}`);
            if (response.data && response.data.payment) {
                return response.data.payment;
            }
            this.logger.warn(`Payment with ID ${paymentId} not found or error in response.`);
            return null;
        }
        catch (error) {
            if (error.status === 404) {
                this.logger.warn(`Payment with ID ${paymentId} not found (404).`);
                return null;
            }
            this.logger.error(`Error retrieving payment ${paymentId}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async listPayments(params) {
        this.logger.log(`Attempting to list payments with params: ${JSON.stringify(params)}`);
        try {
            const response = await this.zohoClient.get(this.endpoint, params);
            if (response.data && response.data.customerpayments) {
                return response.data.customerpayments;
            }
            else {
                this.logger.warn(`No payments found or unexpected response structure: ${JSON.stringify(response.data)}`);
                return [];
            }
        }
        catch (error) {
            this.logger.error(`Error listing payments: ${error.message}`, error.stack);
            throw error;
        }
    }
    async updatePayment(paymentId, updateDto) {
        this.logger.log(`Attempting to update payment with ID: ${paymentId}`);
        try {
            const response = await this.zohoClient.put(`${this.endpoint}/${paymentId}`, updateDto);
            if (response.data && response.data.payment) {
                this.logger.log(`Successfully updated payment with ID: ${response.data.payment.payment_id}`);
                return response.data.payment;
            }
            else {
                this.logger.error(`Failed to update payment. Unexpected response structure: ${JSON.stringify(response.data)}`);
                throw new Error('Failed to update payment due to unexpected response structure.');
            }
        }
        catch (error) {
            this.logger.error(`Error updating payment ${paymentId}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async deletePayment(paymentId) {
        this.logger.log(`Attempting to delete payment with ID: ${paymentId}`);
        try {
            await this.zohoClient.delete(`${this.endpoint}/${paymentId}`);
            this.logger.log(`Successfully deleted payment with ID: ${paymentId} (or request accepted)`);
            return true;
        }
        catch (error) {
            if (error.status === 404) {
                this.logger.warn(`Payment with ID ${paymentId} not found for deletion (404).`);
                return false;
            }
            this.logger.error(`Error deleting payment ${paymentId}: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.PaymentService = PaymentService;
exports.PaymentService = PaymentService = PaymentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [zoho_client_1.ZohoClient])
], PaymentService);
//# sourceMappingURL=payment.service.js.map