import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
  Min,
  IsPositive,
} from 'class-validator';

export class InvoiceLineItemDto {
  @IsOptional()
  @IsString()
  item_id?: string; // If using predefined items from Zoho Inventory

  @IsNotEmpty()
  @IsString()
  name: string; // Name of the item or service

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  rate: number; // Price per unit

  @IsNotEmpty()
  @IsNumber()
  @Min(0) // Can be 0 for free items if needed, but typically > 0
  quantity: number;

  @IsOptional()
  @IsString()
  unit?: string; // e.g., 'hrs', 'pcs'

  @IsOptional()
  @IsNumber()
  discount_amount?: number; // Discount amount for this line item

  @IsOptional()
  @IsString()
  discount?: string; // Discount percentage or amount (e.g., "10%" or "10.00")

  @IsOptional()
  @IsString()
  tax_id?: string; // ID of the tax to be applied

  @IsOptional()
  @IsString()
  account_id?: string; // The account to which the line item amount should be posted.

  // Add other line item fields as needed: tags, item_order, etc.
}

export class CreateInvoiceDto {
  @IsNotEmpty()
  @IsString()
  customer_id: string; // ID of the Zoho Contact (Customer)

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceLineItemDto)
  line_items: InvoiceLineItemDto[];

  @IsOptional()
  @IsDateString()
  date?: string; // Invoice date, format YYYY-MM-DD. Defaults to current date if not provided.

  @IsOptional()
  @IsDateString()
  due_date?: string; // Due date, format YYYY-MM-DD.

  @IsOptional()
  @IsString()
  reference_number?: string; // Your reference for the invoice

  @IsOptional()
  @IsString()
  notes?: string; // Notes to be displayed on the invoice (visible to customer)

  @IsOptional()
  @IsString()
  terms?: string; // Terms and conditions (visible to customer)

  @IsOptional()
  @IsNumber()
  exchange_rate?: number; // If the invoice is in a foreign currency

  @IsOptional()
  @IsNumber()
  discount?: number; // Overall discount amount for the invoice

  @IsOptional()
  @IsString()
  discount_type?: 'entity_level' | 'item_level'; // Default is item_level

  @IsOptional()
  @IsBoolean()
  allow_partial_payments?: boolean;

  @IsOptional()
  @IsString()
  template_id?: string; // ID of the PDF template to be used for this invoice

  // Custom fields for the invoice
  @IsOptional()
  @IsArray()
  custom_fields?: Array<{
    customfield_id: string;
    value: string | number | boolean;
  }>;

  // Other fields like shipping_charges, adjustment, salesperson_name, etc.
}
