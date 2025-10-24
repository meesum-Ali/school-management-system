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
var ContactService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactService = void 0;
const common_1 = require("@nestjs/common");
const zoho_client_1 = require("../client/zoho.client");
let ContactService = ContactService_1 = class ContactService {
    constructor(zohoClient) {
        this.zohoClient = zohoClient;
        this.logger = new common_1.Logger(ContactService_1.name);
        this.endpoint = 'contacts';
    }
    async createContact(contactDto) {
        this.logger.log(`Attempting to create contact: ${contactDto.contact_name}`);
        try {
            const response = await this.zohoClient.post(this.endpoint, contactDto);
            if (response.data && response.data.contact) {
                this.logger.log(`Successfully created contact with ID: ${response.data.contact.contact_id}`);
                return response.data.contact;
            }
            else {
                this.logger.error(`Failed to create contact. Unexpected response structure: ${JSON.stringify(response.data)}`);
                throw new Error('Failed to create contact due to unexpected response structure.');
            }
        }
        catch (error) {
            this.logger.error(`Error creating contact ${contactDto.contact_name}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getContact(contactId) {
        this.logger.log(`Attempting to retrieve contact with ID: ${contactId}`);
        try {
            const response = await this.zohoClient.get(`${this.endpoint}/${contactId}`);
            if (response.data && response.data.contact) {
                return response.data.contact;
            }
            this.logger.warn(`Contact with ID ${contactId} not found or error in response.`);
            return null;
        }
        catch (error) {
            if (error.status === 404) {
                this.logger.warn(`Contact with ID ${contactId} not found (404).`);
                return null;
            }
            this.logger.error(`Error retrieving contact ${contactId}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async listContacts(params) {
        this.logger.log(`Attempting to list contacts with params: ${JSON.stringify(params)}`);
        try {
            const response = await this.zohoClient.get(this.endpoint, params);
            if (response.data && response.data.contacts) {
                return response.data.contacts;
            }
            else {
                this.logger.warn(`No contacts found or unexpected response structure: ${JSON.stringify(response.data)}`);
                return [];
            }
        }
        catch (error) {
            this.logger.error(`Error listing contacts: ${error.message}`, error.stack);
            throw error;
        }
    }
    async updateContact(contactId, updateDto) {
        this.logger.log(`Attempting to update contact with ID: ${contactId}`);
        try {
            const response = await this.zohoClient.put(`${this.endpoint}/${contactId}`, updateDto);
            if (response.data && response.data.contact) {
                this.logger.log(`Successfully updated contact with ID: ${response.data.contact.contact_id}`);
                return response.data.contact;
            }
            else {
                this.logger.error(`Failed to update contact. Unexpected response structure: ${JSON.stringify(response.data)}`);
                throw new Error('Failed to update contact due to unexpected response structure.');
            }
        }
        catch (error) {
            this.logger.error(`Error updating contact ${contactId}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async deleteContact(contactId) {
        this.logger.log(`Attempting to delete contact with ID: ${contactId}`);
        try {
            await this.zohoClient.delete(`${this.endpoint}/${contactId}`);
            this.logger.log(`Successfully deleted contact with ID: ${contactId} (or request accepted)`);
            return true;
        }
        catch (error) {
            if (error.status === 404) {
                this.logger.warn(`Contact with ID ${contactId} not found for deletion (404).`);
                return false;
            }
            this.logger.error(`Error deleting contact ${contactId}: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.ContactService = ContactService;
exports.ContactService = ContactService = ContactService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [zoho_client_1.ZohoClient])
], ContactService);
//# sourceMappingURL=contact.service.js.map