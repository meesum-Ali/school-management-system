export declare class InvoicePaymentDto {
    invoice_id: string;
    amount_applied: number;
    tax_amount_withheld?: number;
}
export declare class CreatePaymentDto {
    customer_id: string;
    payment_mode: string;
    amount: number;
    date: string;
    reference_number?: string;
    description?: string;
    bank_charges?: number;
    account_id?: string;
    invoices?: InvoicePaymentDto[];
    exchange_rate?: number;
    custom_fields?: Array<{
        customfield_id: string;
        value: string | number | boolean;
    }>;
}
