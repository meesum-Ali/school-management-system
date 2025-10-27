// Based on Zoho Books API for Customer Payments

import { CustomField } from './contact.entity'; // Re-use if applicable

interface InvoiceAllocated {
  invoice_id: string;
  invoice_number: string;
  invoice_date: string; // YYYY-MM-DD
  amount_applied: number;
  tax_amount_withheld?: number;
  total: number; // Total of the invoice this payment is applied to
  balance: number; // Balance of the invoice after this payment application
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
  payment_number: string; // System generated payment number
  payment_mode: string;
  payment_mode_formatted?: string;
  date: string; // YYYY-MM-DD
  account_id?: string; // Deposit to account ID
  account_name?: string; // Deposit to account name
  exchange_rate?: number;
  amount: number; // Total payment amount
  bcy_amount?: number; // Amount in base currency
  unused_amount?: number; // Amount not applied to any invoice (excess payment)
  reference_number?: string;
  description?: string;

  invoices?: InvoiceAllocated[]; // Invoices to which this payment has been applied

  bank_charges?: BankCharge[]; // If bank charges were recorded with this payment

  currency_id: string;
  currency_code: string;
  currency_symbol: string;

  custom_fields?: CustomField[];

  created_time?: string; // ISO 8601
  last_modified_time?: string; // ISO 8601

  // ... other fields like gateway_transaction_id, settlement_status, tax_account_id, etc.
}

// For responses that wrap a single payment
export interface ZohoPaymentResponse {
  code: number;
  message: string;
  payment: CustomerPayment;
}

// For responses that list multiple payments
export interface ZohoPaymentsListResponse {
  code: number;
  message: string;
  customerpayments: CustomerPayment[]; // Note: API uses "customerpayments" key
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
