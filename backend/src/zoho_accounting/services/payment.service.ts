import { Injectable, Logger } from '@nestjs/common';
import { ZohoClient } from '../client/zoho.client';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { CustomerPayment, ZohoPaymentResponse, ZohoPaymentsListResponse } from '../entities/payment.entity';
import { AxiosResponse } from 'axios';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  // Zoho API refers to these as 'customerpayments'
  private readonly endpoint = 'customerpayments';

  constructor(private readonly zohoClient: ZohoClient) {}

  async recordPayment(paymentDto: CreatePaymentDto): Promise<CustomerPayment> {
    this.logger.log(`Attempting to record payment for customer ID: ${paymentDto.customer_id} of amount ${paymentDto.amount}`);
    try {
      const response: AxiosResponse<ZohoPaymentResponse> = await this.zohoClient.post<ZohoPaymentResponse>(
        this.endpoint,
        paymentDto,
      );
      if (response.data && response.data.payment) {
        this.logger.log(`Successfully recorded payment with ID: ${response.data.payment.payment_id}`);
        return response.data.payment;
      } else {
        this.logger.error(`Failed to record payment. Unexpected response structure: ${JSON.stringify(response.data)}`);
        throw new Error('Failed to record payment due to unexpected response structure.');
      }
    } catch (error) {
      this.logger.error(`Error recording payment for customer ${paymentDto.customer_id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getPayment(paymentId: string): Promise<CustomerPayment | null> {
    this.logger.log(`Attempting to retrieve payment with ID: ${paymentId}`);
    try {
      const response: AxiosResponse<ZohoPaymentResponse> = await this.zohoClient.get<ZohoPaymentResponse>(
        `${this.endpoint}/${paymentId}`,
      );
      if (response.data && response.data.payment) {
        return response.data.payment;
      }
      this.logger.warn(`Payment with ID ${paymentId} not found or error in response.`);
      return null;
    } catch (error) {
      if (error.status === 404) {
        this.logger.warn(`Payment with ID ${paymentId} not found (404).`);
        return null;
      }
      this.logger.error(`Error retrieving payment ${paymentId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async listPayments(params?: Record<string, any>): Promise<CustomerPayment[]> {
    this.logger.log(`Attempting to list payments with params: ${JSON.stringify(params)}`);
    // Example params: { customer_id: '12345', payment_mode: 'creditcard', date_after: '2023-01-01' }
    try {
      const response: AxiosResponse<ZohoPaymentsListResponse> = await this.zohoClient.get<ZohoPaymentsListResponse>(
        this.endpoint,
        params,
      );
      // Note: Zoho API uses "customerpayments" as the key in the list response
      if (response.data && response.data.customerpayments) {
        return response.data.customerpayments;
      } else {
        this.logger.warn(`No payments found or unexpected response structure: ${JSON.stringify(response.data)}`);
        return [];
      }
    } catch (error) {
      this.logger.error(`Error listing payments: ${error.message}`, error.stack);
      throw error;
    }
  }

  async updatePayment(paymentId: string, updateDto: Partial<CreatePaymentDto>): Promise<CustomerPayment> {
    this.logger.log(`Attempting to update payment with ID: ${paymentId}`);
    try {
      const response: AxiosResponse<ZohoPaymentResponse> = await this.zohoClient.put<ZohoPaymentResponse>(
        `${this.endpoint}/${paymentId}`,
        updateDto,
      );
      if (response.data && response.data.payment) {
        this.logger.log(`Successfully updated payment with ID: ${response.data.payment.payment_id}`);
        return response.data.payment;
      } else {
        this.logger.error(`Failed to update payment. Unexpected response structure: ${JSON.stringify(response.data)}`);
        throw new Error('Failed to update payment due to unexpected response structure.');
      }
    } catch (error) {
      this.logger.error(`Error updating payment ${paymentId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async deletePayment(paymentId: string): Promise<boolean> {
    this.logger.log(`Attempting to delete payment with ID: ${paymentId}`);
    try {
      await this.zohoClient.delete<any>(`${this.endpoint}/${paymentId}`);
      this.logger.log(`Successfully deleted payment with ID: ${paymentId} (or request accepted)`);
      return true;
    } catch (error) {
      if (error.status === 404) {
        this.logger.warn(`Payment with ID ${paymentId} not found for deletion (404).`);
        return false;
      }
      this.logger.error(`Error deleting payment ${paymentId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  // Additional methods might include:
  // - applyPaymentToInvoices(paymentId: string, invoicesToApply: InvoicePaymentDto[])
  // - listRefundsForPayment(paymentId: string)
}
