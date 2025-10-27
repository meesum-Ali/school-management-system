import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ZohoClient } from '../client/zoho.client';
import { CreateInvoiceDto } from '../dto/create-invoice.dto';
import {
  Invoice,
  ZohoInvoiceResponse,
  ZohoInvoicesListResponse,
} from '../entities/invoice.entity';
import { AxiosResponse } from 'axios';

@Injectable()
export class InvoiceService {
  private readonly logger = new Logger(InvoiceService.name);
  private readonly endpoint = 'invoices';

  constructor(private readonly zohoClient: ZohoClient) {}

  /**
   * Creates a new invoice in Zoho Books.
   * @param invoiceDto - The data for creating the invoice.
   * @returns A promise that resolves to the created Invoice entity.
   * @throws HttpException if the API request fails or the response structure is unexpected.
   */
  async createInvoice(invoiceDto: CreateInvoiceDto): Promise<Invoice> {
    this.logger.log(
      `Attempting to create invoice for customer ID: ${invoiceDto.customer_id}`,
    );
    try {
      const response: AxiosResponse<ZohoInvoiceResponse> =
        await this.zohoClient.post<ZohoInvoiceResponse>(
          this.endpoint,
          invoiceDto,
        );
      if (response.data && response.data.invoice) {
        this.logger.log(
          `Successfully created invoice with ID: ${response.data.invoice.invoice_id}`,
        );
        return response.data.invoice;
      } else {
        this.logger.error(
          `Failed to create invoice. Unexpected response structure: ${JSON.stringify(response.data)}`,
        );
        throw new Error(
          'Failed to create invoice due to unexpected response structure.',
        );
      }
    } catch (error) {
      this.logger.error(
        `Error creating invoice for customer ${invoiceDto.customer_id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Retrieves a specific invoice from Zoho Books by its ID.
   * @param invoiceId - The ID of the invoice to retrieve.
   * @returns A promise that resolves to the Invoice entity if found, otherwise null.
   * @throws HttpException if the API request fails (other than 404).
   */
  async getInvoice(invoiceId: string): Promise<Invoice | null> {
    this.logger.log(`Attempting to retrieve invoice with ID: ${invoiceId}`);
    try {
      const response: AxiosResponse<ZohoInvoiceResponse> =
        await this.zohoClient.get<ZohoInvoiceResponse>(
          `${this.endpoint}/${invoiceId}`,
        );
      if (response.data && response.data.invoice) {
        return response.data.invoice;
      }
      this.logger.warn(
        `Invoice with ID ${invoiceId} not found or error in response.`,
      );
      return null;
    } catch (error) {
      if (error.status === 404) {
        this.logger.warn(`Invoice with ID ${invoiceId} not found (404).`);
        return null;
      }
      this.logger.error(
        `Error retrieving invoice ${invoiceId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Lists invoices from Zoho Books.
   * @param params - Optional query parameters to filter the list (e.g., { customer_id: '123', status: 'sent' }).
   * Refer to Zoho API documentation for available filter options.
   * @returns A promise that resolves to an array of Invoice entities.
   * @throws HttpException if the API request fails.
   */
  async listInvoices(params?: Record<string, any>): Promise<Invoice[]> {
    this.logger.log(
      `Attempting to list invoices with params: ${JSON.stringify(params)}`,
    );
    // Example params: { customer_id: '12345', status: 'sent', date_after: '2023-01-01' }
    try {
      const response: AxiosResponse<ZohoInvoicesListResponse> =
        await this.zohoClient.get<ZohoInvoicesListResponse>(
          this.endpoint,
          params,
        );
      if (response.data && response.data.invoices) {
        return response.data.invoices;
      } else {
        this.logger.warn(
          `No invoices found or unexpected response structure: ${JSON.stringify(response.data)}`,
        );
        return [];
      }
    } catch (error) {
      this.logger.error(
        `Error listing invoices: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Updates an existing invoice in Zoho Books.
   * @param invoiceId - The ID of the invoice to update.
   * @param updateDto - An object containing the fields to update.
   * @returns A promise that resolves to the updated Invoice entity.
   * @throws HttpException if the API request fails or the response structure is unexpected.
   */
  async updateInvoice(
    invoiceId: string,
    updateDto: Partial<CreateInvoiceDto>,
  ): Promise<Invoice> {
    this.logger.log(`Attempting to update invoice with ID: ${invoiceId}`);
    try {
      const response: AxiosResponse<ZohoInvoiceResponse> =
        await this.zohoClient.put<ZohoInvoiceResponse>(
          `${this.endpoint}/${invoiceId}`,
          updateDto,
        );
      if (response.data && response.data.invoice) {
        this.logger.log(
          `Successfully updated invoice with ID: ${response.data.invoice.invoice_id}`,
        );
        return response.data.invoice;
      } else {
        this.logger.error(
          `Failed to update invoice. Unexpected response structure: ${JSON.stringify(response.data)}`,
        );
        throw new Error(
          'Failed to update invoice due to unexpected response structure.',
        );
      }
    } catch (error) {
      this.logger.error(
        `Error updating invoice ${invoiceId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async deleteInvoice(invoiceId: string): Promise<boolean> {
    this.logger.log(`Attempting to delete invoice with ID: ${invoiceId}`);
    try {
      await this.zohoClient.delete<any>(`${this.endpoint}/${invoiceId}`);
      this.logger.log(
        `Successfully deleted invoice with ID: ${invoiceId} (or request accepted)`,
      );
      return true;
    } catch (error) {
      if (error.status === 404) {
        this.logger.warn(
          `Invoice with ID ${invoiceId} not found for deletion (404).`,
        );
        return false;
      }
      this.logger.error(
        `Error deleting invoice ${invoiceId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async emailInvoice(invoiceId: string, emailDto?: any): Promise<boolean> {
    // emailDto might contain: { send_from_org_email_id: true, to_mail_ids: ["test@example.com"], subject: "Invoice", body: "Please find attached" }
    // If emailDto is not provided, Zoho typically uses default templates and contact's email.
    this.logger.log(`Attempting to email invoice with ID: ${invoiceId}`);
    try {
      // The 'email' action is often a POST to a sub-endpoint or a specific action parameter.
      // Checking Zoho docs: POST /invoices/{invoice_id}/email
      // The response is usually a success message.
      const response = await this.zohoClient.post<any>(
        `${this.endpoint}/${invoiceId}/email`,
        emailDto || {},
      );
      if (
        response.data &&
        response.data.code === 0 &&
        response.data.message === 'success'
      ) {
        // Common Zoho success indication
        this.logger.log(
          `Successfully sent email for invoice ID: ${invoiceId}. Message: ${response.data.message}`,
        );
        return true;
      }
      this.logger.warn(
        `Emailing invoice ${invoiceId} may not have been successful or message was unexpected: ${JSON.stringify(response.data)}`,
      );
      // Some Zoho actions return success with code 0 even if the message is not "success", check docs for this specific endpoint.
      // Assuming code 0 is the primary success indicator.
      return response.data && response.data.code === 0;
    } catch (error) {
      this.logger.error(
        `Error emailing invoice ${invoiceId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async markAsSent(invoiceId: string): Promise<Invoice> {
    this.logger.log(`Attempting to mark invoice ${invoiceId} as sent.`);
    try {
      const response = await this.zohoClient.post<ZohoInvoiceResponse>(
        `${this.endpoint}/${invoiceId}/status/sent`,
        {},
      );
      if (response.data && response.data.invoice) {
        this.logger.log(`Invoice ${invoiceId} marked as sent.`);
        return response.data.invoice;
      } else if (response.data && response.data.code === 0) {
        // Some status changes might just return a success message
        this.logger.log(
          `Invoice ${invoiceId} status change to sent successful (message: ${response.data.message}). Fetching updated invoice.`,
        );
        return this.getInvoice(invoiceId); // Fetch to get the updated invoice entity
      }
      this.logger.error(
        `Failed to mark invoice ${invoiceId} as sent. Unexpected response: ${JSON.stringify(response.data)}`,
      );
      throw new Error(
        'Failed to mark invoice as sent due to unexpected response structure.',
      );
    } catch (error) {
      this.logger.error(
        `Error marking invoice ${invoiceId} as sent: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async voidInvoice(invoiceId: string): Promise<Invoice> {
    this.logger.log(`Attempting to void invoice ${invoiceId}.`);
    try {
      const response = await this.zohoClient.post<ZohoInvoiceResponse>(
        `${this.endpoint}/${invoiceId}/status/void`,
        {},
      );
      if (response.data && response.data.invoice) {
        this.logger.log(`Invoice ${invoiceId} voided.`);
        return response.data.invoice;
      } else if (response.data && response.data.code === 0) {
        this.logger.log(
          `Invoice ${invoiceId} status change to void successful (message: ${response.data.message}). Fetching updated invoice.`,
        );
        return this.getInvoice(invoiceId);
      }
      this.logger.error(
        `Failed to void invoice ${invoiceId}. Unexpected response: ${JSON.stringify(response.data)}`,
      );
      throw new Error(
        'Failed to void invoice due to unexpected response structure.',
      );
    } catch (error) {
      this.logger.error(
        `Error voiding invoice ${invoiceId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  // Other methods like:
  // - applyPaymentToInvoice (might be part of PaymentService or here)
  // - getInvoiceAsPdf(invoiceId: string)
  // - listInvoicePayments(invoiceId: string)
}
