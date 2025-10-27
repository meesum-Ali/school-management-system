import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from './payment.service';
import { ZohoClient } from '../client/zoho.client';
import { CreatePaymentDto, InvoicePaymentDto } from '../dto/create-payment.dto';
import {
  CustomerPayment,
  ZohoPaymentResponse,
  ZohoPaymentsListResponse,
} from '../entities/payment.entity';
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

const mockInvoicePaymentDto: InvoicePaymentDto = {
  invoice_id: 'inv-123',
  amount_applied: 100,
};

const mockPaymentDto: CreatePaymentDto = {
  customer_id: 'cust-123',
  payment_mode: 'cash',
  amount: 100,
  date: '2023-10-26',
  invoices: [mockInvoicePaymentDto],
};

const mockPaymentEntity: CustomerPayment = {
  payment_id: 'pay-123',
  customer_id: 'cust-123',
  customer_name: 'Test Customer',
  payment_number: 'PMT-001',
  payment_mode: 'cash',
  date: '2023-10-26',
  amount: 100,
  currency_id: 'USD-CUR',
  currency_code: 'USD',
  currency_symbol: '$',
  invoices: [
    {
      invoice_id: 'inv-123',
      invoice_number: 'INV-001',
      invoice_date: '2023-10-20',
      amount_applied: 100,
      total: 100,
      balance: 0,
    },
  ],
  // ... other required fields
};

const mockZohoPaymentResponse: ZohoPaymentResponse = {
  code: 0,
  message: 'success',
  payment: mockPaymentEntity,
};

const mockAxiosResponse = (data: any, status = 200): AxiosResponse => ({
  data,
  status,
  statusText: 'OK',
  headers: {},
  config: {} as any,
});

describe('PaymentService', () => {
  let service: PaymentService;
  let zohoClient: ZohoClient;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        { provide: ZohoClient, useValue: mockZohoClient },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
    zohoClient = module.get<ZohoClient>(ZohoClient);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('recordPayment', () => {
    it('should record a payment successfully', async () => {
      mockZohoClient.post.mockResolvedValue(
        mockAxiosResponse(mockZohoPaymentResponse),
      );
      const result = await service.recordPayment(mockPaymentDto);
      expect(result).toEqual(mockPaymentEntity);
      expect(zohoClient.post).toHaveBeenCalledWith(
        'customerpayments',
        mockPaymentDto,
      );
    });

    it('should throw error if zohoClient fails', async () => {
      mockZohoClient.post.mockRejectedValue(new Error('API Error'));
      await expect(service.recordPayment(mockPaymentDto)).rejects.toThrow(
        'API Error',
      );
    });
  });

  describe('getPayment', () => {
    it('should retrieve a payment successfully', async () => {
      mockZohoClient.get.mockResolvedValue(
        mockAxiosResponse(mockZohoPaymentResponse),
      );
      const result = await service.getPayment('pay-123');
      expect(result).toEqual(mockPaymentEntity);
      expect(zohoClient.get).toHaveBeenCalledWith('customerpayments/pay-123');
    });

    it('should return null if payment not found (404)', async () => {
      const error = new HttpException('Not Found', HttpStatus.NOT_FOUND);
      mockZohoClient.get.mockRejectedValue(error);
      const result = await service.getPayment('pay-unknown');
      expect(result).toBeNull();
    });
  });

  describe('listPayments', () => {
    const mockPaymentsListResponse: ZohoPaymentsListResponse = {
      code: 0,
      message: 'success',
      customerpayments: [
        mockPaymentEntity,
        { ...mockPaymentEntity, payment_id: 'pay-456' },
      ],
    };

    it('should list payments successfully', async () => {
      mockZohoClient.get.mockResolvedValue(
        mockAxiosResponse(mockPaymentsListResponse),
      );
      const params = { customer_id: 'cust-123' };
      const result = await service.listPayments(params);
      expect(result).toEqual(mockPaymentsListResponse.customerpayments);
      expect(zohoClient.get).toHaveBeenCalledWith('customerpayments', params);
    });

    it('should return empty array if no payments found or unexpected response', async () => {
      mockZohoClient.get.mockResolvedValue(
        mockAxiosResponse({
          code: 0,
          message: 'success',
          customerpayments: null,
        }),
      );
      const result = await service.listPayments();
      expect(result).toEqual([]);
    });
  });

  describe('updatePayment', () => {
    const updateDto: Partial<CreatePaymentDto> = {
      reference_number: 'Check #1001',
    };
    const updatedPaymentEntity: CustomerPayment = {
      ...mockPaymentEntity,
      reference_number: 'Check #1001',
    };
    const updatedResponse: ZohoPaymentResponse = {
      ...mockZohoPaymentResponse,
      payment: updatedPaymentEntity,
    };

    it('should update a payment successfully', async () => {
      mockZohoClient.put.mockResolvedValue(mockAxiosResponse(updatedResponse));
      const result = await service.updatePayment('pay-123', updateDto);
      expect(result).toEqual(updatedPaymentEntity);
      expect(zohoClient.put).toHaveBeenCalledWith(
        'customerpayments/pay-123',
        updateDto,
      );
    });
  });

  describe('deletePayment', () => {
    it('should delete a payment successfully', async () => {
      mockZohoClient.delete.mockResolvedValue(
        mockAxiosResponse({ code: 0, message: 'Payment deleted.' }),
      );
      const result = await service.deletePayment('pay-123');
      expect(result).toBe(true);
      expect(zohoClient.delete).toHaveBeenCalledWith(
        'customerpayments/pay-123',
      );
    });

    it('should return false if payment not found for deletion (404)', async () => {
      const error = new HttpException('Not Found', HttpStatus.NOT_FOUND);
      mockZohoClient.delete.mockRejectedValue(error);
      const result = await service.deletePayment('pay-unknown');
      expect(result).toBe(false);
    });
  });
});
