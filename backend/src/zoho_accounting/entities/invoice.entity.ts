// Based on Zoho Books API for Invoices
// This interface represents the detailed structure of an invoice entity.

import { ContactPerson, CustomField } from './contact.entity'; // Re-use if applicable or define separately

interface Address {
  // Simplified, use Contact's Address if more detail needed
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
  name?: string; // Name is part of item_name usually
  item_name?: string;
  description?: string;
  item_order?: number;
  bcy_rate?: number; // Rate in base currency
  rate: number;
  quantity: number;
  unit?: string;
  discount_amount?: number;
  discount?: string; // e.g., "10.00%" or "10" (amount)
  tax_id?: string;
  tax_name?: string;
  tax_type?: string;
  tax_percentage?: number;
  item_total?: number; // quantity * rate (before tax, after discount)
  account_id?: string;
  account_name?: string;
  // ... other fields like tags, product_type etc.
}

interface PaymentGateway {
  configured: boolean;
  additional_field1: string; // e.g., "not_configured"
  gateway_name: string; // e.g., "paypal", "stripe"
}

interface PaymentOptions {
  payment_gateways: PaymentGateway[];
}

interface TaxSummary {
  tax_name: string;
  tax_amount: number;
}

export interface Invoice {
  invoice_id: string;
  invoice_number: string;
  customer_id: string;
  customer_name: string;
  status: string; // e.g., 'draft', 'sent', 'paid', 'void', ' overdue'
  date: string; // YYYY-MM-DD
  due_date: string; // YYYY-MM-DD
  due_days?: string | number; // e.g., "Due on Receipt" or number of days
  currency_id: string;
  currency_code: string; // e.g., "USD"
  currency_symbol: string; // e.g., "$"
  exchange_rate?: number;
  reference_number?: string;

  line_items: InvoiceLineItem[];

  sub_total?: number; // Sum of (quantity * rate) for all line items
  discount_total?: number; // Total discount amount if discount_type is entity_level
  tax_total?: number; // Total tax amount
  total: number; // Grand total

  balance: number; // Amount due
  payments_applied?: number; // Total payments applied to this invoice
  write_off_amount?: number;
  credits_applied?: number;

  notes?: string;
  terms?: string;
  payment_options?: PaymentOptions;
  is_emailed?: boolean;
  reminders_sent?: number;
  last_payment_date?: string; // YYYY-MM-DD

  billing_address?: Address;
  shipping_address?: Address;

  contact_persons?: string[]; // Array of contact person IDs associated
  salesperson_id?: string;
  salesperson_name?: string;

  custom_fields?: CustomField[]; // Reusing from contact.entity or define specific one
  template_id?: string;
  template_name?: string;
  template_type?: string; // e.g., "standard"

  created_time?: string; // ISO 8601
  last_modified_time?: string; // ISO 8601
  is_viewed_by_client?: boolean;
  client_viewed_time?: string; // ISO 8601

  // ... and many other potential fields like shipping_charge, adjustment, is_discount_before_tax, etc.
}

// For responses that wrap a single invoice
export interface ZohoInvoiceResponse {
  code: number;
  message: string;
  invoice: Invoice;
}

// For responses that list multiple invoices
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
