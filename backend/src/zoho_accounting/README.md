# Zoho Accounting Module

This module integrates with the Zoho Books API to provide accounting and fee management functionalities within the application. It handles operations related to Zoho Contacts (Customers), Invoices, and Customer Payments.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Setup and Configuration](#setup-and-configuration)
  - [Environment Variables](#environment-variables)
  - [Initial OAuth Token Generation](#initial-oauth-token-generation)
- [Module Structure](#module-structure)
- [Services](#services)
  - [ZohoClient](#zohoclient)
  - [ContactService](#contactservice)
  - [InvoiceService](#invoiceservice)
  - [PaymentService](#paymentservice)
  - [ZohoAccountingService](#zohoaccountingservice)
- [Basic Usage](#basic-usage)
- [Error Handling](#error-handling)
- [Further Considerations](#further-considerations)

## Overview

The Zoho Accounting module abstracts the complexities of interacting with the Zoho Books API, providing a set of services to manage key accounting entities. It is built using NestJS and leverages its features like modules, dependency injection, and configuration management.

## Features

-   **Client for Zoho Books API:** A robust client (`ZohoClient`) that handles authentication (OAuth 2.0 with refresh tokens), request formation, and basic error handling.
-   **Contact Management:** Create, retrieve, update, delete, and list contacts (customers) in Zoho Books.
-   **Invoice Management:** Create, retrieve, update, delete, and list invoices. Also supports actions like emailing invoices, marking them as sent, and voiding them.
-   **Payment Management:** Record, retrieve, update, delete, and list customer payments. Supports applying payments to specific invoices.
-   **Higher-Level Workflows:** The `ZohoAccountingService` provides methods for common business processes, such as creating a customer and an initial invoice in a single operation.

## Setup and Configuration

### Environment Variables

The module relies on several environment variables for its configuration. These must be set in your application's `.env` file (or equivalent configuration source):

-   `ZOHO_REGION`: The region of your Zoho Books organization (e.g., `com`, `eu`, `in`). Defaults to `com`.
-   `ZOHO_CLIENT_ID`: Your Zoho API OAuth Client ID.
-   `ZOHO_CLIENT_SECRET`: Your Zoho API OAuth Client Secret.
-   `ZOHO_REDIRECT_URI`: The redirect URI configured in your Zoho API client settings (used for the initial OAuth flow).
-   `ZOHO_ORGANIZATION_ID`: The ID of your Zoho Books organization.
-   `ZOHO_REFRESH_TOKEN`: The refresh token obtained after the initial OAuth 2.0 authorization. This is crucial for the client to autonomously refresh access tokens.
-   `ZOHO_ACCESS_TOKEN` (Optional): An initial access token. The client will primarily use the refresh token to obtain new access tokens. Storing this might be useful for initial setup or debugging but is generally managed by the `ZohoClient`.

**Example `.env` entries:**

```env
ZOHO_REGION=com
ZOHO_CLIENT_ID=your_client_id_here
ZOHO_CLIENT_SECRET=your_client_secret_here
ZOHO_REDIRECT_URI=https://your-app.com/zoho/oauth/callback
ZOHO_ORGANIZATION_ID=your_organization_id_here
ZOHO_REFRESH_TOKEN=your_long_refresh_token_here
# ZOHO_ACCESS_TOKEN=optional_initial_access_token
```

### Initial OAuth Token Generation

The `ZohoClient` is designed to use a long-lived `ZOHO_REFRESH_TOKEN` to continuously generate short-lived access tokens. The initial generation of this refresh token involves a one-time OAuth 2.0 authorization code grant flow:

1.  **Register your application in the [Zoho API Console](https://api-console.zoho.com/)**:
    *   Choose "Server-based Applications".
    *   Provide a client name, homepage URL, and the `ZOHO_REDIRECT_URI`.
    *   You will receive a Client ID and Client Secret.
2.  **Construct the Authorization URL**:
    *   URL: `https://accounts.zoho.{region}/oauth/v2/auth`
    *   Parameters:
        *   `scope`: A comma-separated list of scopes. For this module, common scopes include `ZohoBooks.fullaccess.all` or more granular scopes like `ZohoBooks.contacts.CREATE`, `ZohoBooks.invoices.CREATE`, `ZohoBooks.customerpayments.CREATE`, etc. Start with `ZohoBooks.fullaccess.all` for simplicity during development.
        *   `client_id`: Your `ZOHO_CLIENT_ID`.
        *   `response_type`: `code`.
        *   `redirect_uri`: Your `ZOHO_REDIRECT_URI`.
        *   `access_type`: `offline` (this is crucial to get a refresh token).
        *   `prompt`: `consent` (optional, to ensure the consent screen is always shown).
3.  **Authorize your application**:
    *   Open the constructed URL in a browser.
    *   Log in with your Zoho credentials and grant access.
    *   You will be redirected to your `ZOHO_REDIRECT_URI` with an authorization `code` in the query parameters.
4.  **Exchange the Authorization Code for Tokens**:
    *   Make a POST request to `https://accounts.zoho.{region}/oauth/v2/token`.
    *   Parameters (form-urlencoded):
        *   `code`: The authorization code from the previous step.
        *   `client_id`: Your `ZOHO_CLIENT_ID`.
        *   `client_secret`: Your `ZOHO_CLIENT_SECRET`.
        *   `redirect_uri`: Your `ZOHO_REDIRECT_URI`.
        *   `grant_type`: `authorization_code`.
    *   The response will contain an `access_token` and, importantly, a `refresh_token`.
5.  **Store the `refresh_token`**:
    *   Securely store this `refresh_token` and set it as the `ZOHO_REFRESH_TOKEN` environment variable for your application.

This process typically only needs to be done once.

## Module Structure

The module is organized as follows:

```
zoho_accounting/
├── client/                     # Low-level Zoho API client
│   ├── interfaces/             # Interfaces for client configuration, etc.
│   └── zoho.client.ts
│   └── zoho.client.spec.ts
├── dto/                        # Data Transfer Objects for creating/updating entities
│   ├── create-contact.dto.ts
│   ├── create-invoice.dto.ts
│   └── create-payment.dto.ts
├── entities/                   # TypeScript interfaces representing Zoho entities
│   ├── contact.entity.ts
│   ├── invoice.entity.ts
│   └── payment.entity.ts
├── services/                   # Business logic services for each Zoho entity
│   ├── contact.service.ts
│   ├── invoice.service.ts
│   └── payment.service.ts
│   └── (service.spec.ts files for each)
├── zoho_accounting.module.ts   # The main NestJS module definition
├── zoho_accounting.service.ts  # Higher-level service for combined operations/facade
└── README.md                   # This file
```

## Services

### ZohoClient

(`zoho_accounting/client/zoho.client.ts`)

The `ZohoClient` is responsible for all direct communication with the Zoho Books API.
It handles:
-   Loading API configuration (credentials, region, org ID).
-   Managing OAuth 2.0 access tokens, including refreshing them using the `ZOHO_REFRESH_TOKEN`.
-   Making HTTP GET, POST, PUT, DELETE requests to Zoho API endpoints.
-   Basic error handling, including retrying requests once on a 401 (Unauthorized) error after attempting a token refresh.

This service is primarily for internal use by other services within this module.

### ContactService

(`zoho_accounting/services/contact.service.ts`)

Manages contacts (customers) in Zoho Books.
Key methods:
-   `createContact(contactDto: CreateContactDto): Promise<Contact>`
-   `getContact(contactId: string): Promise<Contact | null>`
-   `listContacts(params?: Record<string, any>): Promise<Contact[]>`
-   `updateContact(contactId: string, updateDto: Partial<CreateContactDto>): Promise<Contact>`
-   `deleteContact(contactId: string): Promise<boolean>`

### InvoiceService

(`zoho_accounting/services/invoice.service.ts`)

Manages invoices in Zoho Books.
Key methods:
-   `createInvoice(invoiceDto: CreateInvoiceDto): Promise<Invoice>`
-   `getInvoice(invoiceId: string): Promise<Invoice | null>`
-   `listInvoices(params?: Record<string, any>): Promise<Invoice[]>`
-   `updateInvoice(invoiceId: string, updateDto: Partial<CreateInvoiceDto>): Promise<Invoice>`
-   `deleteInvoice(invoiceId: string): Promise<boolean>`
-   `emailInvoice(invoiceId: string, emailDto?: any): Promise<boolean>`
-   `markAsSent(invoiceId: string): Promise<Invoice>`
-   `voidInvoice(invoiceId: string): Promise<Invoice>`

### PaymentService

(`zoho_accounting/services/payment.service.ts`)

Manages customer payments in Zoho Books.
Key methods:
-   `recordPayment(paymentDto: CreatePaymentDto): Promise<CustomerPayment>`
-   `getPayment(paymentId: string): Promise<CustomerPayment | null>`
-   `listPayments(params?: Record<string, any>): Promise<CustomerPayment[]>`
-   `updatePayment(paymentId: string, updateDto: Partial<CreatePaymentDto>): Promise<CustomerPayment>`
-   `deletePayment(paymentId: string): Promise<boolean>`

### ZohoAccountingService

(`zoho_accounting/zoho_accounting.service.ts`)

This service acts as a facade or a place for higher-level business logic that combines operations from the entity-specific services.
It provides direct access to the individual services (`contacts`, `invoices`, `payments`) and can also contain methods for common workflows.

Example workflow methods:
-   `createCustomerAndInvoice(contactDto, invoiceDto): Promise<{ contact; invoice }>`
-   `payInvoice(customerId, invoiceId, amount, date, mode, ...): Promise<CustomerPayment>`

## Basic Usage

1.  **Ensure the `ZohoAccountingModule` is imported into your `AppModule` (or relevant feature module).**

    ```typescript
    // app.module.ts
    import { Module } from '@nestjs/common';
    import { ZohoAccountingModule } from './zoho_accounting/zoho_accounting.module';

    @Module({
      imports: [
        // ... other modules
        ZohoAccountingModule,
      ],
    })
    export class AppModule {}
    ```

2.  **Inject the desired service (`ZohoAccountingService`, `ContactService`, etc.) into your own services or controllers.**

    ```typescript
    // your.service.ts
    import { Injectable } from '@nestjs/common';
    import { ZohoAccountingService } from '../zoho_accounting/zoho_accounting.service';
    import { CreateContactDto } from '../zoho_accounting/dto/create-contact.dto';

    @Injectable()
    export class YourService {
      constructor(private readonly zohoService: ZohoAccountingService) {}

      async addNewCustomer(name: string, email: string) {
        const contactDto: CreateContactDto = {
          contact_name: name,
          email: email,
          contact_type: 'customer', // Assuming it's a customer
        };
        try {
          const newContact = await this.zohoService.contacts.createContact(contactDto);
          console.log('New Zoho Contact Created:', newContact);
          return newContact;
        } catch (error) {
          console.error('Error creating Zoho contact:', error);
          throw error;
        }
      }
    }
    ```

## Error Handling

-   The `ZohoClient` attempts to handle API errors by throwing `HttpException` with details from the Zoho API response.
-   It includes logic to retry a request once if a 401 (Unauthorized) error occurs, after attempting to refresh the access token.
-   Services built on top of `ZohoClient` (`ContactService`, etc.) will propagate these HttpExceptions. Your application code should be prepared to catch and handle these errors appropriately (e.g., in controllers or global exception filters).
-   Specific error messages from Zoho (e.g., validation errors) are typically included in the `HttpException`'s response.

## Further Considerations

-   **Rate Limiting:** Zoho Books API has rate limits. While the client doesn't explicitly implement rate limit handling (e.g., backoff and retry for 429 errors), be mindful of this if making a large number of requests in a short period.
-   **Data Synchronization:** This module provides tools to interact with Zoho Books. It does not implement a full data synchronization strategy. If you need to keep local data in sync with Zoho, you'll need to build that logic separately.
-   **Webhooks:** To react to events happening in Zoho Books (e.g., an invoice paid online), you would need to implement webhook handlers in your application.
-   **Transactionality:** Operations involving multiple steps (e.g., `createCustomerAndInvoice`) are not transactional in a distributed sense. If one part fails, the other might have already completed. Consider compensation logic or manual review processes for such scenarios if strict atomicity is required.
```
