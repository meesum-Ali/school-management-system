import { ContactService } from './services/contact.service';
import { InvoiceService } from './services/invoice.service';
import { PaymentService } from './services/payment.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { Contact } from './entities/contact.entity';
import { Invoice } from './entities/invoice.entity';
import { CustomerPayment } from './entities/payment.entity';
export declare class ZohoAccountingService {
    readonly contacts: ContactService;
    readonly invoices: InvoiceService;
    readonly payments: PaymentService;
    private readonly logger;
    constructor(contacts: ContactService, invoices: InvoiceService, payments: PaymentService);
    createCustomerAndInvoice(contactDto: CreateContactDto, invoiceDtoWithoutCustomerId: Omit<CreateInvoiceDto, 'customer_id'>): Promise<{
        contact: Contact;
        invoice: Invoice;
    }>;
    payInvoice(customerId: string, invoiceId: string, paymentAmount: number, paymentDate: string, paymentMode: string, referenceNumber?: string, depositToAccountId?: string): Promise<CustomerPayment>;
}
