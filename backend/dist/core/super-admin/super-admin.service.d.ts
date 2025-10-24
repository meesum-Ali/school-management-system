import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
export declare class SuperAdminService implements OnModuleInit {
    private usersRepository;
    private configService;
    private readonly logger;
    constructor(usersRepository: Repository<User>, configService: ConfigService);
    onModuleInit(): Promise<void>;
    private createSuperAdminIfNotExists;
}
