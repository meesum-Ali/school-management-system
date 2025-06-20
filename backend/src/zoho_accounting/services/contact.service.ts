import { Injectable, Logger } from '@nestjs/common';
import { ZohoClient } from '../client/zoho.client';
import { CreateContactDto } from '../dto/create-contact.dto';
import { Contact, ZohoContactResponse, ZohoContactsListResponse } from '../entities/contact.entity';
import { AxiosResponse } from 'axios';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);
  private readonly endpoint = 'contacts';

  constructor(private readonly zohoClient: ZohoClient) {}

  /**
   * Creates a new contact (customer or vendor) in Zoho Books.
   * @param contactDto - The data for creating the contact.
   * @returns A promise that resolves to the created Contact entity.
   * @throws HttpException if the API request fails or the response structure is unexpected.
   */
  async createContact(contactDto: CreateContactDto): Promise<Contact> {
    this.logger.log(`Attempting to create contact: ${contactDto.contact_name}`);
    try {
      const response: AxiosResponse<ZohoContactResponse> = await this.zohoClient.post<ZohoContactResponse>(
        this.endpoint,
        contactDto,
      );
      if (response.data && response.data.contact) {
        this.logger.log(`Successfully created contact with ID: ${response.data.contact.contact_id}`);
        return response.data.contact;
      } else {
        this.logger.error(`Failed to create contact. Unexpected response structure: ${JSON.stringify(response.data)}`);
        throw new Error('Failed to create contact due to unexpected response structure.');
      }
    } catch (error) {
      this.logger.error(`Error creating contact ${contactDto.contact_name}: ${error.message}`, error.stack);
      // The ZohoClient already throws HttpException, so we can rethrow or handle specifically
      throw error;
    }
  }

  /**
   * Retrieves a specific contact from Zoho Books by its ID.
   * @param contactId - The ID of the contact to retrieve.
   * @returns A promise that resolves to the Contact entity if found, otherwise null.
   * @throws HttpException if the API request fails (other than 404).
   */
  async getContact(contactId: string): Promise<Contact | null> {
    this.logger.log(`Attempting to retrieve contact with ID: ${contactId}`);
    try {
      const response: AxiosResponse<ZohoContactResponse> = await this.zohoClient.get<ZohoContactResponse>(
        `${this.endpoint}/${contactId}`,
      );
      if (response.data && response.data.contact) {
        return response.data.contact;
      }
      // Zoho might return 200 with an error code/message if not found, or client might throw 404
      // Depending on ZohoClient's behavior for 404s, this might not be hit if it throws.
      this.logger.warn(`Contact with ID ${contactId} not found or error in response.`);
      return null;
    } catch (error) {
      // If ZohoClient throws HttpException on 404, we might want to catch and return null.
      if (error.status === 404) {
        this.logger.warn(`Contact with ID ${contactId} not found (404).`);
        return null;
      }
      this.logger.error(`Error retrieving contact ${contactId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Lists contacts from Zoho Books.
   * @param params - Optional query parameters to filter the list (e.g., { status: 'active', contact_name_contains: 'School' }).
   * Refer to Zoho API documentation for available filter options.
   * @returns A promise that resolves to an array of Contact entities.
   * @throws HttpException if the API request fails.
   */
  async listContacts(params?: Record<string, any>): Promise<Contact[]> {
    this.logger.log(`Attempting to list contacts with params: ${JSON.stringify(params)}`);
    try {
      // Example params: { status: 'active', contact_name_contains: 'School' }
      const response: AxiosResponse<ZohoContactsListResponse> = await this.zohoClient.get<ZohoContactsListResponse>(
        this.endpoint,
        params,
      );
      if (response.data && response.data.contacts) {
        return response.data.contacts;
      } else {
         this.logger.warn(`No contacts found or unexpected response structure: ${JSON.stringify(response.data)}`);
        return []; // Return empty array if no contacts or unexpected structure
      }
    } catch (error) {
      this.logger.error(`Error listing contacts: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Updates an existing contact in Zoho Books.
   * @param contactId - The ID of the contact to update.
   * @param updateDto - An object containing the fields to update.
   * @returns A promise that resolves to the updated Contact entity.
   * @throws HttpException if the API request fails or the response structure is unexpected.
   */
  async updateContact(contactId: string, updateDto: Partial<CreateContactDto>): Promise<Contact> {
    this.logger.log(`Attempting to update contact with ID: ${contactId}`);
    try {
      const response: AxiosResponse<ZohoContactResponse> = await this.zohoClient.put<ZohoContactResponse>(
        `${this.endpoint}/${contactId}`,
        updateDto,
      );
      if (response.data && response.data.contact) {
        this.logger.log(`Successfully updated contact with ID: ${response.data.contact.contact_id}`);
        return response.data.contact;
      } else {
        this.logger.error(`Failed to update contact. Unexpected response structure: ${JSON.stringify(response.data)}`);
        throw new Error('Failed to update contact due to unexpected response structure.');
      }
    } catch (error) {
      this.logger.error(`Error updating contact ${contactId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Deletes a contact from Zoho Books by its ID.
   * @param contactId - The ID of the contact to delete.
   * @returns A promise that resolves to true if deletion was successful or contact was not found (404), false otherwise.
   * @throws HttpException if the API request fails for reasons other than 404.
   */
  async deleteContact(contactId: string): Promise<boolean> {
    this.logger.log(`Attempting to delete contact with ID: ${contactId}`);
    try {
      // Zoho delete often returns 200 OK with a success message or just empty body
      // We need to check the response structure for confirmation.
      // For this example, assuming a 200 or 204 means success if no error is thrown by client.
      await this.zohoClient.delete<any>(`${this.endpoint}/${contactId}`);
      this.logger.log(`Successfully deleted contact with ID: ${contactId} (or request accepted)`);
      return true;
    } catch (error) {
       // If ZohoClient throws HttpException on 404 for delete, it means it was already gone or never existed.
      if (error.status === 404) {
        this.logger.warn(`Contact with ID ${contactId} not found for deletion (404).`);
        return false; // Or true, depending on desired idempotency semantics
      }
      this.logger.error(`Error deleting contact ${contactId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  // Add other contact-specific methods as needed, e.g.:
  // - markAsActive(contactId: string)
  // - markAsInactive(contactId: string)
  // - addComment(contactId: string, comment: string)
  // - listContactPersons(contactId: string)
}
