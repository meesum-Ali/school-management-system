import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config'; // Ensure ConfigModule is globally available or imported here

import { ZohoClient } from './client/zoho.client';
import { ContactService } from './services/contact.service';
import { InvoiceService } from './services/invoice.service';
import { PaymentService } from './services/payment.service';
import { ZohoAccountingService } from './zoho_accounting.service';

@Module({
  imports: [
    HttpModule, // For ZohoClient to make HTTP requests
    ConfigModule, // For ZohoClient to access environment variables
                  // If ConfigModule is not global, you might need to configure it here:
                  // ConfigModule.forRoot({ isGlobal: true }) or specific load method
  ],
  providers: [
    ZohoClient,
    ContactService,
    InvoiceService,
    PaymentService,
    ZohoAccountingService, // The main service for this module
  ],
  exports: [
    // Export services that other modules in the application might need to use
    ZohoAccountingService,
    ContactService,
    InvoiceService,
    PaymentService,
    ZohoClient, // Optionally export ZohoClient if direct access is needed elsewhere (less common)
  ],
})
export class ZohoAccountingModule {}
