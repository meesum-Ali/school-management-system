import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { School } from './entities/school.entity';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';

@Injectable()
export class SchoolsService {
  constructor(
    @InjectRepository(School)
    private schoolsRepository: Repository<School>,
  ) {}

  async create(createSchoolDto: CreateSchoolDto): Promise<School> {
    // Check if school with the same name or domain already exists
    const existingSchoolByName = await this.schoolsRepository.findOne({ where: { name: createSchoolDto.name } });
    if (existingSchoolByName) {
      throw new ConflictException(`School with name "${createSchoolDto.name}" already exists.`);
    }
    if (createSchoolDto.domain) {
      const existingSchoolByDomain = await this.schoolsRepository.findOne({ where: { domain: createSchoolDto.domain } });
      if (existingSchoolByDomain) {
        throw new ConflictException(`School with domain "${createSchoolDto.domain}" already exists.`);
      }
    }

    const school = this.schoolsRepository.create(createSchoolDto as DeepPartial<School>);
    return this.schoolsRepository.save(school);
  }

  async findAll(): Promise<School[]> {
    return this.schoolsRepository.find();
  }

  async findOne(id: string): Promise<School | null> {
    const school = await this.schoolsRepository.findOne({ where: { id } });
    if (!school) {
      throw new NotFoundException(`School with ID "${id}" not found`);
    }
    return school;
  }

  async findByDomain(domain: string): Promise<School | null> {
    const school = await this.schoolsRepository.findOne({ where: { domain } });
    // Not throwing NotFoundException here as it might be used for checks
    return school;
  }

  async update(id: string, updateSchoolDto: UpdateSchoolDto): Promise<School> {
    const school = await this.findOne(id); // findOne will throw NotFoundException if not found

    // Check for conflicts if name or domain is being updated
    if (updateSchoolDto.name && updateSchoolDto.name !== school.name) {
      const existingSchoolByName = await this.schoolsRepository.findOne({ where: { name: updateSchoolDto.name } });
      if (existingSchoolByName && existingSchoolByName.id !== id) {
        throw new ConflictException(`School with name "${updateSchoolDto.name}" already exists.`);
      }
    }
    if (updateSchoolDto.domain && updateSchoolDto.domain !== school.domain) {
      const existingSchoolByDomain = await this.schoolsRepository.findOne({ where: { domain: updateSchoolDto.domain } });
      if (existingSchoolByDomain && existingSchoolByDomain.id !== id) {
        throw new ConflictException(`School with domain "${updateSchoolDto.domain}" already exists.`);
      }
    }

    this.schoolsRepository.merge(school, updateSchoolDto as DeepPartial<School>);
    return this.schoolsRepository.save(school);
  }

  async remove(id: string): Promise<void> {
    const school = await this.findOne(id); // findOne will throw NotFoundException if not found
    // Consider soft delete or cascading deletes based on requirements
    // For now, a hard delete:
    await this.schoolsRepository.remove(school);
  }
}
