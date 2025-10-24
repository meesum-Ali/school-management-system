import { SchoolsService } from './schools.service';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';
import { School } from './entities/school.entity';
export declare class SchoolsController {
    private readonly schoolsService;
    constructor(schoolsService: SchoolsService);
    create(createSchoolDto: CreateSchoolDto): Promise<School>;
    findAll(): Promise<School[]>;
    findOne(id: string): Promise<School | null>;
    update(id: string, updateSchoolDto: UpdateSchoolDto): Promise<School>;
    remove(id: string): Promise<void>;
}
