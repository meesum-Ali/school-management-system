export declare class InvoiceLineItemDto {
    item_id?: string;
    name: string;
    description?: string;
    rate: number;
    quantity: number;
    unit?: string;
    discount_amount?: number;
    discount?: string;
    tax_id?: string;
    account_id?: string;
}
export declare class CreateInvoiceDto {
    customer_id: string;
    line_items: InvoiceLineItemDto[];
    date?: string;
    due_date?: string;
    reference_number?: string;
    notes?: string;
    terms?: string;
    exchange_rate?: number;
    discount?: number;
    discount_type?: 'entity_level' | 'item_level';
    allow_partial_payments?: boolean;
    template_id?: string;
    custom_fields?: Array<{
        customfield_id: string;
        value: string | number | boolean;
    }>;
}
