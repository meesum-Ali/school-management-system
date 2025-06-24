// Based on Zoho Books API for Contacts
// This interface represents the detailed structure of a contact entity.

interface Address {
  address_id?: string;
  attention?: string;
  address: string;
  street2?: string;
  city: string;
  state?: string;
  zip: string;
  country: string;
  fax?: string;
  phone?: string; // Sometimes phone is part of address in Zoho responses
  is_primary_address?: boolean;
  is_billing_address?: boolean;
  is_shipping_address?: boolean;
}

interface DefaultTemplates {
  invoice_template_id?: string;
  invoice_template_name?: string;
  estimate_template_id?: string;
  estimate_template_name?: string;
  creditnote_template_id?: string;
  creditnote_template_name?: string;
  invoice_email_template_id?: string;
  invoice_email_template_name?: string;
  estimate_email_template_id?: string;
  estimate_email_template_name?: string;
  creditnote_email_template_id?: string;
  creditnote_email_template_name?: string;
}

export interface CustomField {
  customfield_id: string;
  index: number;
  value: string | number | boolean | Date; // Value can be of different types
  label: string;
  show_on_pdf: boolean;
  show_in_portal: boolean;
  is_active: boolean;
  edit_on_portal: boolean;
  placeholder?: string; // Placeholder for the custom field
  data_type?: string; // e.g., 'String', 'Email', 'Number', 'Date', 'Dropdown'
}

export interface ContactPerson {
  contact_person_id: string;
  salutation?: string;
  first_name?: string;
  last_name?: string;
  email: string;
  phone?: string;
  mobile?: string;
  is_primary_contact: boolean;
  skype?: string;
  designation?: string;
  department?: string;
  is_added_in_portal?: boolean;
}

export interface Contact {
  contact_id: string;
  contact_name: string;
  company_name?: string;
  contact_type: string; // 'customer', 'vendor', etc.
  status: string; // 'active', 'inactive'
  payment_terms?: number;
  payment_terms_label?: string;
  currency_id?: string;
  currency_code?: string;
  currency_symbol?: string;
  outstanding_receivable_amount?: number;
  outstanding_payable_amount?: number;
  unused_credits_receivable_amount?: number;
  unused_credits_payable_amount?: number;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  portal_status?: string; // 'enabled', 'disabled', 'invited'
  custom_fields?: CustomField[];
  billing_address?: Address;
  shipping_address?: Address;
  addresses?: Address[]; // Array of all addresses associated
  contact_persons?: ContactPerson[];
  default_templates?: DefaultTemplates;
  notes?: string;
  created_time?: string; // ISO 8601 format date-time
  last_modified_time?: string; // ISO 8601 format date-time
  website?: string;
  vat_reg_no?: string; // Or other tax registration numbers depending on region
  country_code?: string;
  // ... and many other potential fields
}

// For responses that wrap a single contact
export interface ZohoContactResponse {
  code: number;
  message: string;
  contact: Contact;
}

// For responses that list multiple contacts
export interface ZohoContactsListResponse {
  code: number;
  message: string;
  contacts: Contact[];
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
