export declare class BillingAddressDto {
    attention?: string;
    address?: string;
    street2?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    fax?: string;
}
export declare class ShippingAddressDto extends BillingAddressDto {
}
export declare class CreateContactDto {
    contact_name: string;
    company_name?: string;
    contact_type?: string;
    email?: string;
    phone?: string;
    mobile?: string;
    custom_fields?: any[];
    billing_address?: BillingAddressDto;
    shipping_address?: ShippingAddressDto;
}
