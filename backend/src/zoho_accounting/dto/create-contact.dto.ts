import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

// Based on Zoho's API, many fields are available.
// This DTO includes common ones. Add more as needed.

export class BillingAddressDto {
  @IsOptional()
  @IsString()
  attention?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  street2?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  zip?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  fax?: string;
}

export class ShippingAddressDto extends BillingAddressDto {}

export class CreateContactDto {
  @IsNotEmpty()
  @IsString()
  contact_name: string; // Name of the contact. Max 100 chars.

  @IsOptional()
  @IsString()
  company_name?: string; // Company name. Max 100 chars.

  @IsOptional()
  @IsString()
  contact_type?: string; // "customer" or "vendor". For fee management, likely "customer".

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  mobile?: string;

  // Custom fields can be an array of objects
  // custom_fields: [{ label: "Custom Field 1", value: "Value 1" }]
  // For simplicity, not strictly typed here yet, can be added if needed.
  @IsOptional()
  @IsObject()
  custom_fields?: any[];

  @IsOptional()
  @ValidateNested()
  @Type(() => BillingAddressDto)
  billing_address?: BillingAddressDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shipping_address?: ShippingAddressDto;

  // Add other fields like payment_terms, currency_id, etc. as required
}
