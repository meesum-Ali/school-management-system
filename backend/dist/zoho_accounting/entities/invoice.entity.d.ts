import { CustomField } from './contact.entity';
interface Address {
    address: string;
    city: string;
    state?: string;
    zip: string;
    country: string;
    attention?: string;
}
export interface InvoiceLineItem {
    line_item_id: string;
    item_id?: string;
    project_id?: string;
    name?: string;
    item_name?: string;
    description?: string;
    item_order?: number;
    bcy_rate?: number;
    rate: number;
    quantity: number;
    unit?: string;
    discount_amount?: number;
    discount?: string;
    tax_id?: string;
    tax_name?: string;
    tax_type?: string;
    tax_percentage?: number;
    item_total?: number;
    account_id?: string;
    account_name?: string;
}
interface PaymentGateway {
    configured: boolean;
    additional_field1: string;
    gateway_name: string;
}
interface PaymentOptions {
    payment_gateways: PaymentGateway[];
}
export interface Invoice {
    invoice_id: string;
    invoice_number: string;
    customer_id: string;
    customer_name: string;
    status: string;
    date: string;
    due_date: string;
    due_days?: string | number;
    currency_id: string;
    currency_code: string;
    currency_symbol: string;
    exchange_rate?: number;
    reference_number?: string;
    line_items: InvoiceLineItem[];
    sub_total?: number;
    discount_total?: number;
    tax_total?: number;
    total: number;
    balance: number;
    payments_applied?: number;
    write_off_amount?: number;
    credits_applied?: number;
    notes?: string;
    terms?: string;
    payment_options?: PaymentOptions;
    is_emailed?: boolean;
    reminders_sent?: number;
    last_payment_date?: string;
    billing_address?: Address;
    shipping_address?: Address;
    contact_persons?: string[];
    salesperson_id?: string;
    salesperson_name?: string;
    custom_fields?: CustomField[];
    template_id?: string;
    template_name?: string;
    template_type?: string;
    created_time?: string;
    last_modified_time?: string;
    is_viewed_by_client?: boolean;
    client_viewed_time?: string;
}
export interface ZohoInvoiceResponse {
    code: number;
    message: string;
    invoice: Invoice;
}
export interface ZohoInvoicesListResponse {
    code: number;
    message: string;
    invoices: Invoice[];
    page_context?: {
        page: number;
        per_page: number;
        has_more_page: boolean;
        report_name: string;
        applied_filter: string;
        sort_column: string;
        sort_order: string;
    };
}
export {};
