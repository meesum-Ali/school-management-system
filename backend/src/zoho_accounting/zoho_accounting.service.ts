import { Injectable, Logger } from '@nestjs/common';
import { ContactService } from './services/contact.service';
import { InvoiceService } from './services/invoice.service';
import { PaymentService } from './services/payment.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Contact } from './entities/contact.entity';
import { Invoice } from './entities/invoice.entity';
import { CustomerPayment } from './entities/payment.entity';

@Injectable()
export class ZohoAccountingService {
  private readonly logger = new Logger(ZohoAccountingService.name);

  constructor(
    public readonly contacts: ContactService, // Public for direct access if needed
    public readonly invoices: InvoiceService, // Public for direct access if needed
    public readonly payments: PaymentService, // Public for direct access if needed
  ) {}

  // Example of a higher-level business workflow:
  // Create a customer, then immediately create an invoice for them.
  async createCustomerAndInvoice(
    contactDto: CreateContactDto,
    invoiceDtoWithoutCustomerId: Omit<CreateInvoiceDto, 'customer_id'>,
  ): Promise<{ contact: Contact; invoice: Invoice }> {
    this.logger.log(
      `Workflow: Creating customer ${contactDto.contact_name} and an initial invoice.`,
    );

    const contact = await this.contacts.createContact(contactDto);
    if (!contact || !contact.contact_id) {
      this.logger.error('Failed to create contact in the workflow.');
      throw new Error(
        'Failed to create contact during customer and invoice creation workflow.',
      );
    }
    this.logger.log(
      `Workflow: Customer ${contact.contact_name} (ID: ${contact.contact_id}) created.`,
    );

    const invoiceDtoWithCustomerId: CreateInvoiceDto = {
      ...invoiceDtoWithoutCustomerId,
      customer_id: contact.contact_id,
    };

    const invoice = await this.invoices.createInvoice(invoiceDtoWithCustomerId);
    if (!invoice || !invoice.invoice_id) {
      this.logger.error(
        `Failed to create invoice for contact ID ${contact.contact_id} in the workflow.`,
      );
      // Potentially: consider rolling back contact creation or marking it for review
      throw new Error(
        'Failed to create invoice during customer and invoice creation workflow.',
      );
    }
    this.logger.log(
      `Workflow: Invoice ${invoice.invoice_number} (ID: ${invoice.invoice_id}) created for customer ${contact.contact_name}.`,
    );

    return { contact, invoice };
  }

  // Example: Record a payment and apply it fully to a single specified invoice.
  async payInvoice(
    customerId: string,
    invoiceId: string,
    paymentAmount: number,
    paymentDate: string, // YYYY-MM-DD
    paymentMode: string,
    referenceNumber?: string,
    depositToAccountId?: string, // Optional: Zoho account_id for deposit
  ): Promise<CustomerPayment> {
    this.logger.log(
      `Workflow: Recording payment of ${paymentAmount} for invoice ${invoiceId} by customer ${customerId}.`,
    );

    const paymentDto: CreatePaymentDto = {
      customer_id: customerId,
      payment_mode: paymentMode,
      amount: paymentAmount,
      date: paymentDate,
      reference_number: referenceNumber,
      account_id: depositToAccountId,
      invoices: [
        {
          invoice_id: invoiceId,
          amount_applied: paymentAmount,
        },
      ],
    };

    const payment = await this.payments.recordPayment(paymentDto);
    this.logger.log(
      `Workflow: Payment ${payment.payment_number} (ID: ${payment.payment_id}) recorded and applied.`,
    );
    return payment;
  }

  // Add other complex workflows as needed.
  // For example, handling student enrollment, fee generation, and payment tracking.
  // async enrollStudentAndGenerateFee(studentData: any, feeSchedule: any) {
  //   // 1. Create/update contact in Zoho from studentData
  //   // 2. Create invoice in Zoho based on feeSchedule
  //   // 3. Potentially link internal student ID with Zoho contact ID
  // }
}
