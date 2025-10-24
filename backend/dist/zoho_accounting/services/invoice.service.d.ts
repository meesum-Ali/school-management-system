import { ZohoClient } from '../client/zoho.client';
import { CreateInvoiceDto } from '../dto/create-invoice.dto';
import { Invoice } from '../entities/invoice.entity';
export declare class InvoiceService {
    private readonly zohoClient;
    private readonly logger;
    private readonly endpoint;
    constructor(zohoClient: ZohoClient);
    createInvoice(invoiceDto: CreateInvoiceDto): Promise<Invoice>;
    getInvoice(invoiceId: string): Promise<Invoice | null>;
    listInvoices(params?: Record<string, any>): Promise<Invoice[]>;
    updateInvoice(invoiceId: string, updateDto: Partial<CreateInvoiceDto>): Promise<Invoice>;
    deleteInvoice(invoiceId: string): Promise<boolean>;
    emailInvoice(invoiceId: string, emailDto?: any): Promise<boolean>;
    markAsSent(invoiceId: string): Promise<Invoice>;
    voidInvoice(invoiceId: string): Promise<Invoice>;
}
