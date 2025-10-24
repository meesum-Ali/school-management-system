import { CustomField } from "./contact.entity";
interface InvoiceAllocated {
    invoice_id: string;
    invoice_number: string;
    invoice_date: string;
    amount_applied: number;
    tax_amount_withheld?: number;
    total: number;
    balance: number;
}
interface BankCharge {
    bankcharge_id: string;
    account_id: string;
    account_name: string;
    amount: number;
    tax_id?: string;
    tax_name?: string;
    tax_percentage?: number;
    tax_amount?: number;
}
export interface CustomerPayment {
    payment_id: string;
    customer_id: string;
    customer_name: string;
    payment_number: string;
    payment_mode: string;
    payment_mode_formatted?: string;
    date: string;
    account_id?: string;
    account_name?: string;
    exchange_rate?: number;
    amount: number;
    bcy_amount?: number;
    unused_amount?: number;
    reference_number?: string;
    description?: string;
    invoices?: InvoiceAllocated[];
    bank_charges?: BankCharge[];
    currency_id: string;
    currency_code: string;
    currency_symbol: string;
    custom_fields?: CustomField[];
    created_time?: string;
    last_modified_time?: string;
}
export interface ZohoPaymentResponse {
    code: number;
    message: string;
    payment: CustomerPayment;
}
export interface ZohoPaymentsListResponse {
    code: number;
    message: string;
    customerpayments: CustomerPayment[];
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
