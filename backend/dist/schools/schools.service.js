"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchoolsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const school_entity_1 = require("./entities/school.entity");
let SchoolsService = class SchoolsService {
    constructor(schoolsRepository) {
        this.schoolsRepository = schoolsRepository;
    }
    async create(createSchoolDto) {
        const existingSchoolByName = await this.schoolsRepository.findOne({
            where: { name: createSchoolDto.name },
        });
        if (existingSchoolByName) {
            throw new common_1.ConflictException(`School with name "${createSchoolDto.name}" already exists.`);
        }
        if (createSchoolDto.domain) {
            const existingSchoolByDomain = await this.schoolsRepository.findOne({
                where: { domain: createSchoolDto.domain },
            });
            if (existingSchoolByDomain) {
                throw new common_1.ConflictException(`School with domain "${createSchoolDto.domain}" already exists.`);
            }
        }
        const school = this.schoolsRepository.create(createSchoolDto);
        return this.schoolsRepository.save(school);
    }
    async findAll() {
        return this.schoolsRepository.find();
    }
    async findOne(id) {
        const school = await this.schoolsRepository.findOne({ where: { id } });
        if (!school) {
            throw new common_1.NotFoundException(`School with ID "${id}" not found`);
        }
        return school;
    }
    async findByDomain(domain) {
        const school = await this.schoolsRepository.findOne({ where: { domain } });
        return school;
    }
    async update(id, updateSchoolDto) {
        const school = await this.findOne(id);
        if (updateSchoolDto.name && updateSchoolDto.name !== school.name) {
            const existingSchoolByName = await this.schoolsRepository.findOne({
                where: { name: updateSchoolDto.name },
            });
            if (existingSchoolByName && existingSchoolByName.id !== id) {
                throw new common_1.ConflictException(`School with name "${updateSchoolDto.name}" already exists.`);
            }
        }
        if (updateSchoolDto.domain && updateSchoolDto.domain !== school.domain) {
            const existingSchoolByDomain = await this.schoolsRepository.findOne({
                where: { domain: updateSchoolDto.domain },
            });
            if (existingSchoolByDomain && existingSchoolByDomain.id !== id) {
                throw new common_1.ConflictException(`School with domain "${updateSchoolDto.domain}" already exists.`);
            }
        }
        this.schoolsRepository.merge(school, updateSchoolDto);
        return this.schoolsRepository.save(school);
    }
    async remove(id) {
        const school = await this.findOne(id);
        await this.schoolsRepository.remove(school);
    }
};
exports.SchoolsService = SchoolsService;
exports.SchoolsService = SchoolsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(school_entity_1.School)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], SchoolsService);
//# sourceMappingURL=schools.service.js.map