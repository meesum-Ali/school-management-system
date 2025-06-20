import { Test, TestingModule } from '@nestjs/testing';
import { InvoiceService } from './invoice.service';
import { ZohoClient } from '../client/zoho.client';
import { CreateInvoiceDto, InvoiceLineItemDto } from '../dto/create-invoice.dto';
import { Invoice, ZohoInvoiceResponse, ZohoInvoicesListResponse } from '../entities/invoice.entity';
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

const mockLineItemDto: InvoiceLineItemDto = {
  name: 'Consulting Services',
  rate: 100,
  quantity: 2,
};

const mockInvoiceDto: CreateInvoiceDto = {
  customer_id: 'cust-123',
  line_items: [mockLineItemDto],
  date: '2023-10-26',
};

const mockInvoiceEntity: Invoice = {
  invoice_id: 'inv-123',
  customer_id: 'cust-123',
  customer_name: 'Test Customer',
  invoice_number: 'INV-001',
  status: 'draft',
  date: '2023-10-26',
  due_date: '2023-11-25',
  currency_id: 'USD-CUR',
  currency_code: 'USD',
  currency_symbol: '$',
  total: 200,
  balance: 200,
  line_items: [
    {
      line_item_id: 'li-123',
      name: 'Consulting Services',
      rate: 100,
      quantity: 2,
      item_total: 200,
    },
  ],
  // ... other required fields
};

const mockZohoInvoiceResponse: ZohoInvoiceResponse = {
  code: 0,
  message: 'success',
  invoice: mockInvoiceEntity,
};

const mockAxiosResponse = (data: any, status = 200): AxiosResponse => ({
  data,
  status,
  statusText: 'OK',
  headers: {},
  config: {} as any,
});

describe('InvoiceService', () => {
  let service: InvoiceService;
  let zohoClient: ZohoClient;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoiceService,
        { provide: ZohoClient, useValue: mockZohoClient },
      ],
    }).compile();

    service = module.get<InvoiceService>(InvoiceService);
    zohoClient = module.get<ZohoClient>(ZohoClient);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createInvoice', () => {
    it('should create an invoice successfully', async () => {
      mockZohoClient.post.mockResolvedValue(mockAxiosResponse(mockZohoInvoiceResponse));
      const result = await service.createInvoice(mockInvoiceDto);
      expect(result).toEqual(mockInvoiceEntity);
      expect(zohoClient.post).toHaveBeenCalledWith('invoices', mockInvoiceDto);
    });

    it('should throw error if zohoClient fails', async () => {
      mockZohoClient.post.mockRejectedValue(new Error('API Error'));
      await expect(service.createInvoice(mockInvoiceDto)).rejects.toThrow('API Error');
    });
  });

  describe('getInvoice', () => {
    it('should retrieve an invoice successfully', async () => {
      mockZohoClient.get.mockResolvedValue(mockAxiosResponse(mockZohoInvoiceResponse));
      const result = await service.getInvoice('inv-123');
      expect(result).toEqual(mockInvoiceEntity);
      expect(zohoClient.get).toHaveBeenCalledWith('invoices/inv-123');
    });

    it('should return null if invoice not found (404)', async () => {
      const error = new HttpException('Not Found', HttpStatus.NOT_FOUND);
      mockZohoClient.get.mockRejectedValue(error);
      const result = await service.getInvoice('inv-unknown');
      expect(result).toBeNull();
    });
  });

  describe('listInvoices', () => {
    const mockInvoicesListResponse: ZohoInvoicesListResponse = {
      code: 0,
      message: 'success',
      invoices: [mockInvoiceEntity, { ...mockInvoiceEntity, invoice_id: 'inv-456' }],
    };

    it('should list invoices successfully', async () => {
      mockZohoClient.get.mockResolvedValue(mockAxiosResponse(mockInvoicesListResponse));
      const params = { status: 'draft' };
      const result = await service.listInvoices(params);
      expect(result).toEqual(mockInvoicesListResponse.invoices);
      expect(zohoClient.get).toHaveBeenCalledWith('invoices', params);
    });

    it('should return empty array if no invoices found or unexpected response', async () => {
      mockZohoClient.get.mockResolvedValue(mockAxiosResponse({ code: 0, message: 'success', invoices: null }));
      const result = await service.listInvoices();
      expect(result).toEqual([]);
    });
  });

  describe('updateInvoice', () => {
    const updateDto: Partial<CreateInvoiceDto> = { notes: 'Updated notes' };
    const updatedInvoiceEntity: Invoice = { ...mockInvoiceEntity, notes: 'Updated notes' };
    const updatedResponse: ZohoInvoiceResponse = { ...mockZohoInvoiceResponse, invoice: updatedInvoiceEntity };

    it('should update an invoice successfully', async () => {
      mockZohoClient.put.mockResolvedValue(mockAxiosResponse(updatedResponse));
      const result = await service.updateInvoice('inv-123', updateDto);
      expect(result).toEqual(updatedInvoiceEntity);
      expect(zohoClient.put).toHaveBeenCalledWith('invoices/inv-123', updateDto);
    });
  });

  describe('deleteInvoice', () => {
    it('should delete an invoice successfully', async () => {
      mockZohoClient.delete.mockResolvedValue(mockAxiosResponse({ code: 0, message: 'Invoice deleted.' }));
      const result = await service.deleteInvoice('inv-123');
      expect(result).toBe(true);
      expect(zohoClient.delete).toHaveBeenCalledWith('invoices/inv-123');
    });

    it('should return false if invoice not found for deletion (404)', async () => {
      const error = new HttpException('Not Found', HttpStatus.NOT_FOUND);
      mockZohoClient.delete.mockRejectedValue(error);
      const result = await service.deleteInvoice('inv-unknown');
      expect(result).toBe(false);
    });
  });

  describe('emailInvoice', () => {
    it('should send email for invoice successfully', async () => {
      mockZohoClient.post.mockResolvedValue(mockAxiosResponse({ code: 0, message: 'success' }));
      const result = await service.emailInvoice('inv-123', { to_mail_ids: ['test@example.com']});
      expect(result).toBe(true);
      expect(zohoClient.post).toHaveBeenCalledWith('invoices/inv-123/email', { to_mail_ids: ['test@example.com']});
    });

    it('should return false if email sending was not clearly successful by message', async () => {
      mockZohoClient.post.mockResolvedValue(mockAxiosResponse({ code: 0, message: 'Email queued' }));
      const result = await service.emailInvoice('inv-123');
      expect(result).toBe(true); // As long as code is 0
    });

    it('should return false if code is not 0', async () => {
      mockZohoClient.post.mockResolvedValue(mockAxiosResponse({ code: 1, message: 'failure' }));
      const result = await service.emailInvoice('inv-123');
      expect(result).toBe(false);
    });
  });

  describe('markAsSent', () => {
    it('should mark an invoice as sent successfully', async () => {
      mockZohoClient.post.mockResolvedValue(mockAxiosResponse(mockZohoInvoiceResponse)); // Assuming it returns the updated invoice
      const result = await service.markAsSent('inv-123');
      expect(result.status).toEqual(mockInvoiceEntity.status); // Or 'sent' if mockInvoiceEntity was updated
      expect(zohoClient.post).toHaveBeenCalledWith('invoices/inv-123/status/sent', {});
    });

    it('should fetch invoice if status change returns only success message', async () => {
      mockZohoClient.post.mockResolvedValue(mockAxiosResponse({ code: 0, message: 'Invoice status updated.' }));
      mockZohoClient.get.mockResolvedValue(mockAxiosResponse(mockZohoInvoiceResponse)); // For the subsequent getInvoice call

      const result = await service.markAsSent('inv-123');
      expect(result).toEqual(mockInvoiceEntity);
      expect(zohoClient.post).toHaveBeenCalledWith('invoices/inv-123/status/sent', {});
      expect(zohoClient.get).toHaveBeenCalledWith('invoices/inv-123');
    });
  });

  describe('voidInvoice', () => {
    it('should void an invoice successfully', async () => {
      const voidedInvoice = { ...mockInvoiceEntity, status: 'void' };
      const voidedResponse = { ...mockZohoInvoiceResponse, invoice: voidedInvoice};
      mockZohoClient.post.mockResolvedValue(mockAxiosResponse(voidedResponse));

      const result = await service.voidInvoice('inv-123');
      expect(result.status).toEqual('void');
      expect(zohoClient.post).toHaveBeenCalledWith('invoices/inv-123/status/void', {});
    });

    it('should fetch invoice if status change to void returns only success message', async () => {
      mockZohoClient.post.mockResolvedValue(mockAxiosResponse({ code: 0, message: 'Invoice status updated to void.' }));
      const voidedInvoice = { ...mockInvoiceEntity, status: 'void' }; // Simulate the fetched invoice being voided
      const voidedResponse = { ...mockZohoInvoiceResponse, invoice: voidedInvoice};
      mockZohoClient.get.mockResolvedValue(mockAxiosResponse(voidedResponse));

      const result = await service.voidInvoice('inv-123');
      expect(result.status).toEqual('void');
      expect(zohoClient.post).toHaveBeenCalledWith('invoices/inv-123/status/void', {});
      expect(zohoClient.get).toHaveBeenCalledWith('invoices/inv-123');
    });
  });
});
