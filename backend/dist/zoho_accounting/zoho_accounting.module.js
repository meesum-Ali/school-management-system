"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZohoAccountingModule = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
const zoho_client_1 = require("./client/zoho.client");
const contact_service_1 = require("./services/contact.service");
const invoice_service_1 = require("./services/invoice.service");
const payment_service_1 = require("./services/payment.service");
const zoho_accounting_service_1 = require("./zoho_accounting.service");
let ZohoAccountingModule = class ZohoAccountingModule {
};
exports.ZohoAccountingModule = ZohoAccountingModule;
exports.ZohoAccountingModule = ZohoAccountingModule = __decorate([
    (0, common_1.Module)({
        imports: [
            axios_1.HttpModule,
            config_1.ConfigModule,
        ],
        providers: [
            zoho_client_1.ZohoClient,
            contact_service_1.ContactService,
            invoice_service_1.InvoiceService,
            payment_service_1.PaymentService,
            zoho_accounting_service_1.ZohoAccountingService,
        ],
        exports: [
            zoho_accounting_service_1.ZohoAccountingService,
            contact_service_1.ContactService,
            invoice_service_1.InvoiceService,
            payment_service_1.PaymentService,
            zoho_client_1.ZohoClient,
        ],
    })
], ZohoAccountingModule);
//# sourceMappingURL=zoho_accounting.module.js.map