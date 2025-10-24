"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ZohoAccountingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZohoAccountingService = void 0;
const common_1 = require("@nestjs/common");
const contact_service_1 = require("./services/contact.service");
const invoice_service_1 = require("./services/invoice.service");
const payment_service_1 = require("./services/payment.service");
let ZohoAccountingService = ZohoAccountingService_1 = class ZohoAccountingService {
    constructor(contacts, invoices, payments) {
        this.contacts = contacts;
        this.invoices = invoices;
        this.payments = payments;
        this.logger = new common_1.Logger(ZohoAccountingService_1.name);
    }
    async createCustomerAndInvoice(contactDto, invoiceDtoWithoutCustomerId) {
        this.logger.log(`Workflow: Creating customer ${contactDto.contact_name} and an initial invoice.`);
        const contact = await this.contacts.createContact(contactDto);
        if (!contact || !contact.contact_id) {
            this.logger.error('Failed to create contact in the workflow.');
            throw new Error('Failed to create contact during customer and invoice creation workflow.');
        }
        this.logger.log(`Workflow: Customer ${contact.contact_name} (ID: ${contact.contact_id}) created.`);
        const invoiceDtoWithCustomerId = {
            ...invoiceDtoWithoutCustomerId,
            customer_id: contact.contact_id,
        };
        const invoice = await this.invoices.createInvoice(invoiceDtoWithCustomerId);
        if (!invoice || !invoice.invoice_id) {
            this.logger.error(`Failed to create invoice for contact ID ${contact.contact_id} in the workflow.`);
            throw new Error('Failed to create invoice during customer and invoice creation workflow.');
        }
        this.logger.log(`Workflow: Invoice ${invoice.invoice_number} (ID: ${invoice.invoice_id}) created for customer ${contact.contact_name}.`);
        return { contact, invoice };
    }
    async payInvoice(customerId, invoiceId, paymentAmount, paymentDate, paymentMode, referenceNumber, depositToAccountId) {
        this.logger.log(`Workflow: Recording payment of ${paymentAmount} for invoice ${invoiceId} by customer ${customerId}.`);
        const paymentDto = {
            customer_id: customerId,
            payment_mode: paymentMode,
            amount: paymentAmount,
            date: paymentDate,
            reference_number: referenceNumber,
            account_id: depositToAccountId,
            invoices: [
                {
                    invoice_id: invoiceId,
                    amount_applied: paymentAmount,
                },
            ],
        };
        const payment = await this.payments.recordPayment(paymentDto);
        this.logger.log(`Workflow: Payment ${payment.payment_number} (ID: ${payment.payment_id}) recorded and applied.`);
        return payment;
    }
};
exports.ZohoAccountingService = ZohoAccountingService;
exports.ZohoAccountingService = ZohoAccountingService = ZohoAccountingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [contact_service_1.ContactService,
        invoice_service_1.InvoiceService,
        payment_service_1.PaymentService])
], ZohoAccountingService);
//# sourceMappingURL=zoho_accounting.service.js.map