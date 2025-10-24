import { ZohoClient } from '../client/zoho.client';
import { CreateContactDto } from '../dto/create-contact.dto';
import { Contact } from '../entities/contact.entity';
export declare class ContactService {
    private readonly zohoClient;
    private readonly logger;
    private readonly endpoint;
    constructor(zohoClient: ZohoClient);
    createContact(contactDto: CreateContactDto): Promise<Contact>;
    getContact(contactId: string): Promise<Contact | null>;
    listContacts(params?: Record<string, any>): Promise<Contact[]>;
    updateContact(contactId: string, updateDto: Partial<CreateContactDto>): Promise<Contact>;
    deleteContact(contactId: string): Promise<boolean>;
}
