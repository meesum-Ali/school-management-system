# Quick Start Checklist: Adding New Modules

This is a practical, step-by-step checklist for adding new features to the school management system. Nginx serves the Next.js 16 frontend and proxies API requests to the backend. Follow this when adding any new module (Teacher Portal, Student Portal, Attendance, etc.).

---

## 📋 Pre-Development Checklist

- [ ] Review `AGENTS.md` for architectural guidelines
- [ ] Review `PROJECT_ARCHITECTURE_GUIDE.md` for patterns
- [ ] Review `VISUAL_DIAGRAMS.md` for understanding data flow
- [ ] Identify which role(s) will access this feature (ADMIN, TEACHER, STUDENT)
- [ ] List all entities/tables needed
- [ ] Identify relationships with existing modules
- [ ] Design API endpoints (GET, POST, PATCH, DELETE)
- [ ] Sketch UI components and pages

---

## 🔧 Backend Development

### Phase 1: Module Setup (5-10 min)

```bash
# Navigate to backend
cd backend

# Generate NestJS resources
nest g module module-name
nest g controller module-name
nest g service module-name
```

- [ ] Module files created in `src/module-name/`
- [ ] Module automatically added to `app.module.ts` imports

### Phase 2: Entity & Database (10-15 min)

Create `src/module-name/entities/module-name.entity.ts`:

````
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { School } from '../../schools/entities/school.entity';

@Entity('table_name')
@Index(['field', 'schoolId'], { unique: true }) // If needed
export class EntityName {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  fieldName: string;

  // Multi-tenancy (REQUIRED)
  @Column({ name: 'school_id', type: 'uuid' })
  schoolId: string;

  @ManyToOne(() => School, { onDelete: 'CASCADE', lazy: true })
  @JoinColumn({ name: 'school_id' })
  school: Promise<School>;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
```

Checklist:
- [ ] Entity class created with `@Entity()` decorator
- [ ] All fields have appropriate TypeORM decorators
- [ ] `schoolId` field added for multi-tenancy
- [ ] Relationships defined with lazy loading
- [ ] Timestamps added (createdAt, updatedAt)
- [ ] Unique constraints/indexes added if needed

### Phase 3: DTOs (15-20 min)

Create `src/module-name/dto/`:

**create-module-name.dto.ts:**
```typescript
import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateModuleNameDto {
  @ApiProperty({ example: 'Example', description: 'Field description' })
  @IsString()
  @IsNotEmpty()
  fieldName: string;

  @ApiPropertyOptional({ description: 'Optional field' })
  @IsString()
  @IsOptional()
  optionalField?: string;
}
```

**update-module-name.dto.ts:**
```typescript
import { PartialType } from '@nestjs/swagger';
import { CreateModuleNameDto } from './create-module-name.dto';

export class UpdateModuleNameDto extends PartialType(CreateModuleNameDto) {}
```

**module-name.dto.ts (Response DTO):**
```typescript
import { ApiProperty } from '@nestjs/swagger';

export class ModuleNameDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  fieldName: string;

  @ApiProperty()
  schoolId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
```

Checklist:
- [ ] CreateDto with validation decorators
- [ ] UpdateDto extending CreateDto with PartialType
- [ ] Response DTO (without sensitive fields)
- [ ] Swagger decorators on all fields

### Phase 4: Service Implementation (30-45 min)

Update `src/module-name/module-name.service.ts`:

```typescript
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EntityName } from './entities/module-name.entity';
import { CreateModuleNameDto } from './dto/create-module-name.dto';
import { UpdateModuleNameDto } from './dto/update-module-name.dto';
import { ModuleNameDto } from './dto/module-name.dto';

@Injectable()
export class ModuleNameService {
  constructor(
    @InjectRepository(EntityName)
    private repository: Repository<EntityName>,
  ) {}

  private mapToDto(entity: EntityName): ModuleNameDto {
    return {
      id: entity.id,
      fieldName: entity.fieldName,
      schoolId: entity.schoolId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  async create(dto: CreateModuleNameDto, schoolId: string): Promise<ModuleNameDto> {
    // Check for duplicates if needed
    const existing = await this.repository.findOne({
      where: { fieldName: dto.fieldName, schoolId }
    });
    if (existing) {
      throw new ConflictException('Entity already exists');
    }

    const entity = this.repository.create({ ...dto, schoolId });
    const saved = await this.repository.save(entity);
    return this.mapToDto(saved);
  }

  async findAll(schoolId: string): Promise<ModuleNameDto[]> {
    const entities = await this.repository.find({
      where: { schoolId },
      order: { createdAt: 'DESC' }
    });
    return entities.map(e => this.mapToDto(e));
  }

  async findOne(id: string, schoolId: string): Promise<ModuleNameDto> {
    const entity = await this.repository.findOne({
      where: { id, schoolId }
    });
    if (!entity) {
      throw new NotFoundException('Entity not found');
    }
    return this.mapToDto(entity);
  }

  async update(id: string, dto: UpdateModuleNameDto, schoolId: string): Promise<ModuleNameDto> {
    const entity = await this.repository.findOne({
      where: { id, schoolId }
    });
    if (!entity) {
      throw new NotFoundException('Entity not found');
    }

    Object.assign(entity, dto);
    const updated = await this.repository.save(entity);
    return this.mapToDto(updated);
  }

  async remove(id: string, schoolId: string): Promise<void> {
    const entity = await this.repository.findOne({
      where: { id, schoolId }
    });
    if (!entity) {
      throw new NotFoundException('Entity not found');
    }
    await this.repository.remove(entity);
  }
}
```

Checklist:
- [ ] Repository injected via `@InjectRepository`
- [ ] mapToDto helper method created
- [ ] create() method with duplicate checking
- [ ] findAll() with schoolId filter
- [ ] findOne() with schoolId filter
- [ ] update() with schoolId filter
- [ ] remove() with schoolId filter
- [ ] All methods enforce multi-tenancy
- [ ] Proper error handling (NotFoundException, ConflictException)

### Phase 5: Controller Implementation (20-30 min)

Update `src/module-name/module-name.controller.ts`:

```typescript
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  ParseUUIDPipe,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { ModuleNameService } from './module-name.service';
import { CreateModuleNameDto } from './dto/create-module-name.dto';
import { UpdateModuleNameDto } from './dto/update-module-name.dto';
import { ModuleNameDto } from './dto/module-name.dto';

@ApiTags('Module Name')
@ApiBearerAuth()
@Controller('module-name')
@UseGuards(AuthGuard('zitadel'), RolesGuard)
@Roles(UserRole.SCHOOL_ADMIN) // Adjust based on requirements
export class ModuleNameController {
  constructor(private readonly service: ModuleNameService) {}

  @Post()
  @ApiOperation({ summary: 'Create new entity' })
  @ApiResponse({ status: HttpStatus.CREATED, type: ModuleNameDto })
  async create(@Body() dto: CreateModuleNameDto, @Req() req: any): Promise<ModuleNameDto> {
    return this.service.create(dto, req.user.schoolId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all entities' })
  @ApiResponse({ status: HttpStatus.OK, type: [ModuleNameDto] })
  async findAll(@Req() req: any): Promise<ModuleNameDto[]> {
    return this.service.findAll(req.user.schoolId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get entity by ID' })
  @ApiResponse({ status: HttpStatus.OK, type: ModuleNameDto })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: any
  ): Promise<ModuleNameDto> {
    return this.service.findOne(id, req.user.schoolId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update entity' })
  @ApiResponse({ status: HttpStatus.OK, type: ModuleNameDto })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateModuleNameDto,
    @Req() req: any
  ): Promise<ModuleNameDto> {
    return this.service.update(id, dto, req.user.schoolId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete entity' })
  @ApiResponse({ status: HttpStatus.OK })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: any
  ): Promise<void> {
    return this.service.remove(id, req.user.schoolId);
  }
}
```

Checklist:
- [ ] Swagger tags and bearer auth added
- [ ] Guards applied (AuthGuard, RolesGuard)
- [ ] Roles decorator with appropriate role(s)
- [ ] All endpoints extract schoolId from req.user
- [ ] UUID validation on ID parameters
- [ ] Swagger documentation on all endpoints
- [ ] HTTP status codes documented

### Phase 6: Module Registration (5 min)

Update `src/module-name/module-name.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModuleNameController } from './module-name.controller';
import { ModuleNameService } from './module-name.service';
import { EntityName } from './entities/module-name.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([EntityName]),
  ],
  controllers: [ModuleNameController],
  providers: [ModuleNameService],
  exports: [ModuleNameService], // If other modules need this service
})
export class ModuleNameModule {}
```

Checklist:
- [ ] TypeORM entities registered
- [ ] Controllers registered
- [ ] Services registered
- [ ] Service exported if needed by other modules

### Phase 7: Testing Backend (15-20 min)

```bash
# Start backend
npm run start:dev

# Open Swagger
# http://localhost:5000/api/docs
```

Checklist:
- [ ] Backend starts without errors
- [ ] Swagger UI shows new endpoints
- [ ] Test each endpoint via Swagger:
  - [ ] POST /module-name (create)
  - [ ] GET /module-name (list)
  - [ ] GET /module-name/:id (get one)
  - [ ] PATCH /module-name/:id (update)
  - [ ] DELETE /module-name/:id (delete)
- [ ] Verify multi-tenancy (can't access other school's data)
- [ ] Check error responses (404, 400, 409)

---

## 🎨 Frontend Development

### Phase 1: Type Definitions (10 min)

Create `frontend/types/module-name.ts`:

```typescript
export interface ModuleName {
  id: string;
  fieldName: string;
  schoolId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateModuleNameDto {
  fieldName: string;
  optionalField?: string;
}

export interface UpdateModuleNameDto {
  fieldName?: string;
  optionalField?: string;
}
```

Checklist:
- [ ] Interface matches backend DTO structure
- [ ] Date fields are strings (network format)
- [ ] Create/Update DTOs defined

### Phase 2: API Functions (15 min)

Add to `frontend/lib/api.ts`:

```typescript
import { ModuleName, CreateModuleNameDto, UpdateModuleNameDto } from '../types/module-name';

const MODULE_API_PATH = '/module-name';

export const fetchModuleNames = async (): Promise<ModuleName[]> => {
  const response = await api.get<ModuleName[]>(MODULE_API_PATH);
  return response.data;
};

export const fetchModuleNameById = async (id: string): Promise<ModuleName> => {
  const response = await api.get<ModuleName>(`${MODULE_API_PATH}/${id}`);
  return response.data;
};

export const createModuleName = async (data: CreateModuleNameDto): Promise<ModuleName> => {
  const response = await api.post<ModuleName>(MODULE_API_PATH, data);
  return response.data;
};

export const updateModuleName = async (
  id: string,
  data: UpdateModuleNameDto
): Promise<ModuleName> => {
  const response = await api.patch<ModuleName>(`${MODULE_API_PATH}/${id}`, data);
  return response.data;
};

export const deleteModuleName = async (id: string): Promise<void> => {
  await api.delete(`${MODULE_API_PATH}/${id}`);
};
```

Checklist:
- [ ] All CRUD operations defined
- [ ] Proper TypeScript types
- [ ] Error handling via axios interceptors

### Phase 3: React Query Hooks (15 min)

Create `frontend/hooks/useModuleName.ts`:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchModuleNames,
  fetchModuleNameById,
  createModuleName,
  updateModuleName,
  deleteModuleName,
} from '@/lib/api';
import { CreateModuleNameDto, UpdateModuleNameDto } from '@/types/module-name';

export const moduleNameKeys = {
  all: ['module-name'] as const,
  detail: (id: string) => ['module-name', id] as const,
};

export function useModuleNames() {
  return useQuery({
    queryKey: moduleNameKeys.all,
    queryFn: fetchModuleNames,
  });
}

export function useModuleName(id: string) {
  return useQuery({
    queryKey: moduleNameKeys.detail(id),
    queryFn: () => fetchModuleNameById(id),
    enabled: !!id,
  });
}

export function useCreateModuleName() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateModuleNameDto) => createModuleName(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moduleNameKeys.all });
    },
  });
}

export function useUpdateModuleName() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateModuleNameDto }) =>
      updateModuleName(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: moduleNameKeys.all });
      queryClient.invalidateQueries({ queryKey: moduleNameKeys.detail(variables.id) });
    },
  });
}

export function useDeleteModuleName() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteModuleName(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moduleNameKeys.all });
    },
  });
}
```

Checklist:
- [ ] Query keys defined hierarchically
- [ ] All CRUD hooks created
- [ ] Cache invalidation on mutations
- [ ] TypeScript types applied

### Phase 4: UI Components (30-45 min)

Create `frontend/components/ModuleName/ModuleNameList.tsx`:

```typescript
'use client';

import React from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { ModuleName } from '@/types/module-name';

interface ModuleNameListProps {
  items: ModuleName[];
  onDelete: (id: string) => void;
}

export const ModuleNameList: React.FC<ModuleNameListProps> = ({ items, onDelete }) => {
  return (
    <Card>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Module Name Management</h1>
        <Button href="/admin/module-name/create">Create New</Button>
      </div>
      {items.length === 0 ? (
        <p>No items found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Field Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Created At
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{item.fieldName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <Button
                      href={`/admin/module-name/${item.id}`}
                      variant="outline"
                      size="sm"
                      className="mr-2"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDelete(item.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};
```

Create `frontend/components/ModuleName/ModuleNameForm.tsx`:

```typescript
'use client';

import React, { useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { ModuleName, CreateModuleNameDto, UpdateModuleNameDto } from '@/types/module-name';

interface ModuleNameFormProps {
  item?: ModuleName;
  onSubmit: (data: CreateModuleNameDto | UpdateModuleNameDto) => void;
  isSubmitting: boolean;
}

interface FormValues {
  fieldName: string;
  optionalField?: string;
}

const schema = yup.object().shape({
  fieldName: yup.string().required('Field is required'),
  optionalField: yup.string().optional(),
});

export const ModuleNameForm: React.FC<ModuleNameFormProps> = ({
  item,
  onSubmit,
  isSubmitting,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      fieldName: item?.fieldName || '',
      optionalField: '',
    },
  });

  useEffect(() => {
    if (item) {
      reset({ fieldName: item.fieldName });
    }
  }, [item, reset]);

  const onSubmitForm: SubmitHandler<FormValues> = (data) => {
    onSubmit(data);
  };

  return (
    <Card>
      <h2 className="text-xl font-semibold mb-4">
        {item ? 'Edit' : 'Create'} Module Name
      </h2>
      <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
        <Input
          label="Field Name"
          {...register('fieldName')}
          error={errors.fieldName?.message}
        />
        
        <Input
          label="Optional Field"
          {...register('optionalField')}
          error={errors.optionalField?.message}
        />

        <div className="flex gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
          <Button type="button" variant="outline" href="/admin/module-name">
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
};
```

Checklist:
- [ ] List component created
- [ ] Form component created
- [ ] Yup validation schema defined
- [ ] Loading/submitting states handled
- [ ] Error displays implemented

### Phase 5: Pages (20-30 min)

Create `frontend/app/admin/module-name/page.tsx` (List):

```typescript
'use client';

import React from 'react';
import { useModuleNames, useDeleteModuleName } from '@/hooks/useModuleName';
import AdminLayout from '@/components/Layout/AdminLayout';
import { ModuleNameList } from '@/components/ModuleName/ModuleNameList';
import Notification from '@/components/Layout/Notification';

export default function ModuleNamePage() {
  const { data = [], isLoading, error } = useModuleNames();
  const deleteMutation = useDeleteModuleName();

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure?')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (err) {
        console.error('Failed to delete:', err);
      }
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto p-4">
        {(error || deleteMutation.error) && (
          <Notification
            message={error?.message || deleteMutation.error?.message || 'Error occurred'}
            type="error"
            onClose={() => deleteMutation.reset()}
          />
        )}
        {isLoading ? <p>Loading...</p> : <ModuleNameList items={data} onDelete={handleDelete} />}
      </div>
    </AdminLayout>
  );
}
```

Create `frontend/app/admin/module-name/create/page.tsx`:

```typescript
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useCreateModuleName } from '@/hooks/useModuleName';
import AdminLayout from '@/components/Layout/AdminLayout';
import { ModuleNameForm } from '@/components/ModuleName/ModuleNameForm';
import Notification from '@/components/Layout/Notification';

export default function CreateModuleNamePage() {
  const router = useRouter();
  const createMutation = useCreateModuleName();

  const handleSubmit = async (data: any) => {
    try {
      await createMutation.mutateAsync(data);
      router.push('/admin/module-name');
    } catch (err) {
      console.error('Failed to create:', err);
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto p-4">
        {createMutation.error && (
          <Notification
            message={createMutation.error.message}
            type="error"
            onClose={() => createMutation.reset()}
          />
        )}
        <ModuleNameForm onSubmit={handleSubmit} isSubmitting={createMutation.isPending} />
      </div>
    </AdminLayout>
  );
}
```

Create `frontend/app/admin/module-name/[id]/page.tsx` (Edit):

```typescript
'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useModuleName, useUpdateModuleName } from '@/hooks/useModuleName';
import AdminLayout from '@/components/Layout/AdminLayout';
import { ModuleNameForm } from '@/components/ModuleName/ModuleNameForm';
import Notification from '@/components/Layout/Notification';

export default function EditModuleNamePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const { data: item, isLoading, error } = useModuleName(id);
  const updateMutation = useUpdateModuleName();

  const handleSubmit = async (data: any) => {
    try {
      await updateMutation.mutateAsync({ id, data });
      router.push('/admin/module-name');
    } catch (err) {
      console.error('Failed to update:', err);
    }
  };

  if (isLoading) return <AdminLayout><p>Loading...</p></AdminLayout>;
  if (error || !item) return <AdminLayout><p>Error loading data</p></AdminLayout>;

  return (
    <AdminLayout>
      <div className="container mx-auto p-4">
        {updateMutation.error && (
          <Notification
            message={updateMutation.error.message}
            type="error"
            onClose={() => updateMutation.reset()}
          />
        )}
        <ModuleNameForm
          item={item}
          onSubmit={handleSubmit}
          isSubmitting={updateMutation.isPending}
        />
      </div>
    </AdminLayout>
  );
}
```

Checklist:
- [ ] List page created
- [ ] Create page created
- [ ] Edit page created
- [ ] AdminLayout wrapper applied
- [ ] Error notifications implemented
- [ ] Navigation after successful mutations

### Phase 6: Navigation (5 min)

Update `frontend/components/Layout/Sidebar.tsx`:

```typescript
// Add to navigation items
const navItems = [
  // ... existing items
  { name: 'Module Name', href: '/admin/module-name', icon: IconComponent },
];
```

Checklist:
- [ ] Link added to sidebar
- [ ] Icon selected (optional)
- [ ] Conditional rendering based on role (if needed)

### Phase 7: Testing Frontend (15-20 min)

```bash
# Start frontend
npm run dev

# Open browser
# http://localhost:3000
```

Checklist:
- [ ] Navigate to new module page
- [ ] Test create flow
- [ ] Test list view
- [ ] Test edit flow
- [ ] Test delete flow
- [ ] Verify loading states
- [ ] Verify error handling
- [ ] Check responsive design

---

## 📊 Post-Development

### Documentation
- [ ] Update `PROJECT_ARCHITECTURE_GUIDE.md` if needed
- [ ] Add API endpoints to Swagger
- [ ] Document any new environment variables
- [ ] Update README if user-facing changes

### Testing
- [ ] Write unit tests for service layer
- [ ] Write controller tests
- [ ] Write component tests
- [ ] Test multi-tenancy isolation
- [ ] Test with different roles

### Code Quality
- [ ] Run linter: `npm run lint`
- [ ] Fix any linting errors
- [ ] Format code consistently
- [ ] Remove console.logs
- [ ] Add proper error messages

### Git
- [ ] Commit with clear message: `feat: add module-name management`
- [ ] Push to feature branch
- [ ] Create pull request
- [ ] Request code review

---

## 🎯 Time Estimates

| Phase | Backend | Frontend | Total |
|-------|---------|----------|-------|
| Setup | 5-10 min | - | 5-10 min |
| Entity & DTOs | 25-35 min | 10 min | 35-45 min |
| Service | 30-45 min | - | 30-45 min |
| Controller | 20-30 min | - | 20-30 min |
| API Layer | - | 15 min | 15 min |
| Hooks | - | 15 min | 15 min |
| Components | - | 30-45 min | 30-45 min |
| Pages | - | 20-30 min | 20-30 min |
| Testing | 15-20 min | 15-20 min | 30-40 min |
| **Total** | **95-140 min** | **105-120 min** | **3.5-4.5 hours** |

---

## 💡 Pro Tips

1. **Start with Backend**: Always implement backend first so you can test APIs immediately
2. **Test Incrementally**: Test each endpoint before moving to frontend
3. **Use Swagger**: Test all APIs in Swagger UI before writing frontend code
4. **Copy Similar Modules**: Use students or teachers module as template
5. **Multi-tenancy First**: Always add schoolId filtering from the start
6. **Cache Strategy**: Think about cache invalidation patterns early
7. **Error Handling**: Add comprehensive error handling from day one
8. **Types First**: Define TypeScript types before implementing logic

---

## 🔍 Common Pitfalls

❌ **Forgetting multi-tenancy**
```typescript
// WRONG
const students = await this.repository.find();

// CORRECT
const students = await this.repository.find({ where: { schoolId } });
```

❌ **Not invalidating cache**
```typescript
// WRONG
useMutation({ mutationFn: createItem });

// CORRECT
useMutation({
  mutationFn: createItem,
  onSuccess: () => queryClient.invalidateQueries(['items'])
});
```

❌ **Missing guards**
```typescript
// WRONG
@Controller('items')
export class ItemsController {}

// CORRECT
@Controller('items')
@UseGuards(AuthGuard('zitadel'), RolesGuard)
@Roles(UserRole.SCHOOL_ADMIN)
export class ItemsController {}
```

❌ **Not handling loading states**
```typescript
// WRONG
const { data } = useItems();
return <List items={data} />;

// CORRECT
const { data, isLoading, error } = useItems();
if (isLoading) return <p>Loading...</p>;
if (error) return <Error message={error.message} />;
return <List items={data || []} />;
```

---

This checklist ensures consistent, secure, and maintainable code across all new features!
