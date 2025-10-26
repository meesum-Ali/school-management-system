# 🎴 Quick Reference Card

## One-Page Cheat Sheet for School Management System

---

## 🚀 Start Development

```bash
# Backend
cd backend && npm install && npm run start:dev

# Frontend
cd frontend && npm install && npm run dev

# Docker Services
docker-compose up -d db zitadel
```

**URLs**:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000/api
- Swagger: http://localhost:5000/api/docs

---

## 📂 File Locations Quick Map

```
Need to...                          → Go to...
─────────────────────────────────────────────────────────────
Add backend endpoint               → backend/src/{module}/{module}.controller.ts
Add business logic                 → backend/src/{module}/{module}.service.ts
Add database table                 → backend/src/{module}/entities/{entity}.entity.ts
Add validation rules               → backend/src/{module}/dto/create-{module}.dto.ts
Add API function                   → frontend/lib/api.ts
Add React Query hook               → frontend/hooks/use{Module}.ts
Add UI component                   → frontend/components/{Module}/{Component}.tsx
Add page                           → frontend/app/{role}/{module}/page.tsx
Add type definition                → frontend/types/{module}.ts
```

---

## 🔑 Essential Code Snippets

### Backend: Create Entity
```typescript
@Entity('table_name')
export class EntityName {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'school_id', type: 'uuid' })
  schoolId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### Backend: Create Controller
```typescript
@Controller('resource')
@UseGuards(AuthGuard('zitadel'), RolesGuard)
@Roles(UserRole.SCHOOL_ADMIN)
export class ResourceController {
  @Get()
  findAll(@Req() req: any) {
    return this.service.findAll(req.user.schoolId);
  }
}
```

### Backend: Create Service
```typescript
@Injectable()
export class ResourceService {
  constructor(
    @InjectRepository(Entity)
    private repo: Repository<Entity>
  ) {}

  async findAll(schoolId: string) {
    return this.repo.find({ where: { schoolId } });
  }
}
```

### Frontend: API Function
```typescript
export const fetchItems = async (): Promise<Item[]> => {
  const response = await api.get<Item[]>('/items');
  return response.data;
};
```

### Frontend: React Query Hook
```typescript
export function useItems() {
  return useQuery({
    queryKey: ['items'],
    queryFn: fetchItems,
  });
}
```

### Frontend: Component
```typescript
'use client';

export default function ItemsPage() {
  const { data = [], isLoading } = useItems();
  
  if (isLoading) return <p>Loading...</p>;
  
  return <ItemList items={data} />;
}
```

---

## 🔐 Security Checklist

**Backend**:
- [ ] `@UseGuards(AuthGuard('zitadel'), RolesGuard)` on controller
- [ ] `@Roles(UserRole.SCHOOL_ADMIN)` decorator
- [ ] Extract `schoolId` from `req.user`
- [ ] Filter all queries by `schoolId`
- [ ] Validate input with DTOs
- [ ] Map entities to DTOs before returning

**Frontend**:
- [ ] Token stored in localStorage
- [ ] Token sent in Authorization header
- [ ] Handle 401/403 errors
- [ ] Redirect to login when unauthenticated

---

## 🎯 Module Structure Pattern

```
module-name/
├── entities/
│   └── module-name.entity.ts       # Database schema
├── dto/
│   ├── create-module-name.dto.ts   # Input validation
│   ├── update-module-name.dto.ts   # Update validation
│   └── module-name.dto.ts          # Response schema
├── module-name.controller.ts       # HTTP routes
├── module-name.service.ts          # Business logic
├── module-name.service.spec.ts     # Unit tests
└── module-name.module.ts           # Module registration
```

---

## 🔄 React Query Patterns

### Fetch Data
```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['key'],
  queryFn: fetchFunction,
});
```

### Create Data
```typescript
const mutation = useMutation({
  mutationFn: createFunction,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['key'] });
  },
});
```

### Update Data
```typescript
const mutation = useMutation({
  mutationFn: ({ id, data }) => updateFunction(id, data),
  onSuccess: (_, variables) => {
    queryClient.invalidateQueries({ queryKey: ['key'] });
    queryClient.invalidateQueries({ queryKey: ['key', variables.id] });
  },
});
```

---

## 🎨 Common UI Patterns

### List Page
```typescript
const { data = [] } = useItems();
return <ItemList items={data} onDelete={handleDelete} />;
```

### Create Page
```typescript
const mutation = useCreateItem();
const handleSubmit = (data) => mutation.mutateAsync(data);
return <ItemForm onSubmit={handleSubmit} isSubmitting={mutation.isPending} />;
```

### Edit Page
```typescript
const { id } = useParams();
const { data: item } = useItem(id);
const mutation = useUpdateItem();
const handleSubmit = (data) => mutation.mutateAsync({ id, data });
return <ItemForm item={item} onSubmit={handleSubmit} />;
```

---

## 🐛 Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| 401 Unauthorized | Check token in localStorage, verify JWT not expired |
| 403 Forbidden | Verify user has correct role, check @Roles decorator |
| 404 Not Found | Verify schoolId filter, check if resource exists |
| 409 Conflict | Check for unique constraint violations |
| CORS error | Update allowedOrigins in main.ts |
| Cache stale | Call queryClient.invalidateQueries() |
| Form not submitting | Check validation schema, console.log errors |
| Component not rendering | Add 'use client' directive for client components |

---

## 📊 Multi-Tenancy Rules

```typescript
// ❌ WRONG - No schoolId filter
const students = await this.repo.find();

// ✅ CORRECT - Always filter by schoolId
const students = await this.repo.find({ 
  where: { schoolId } 
});

// ❌ WRONG - schoolId from request body
const schoolId = req.body.schoolId;

// ✅ CORRECT - schoolId from JWT
const schoolId = req.user.schoolId;
```

---

## 🎯 Role Access Matrix

```
Resource    SUPER_ADMIN  SCHOOL_ADMIN  TEACHER  STUDENT
─────────   ───────────  ────────────  ───────  ───────
Schools     CRUD         R             -        -
Users       CRUD         CRUD          R        -
Students    R            CRUD          R        R*
Teachers    R            CRUD          R        R*
Classes     R            CRUD          R/U      R*
Subjects    R            CRUD          R/U      R*
Grades      -            CRUD          C/R/U    R*
Attendance  -            CRUD          C/R/U    R*

* Own data only
```

---

## 📱 HTTP Status Codes

```
200 OK              - Successful GET, PATCH, DELETE
201 Created         - Successful POST
400 Bad Request     - Validation failed
401 Unauthorized    - Invalid/missing token
403 Forbidden       - Insufficient permissions
404 Not Found       - Resource doesn't exist
409 Conflict        - Duplicate/constraint violation
500 Server Error    - Unexpected error
```

---

## 🛠️ Common Commands

```bash
# Backend
npm run start:dev           # Start dev server
npm run build               # Build for production
npm run test                # Run unit tests
npm run test:e2e            # Run E2E tests
npm run lint                # Lint code

# Frontend
npm run dev                 # Start dev server
npm run build               # Build for production
npm run lint                # Lint code
npm run type-check          # Check types

# Database
npm run migration:generate  # Generate migration
npm run migration:run       # Run migrations
npm run migration:revert    # Revert last migration

# Docker
docker-compose up -d        # Start services
docker-compose down         # Stop services
docker-compose logs -f      # View logs
```

---

## 📚 Documentation Quick Links

```
Understanding System    → PROJECT_ARCHITECTURE_GUIDE.md
Visual Diagrams         → VISUAL_DIAGRAMS.md
Adding Features         → QUICK_START_CHECKLIST.md
AI Agent Guidelines     → AGENTS.md
Code Standards          → DevelopmentGuidelines.md
Contributing            → CONTRIBUTING.md
All Documentation       → DOCUMENTATION_INDEX.md
Executive Summary       → EXECUTIVE_SUMMARY.md
```

---

## 💡 Pro Tips

1. **Copy Existing Modules**: Use students/teachers as templates
2. **Test in Swagger First**: Validate backend before frontend work
3. **Use React Query DevTools**: Debug cache and queries easily
4. **Check Database**: `docker exec -it postgres psql -U postgres -d school_management`
5. **Clear Cache**: queryClient.clear() if things seem stuck
6. **Multi-tenancy First**: Always add schoolId filter from day one
7. **Type Everything**: Use TypeScript strictly, no `any`
8. **Validate Input**: DTOs on backend, Yup on frontend
9. **Handle Errors**: Always show user-friendly error messages
10. **Document Changes**: Update docs when changing architecture

---

## 🚦 Development Checklist

**Before Starting**:
- [ ] Read feature requirements
- [ ] Check existing similar modules
- [ ] Design database schema
- [ ] Plan API endpoints

**During Development**:
- [ ] Create backend entity & DTOs
- [ ] Implement service logic
- [ ] Create controller endpoints
- [ ] Test in Swagger
- [ ] Create frontend types
- [ ] Create API functions & hooks
- [ ] Create UI components
- [ ] Create pages
- [ ] Test end-to-end

**Before Submitting**:
- [ ] Run linter
- [ ] Write tests
- [ ] Update documentation
- [ ] Test multi-tenancy
- [ ] Test all user roles
- [ ] Check error handling
- [ ] Create PR with clear description

---

## 🎉 Time Estimates

```
Task                              Time
─────────────────────────────────────────
Backend entity + DTOs             20-30 min
Backend service                   30-45 min
Backend controller                20-30 min
Backend testing                   15-20 min
Frontend types + API              10-15 min
Frontend hooks                    15 min
Frontend components               30-45 min
Frontend pages                    20-30 min
Frontend testing                  15-20 min
Documentation                     10-15 min
─────────────────────────────────────────
Total per module                  3-4.5 hours
```

---

**Keep this card handy while developing! 📌**
