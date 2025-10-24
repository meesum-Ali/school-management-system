import { ZohoClient } from '../client/zoho.client';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { CustomerPayment } from '../entities/payment.entity';
export declare class PaymentService {
    private readonly zohoClient;
    private readonly logger;
    private readonly endpoint;
    constructor(zohoClient: ZohoClient);
    recordPayment(paymentDto: CreatePaymentDto): Promise<CustomerPayment>;
    getPayment(paymentId: string): Promise<CustomerPayment | null>;
    listPayments(params?: Record<string, any>): Promise<CustomerPayment[]>;
    updatePayment(paymentId: string, updateDto: Partial<CreatePaymentDto>): Promise<CustomerPayment>;
    deletePayment(paymentId: string): Promise<boolean>;
}
