import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
  Min,
  IsPositive
} from 'class-validator';

export class InvoicePaymentDto {
  @IsNotEmpty()
  @IsString()
  invoice_id: string;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  amount_applied: number;

  @IsOptional()
  @IsNumber()
  tax_amount_withheld?: number; // If tax is withheld from the payment for this invoice
}

export class CreatePaymentDto {
  @IsNotEmpty()
  @IsString()
  customer_id: string; // ID of the Zoho Contact (Customer) making the payment

  @IsNotEmpty()
  @IsString()
  payment_mode: string; // e.g., "cash", "check", "creditcard", "banktransfer", "paypal", "stripe" etc.
                        // Check Zoho documentation for full list of supported modes.

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  amount: number; // Total amount of the payment received

  @IsNotEmpty()
  @IsDateString()
  date: string; // Date payment was received, format YYYY-MM-DD

  @IsOptional()
  @IsString()
  reference_number?: string; // e.g., Check number, transaction ID

  @IsOptional()
  @IsString()
  description?: string; // Description for the payment

  @IsOptional()
  @IsString()
  bank_charges?: number; // Bank charges deducted from the payment, if any

  @IsOptional()
  @IsString()
  account_id?: string; // ID of the account (e.g., bank account in Zoho Books) to which this payment is deposited.
                       // Required by Zoho if multiple bank accounts are configured.

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoicePaymentDto)
  invoices?: InvoicePaymentDto[]; // Array of invoices to which this payment should be applied.
                                 // If not provided, payment is recorded as an excess payment/retainer.

  @IsOptional()
  @IsNumber()
  exchange_rate?: number; // If payment is in a foreign currency different from base currency.

  // Custom fields for the payment
  @IsOptional()
  @IsArray()
  custom_fields?: Array<{
    customfield_id: string;
    value: string | number | boolean;
  }>;
}
