import { Test, TestingModule } from '@nestjs/testing';
import { ContactService } from './contact.service';
import { ZohoClient } from '../client/zoho.client';
import { CreateContactDto } from '../dto/create-contact.dto';
import { Contact, ZohoContactResponse, ZohoContactsListResponse } from '../entities/contact.entity';
import { of, throwError } from 'rxjs';
import { HttpException, HttpStatus } from '@nestjs/common';
import { AxiosResponse, AxiosError } from 'axios';

// Mocks
const mockZohoClient = {
  post: jest.fn(),
  get: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
};

const mockContactDto: CreateContactDto = {
  contact_name: 'Test Customer',
  email: 'test@example.com',
  contact_type: 'customer',
};

const mockContactEntity: Contact = {
  contact_id: 'contact-123',
  contact_name: 'Test Customer',
  email: 'test@example.com',
  contact_type: 'customer',
  status: 'active',
  // ... other required fields
};

const mockZohoContactResponse: ZohoContactResponse = {
  code: 0,
  message: 'success',
  contact: mockContactEntity,
};

const mockAxiosResponse = (data: any, status = 200): AxiosResponse => ({
  data,
  status,
  statusText: 'OK',
  headers: {},
  config: {} as any, // Use `as any` for brevity in mock
});


describe('ContactService', () => {
  let service: ContactService;
  let zohoClient: ZohoClient;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContactService,
        { provide: ZohoClient, useValue: mockZohoClient },
      ],
    }).compile();

    service = module.get<ContactService>(ContactService);
    zohoClient = module.get<ZohoClient>(ZohoClient);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createContact', () => {
    it('should create a contact successfully', async () => {
      mockZohoClient.post.mockResolvedValue(mockAxiosResponse(mockZohoContactResponse));
      const result = await service.createContact(mockContactDto);
      expect(result).toEqual(mockContactEntity);
      expect(zohoClient.post).toHaveBeenCalledWith('contacts', mockContactDto);
    });

    it('should throw error if zohoClient fails', async () => {
      mockZohoClient.post.mockRejectedValue(new Error('API Error'));
      await expect(service.createContact(mockContactDto)).rejects.toThrow('API Error');
    });

    it('should throw error if response structure is unexpected', async () => {
      mockZohoClient.post.mockResolvedValue(mockAxiosResponse({ code: 0, message: 'success', contact: null })); // Missing contact
      await expect(service.createContact(mockContactDto)).rejects.toThrow('Failed to create contact due to unexpected response structure.');
    });
  });

  describe('getContact', () => {
    it('should retrieve a contact successfully', async () => {
      mockZohoClient.get.mockResolvedValue(mockAxiosResponse(mockZohoContactResponse));
      const result = await service.getContact('contact-123');
      expect(result).toEqual(mockContactEntity);
      expect(zohoClient.get).toHaveBeenCalledWith('contacts/contact-123');
    });

    it('should return null if contact not found (404)', async () => {
      const error = new HttpException('Not Found', HttpStatus.NOT_FOUND);
      mockZohoClient.get.mockRejectedValue(error);
      const result = await service.getContact('contact-unknown');
      expect(result).toBeNull();
    });

    it('should throw error for other API errors', async () => {
      mockZohoClient.get.mockRejectedValue(new Error('API Error'));
      await expect(service.getContact('contact-123')).rejects.toThrow('API Error');
    });
  });

  describe('listContacts', () => {
    const mockContactsListResponse: ZohoContactsListResponse = {
      code: 0,
      message: 'success',
      contacts: [mockContactEntity, { ...mockContactEntity, contact_id: 'contact-456' }],
    };

    it('should list contacts successfully', async () => {
      mockZohoClient.get.mockResolvedValue(mockAxiosResponse(mockContactsListResponse));
      const params = { status: 'active' };
      const result = await service.listContacts(params);
      expect(result).toEqual(mockContactsListResponse.contacts);
      expect(zohoClient.get).toHaveBeenCalledWith('contacts', params);
    });

    it('should return empty array if no contacts found or unexpected response', async () => {
      mockZohoClient.get.mockResolvedValue(mockAxiosResponse({ code: 0, message: 'success', contacts: null }));
      const result = await service.listContacts();
      expect(result).toEqual([]);
    });

    it('should throw error if zohoClient fails', async () => {
      mockZohoClient.get.mockRejectedValue(new Error('API Error'));
      await expect(service.listContacts()).rejects.toThrow('API Error');
    });
  });

  describe('updateContact', () => {
    const updateDto: Partial<CreateContactDto> = { company_name: 'New Company' };
    const updatedContactEntity: Contact = { ...mockContactEntity, company_name: 'New Company' };
    const updatedResponse: ZohoContactResponse = { ...mockZohoContactResponse, contact: updatedContactEntity };

    it('should update a contact successfully', async () => {
      mockZohoClient.put.mockResolvedValue(mockAxiosResponse(updatedResponse));
      const result = await service.updateContact('contact-123', updateDto);
      expect(result).toEqual(updatedContactEntity);
      expect(zohoClient.put).toHaveBeenCalledWith('contacts/contact-123', updateDto);
    });

    it('should throw error if zohoClient fails', async () => {
      mockZohoClient.put.mockRejectedValue(new Error('API Error'));
      await expect(service.updateContact('contact-123', updateDto)).rejects.toThrow('API Error');
    });
  });

  describe('deleteContact', () => {
    it('should delete a contact successfully', async () => {
      // Zoho delete might return 200 OK with a success message or empty body
      mockZohoClient.delete.mockResolvedValue(mockAxiosResponse({ code: 0, message: 'Contact has been deleted.' }, 200));
      const result = await service.deleteContact('contact-123');
      expect(result).toBe(true);
      expect(zohoClient.delete).toHaveBeenCalledWith('contacts/contact-123');
    });

    it('should return false if contact not found for deletion (404)', async () => {
      const error = new HttpException('Not Found', HttpStatus.NOT_FOUND);
      mockZohoClient.delete.mockRejectedValue(error);
      const result = await service.deleteContact('contact-unknown');
      expect(result).toBe(false);
    });

    it('should throw error for other API errors', async () => {
      mockZohoClient.delete.mockRejectedValue(new Error('API Error'));
      await expect(service.deleteContact('contact-123')).rejects.toThrow('API Error');
    });
  });
});
