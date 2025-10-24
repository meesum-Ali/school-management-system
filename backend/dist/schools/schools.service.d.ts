import { Repository } from 'typeorm';
import { School } from './entities/school.entity';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';
export declare class SchoolsService {
    private schoolsRepository;
    constructor(schoolsRepository: Repository<School>);
    create(createSchoolDto: CreateSchoolDto): Promise<School>;
    findAll(): Promise<School[]>;
    findOne(id: string): Promise<School | null>;
    findByDomain(domain: string): Promise<School | null>;
    update(id: string, updateSchoolDto: UpdateSchoolDto): Promise<School>;
    remove(id: string): Promise<void>;
}
