# Scalable School Management System (SaaS) – Product Requirements Document

**Version:** 1.0  
**Last Updated:** 2025-06-26  
**Owners:** Product & Architecture Guild  

---

## 1. Purpose  
The purpose of this document is to provide a clear, comprehensive, and actionable set of requirements for building **School Management System as a Service (SMS‑aaS)**.  
While the initial requirements were captured in the uploaded draft specification, this PRD refines them with multi‑tenant SaaS considerations, business objectives, KPIs, and clear acceptance criteria so that autonomous engineering agents can implement and iterate with minimal human intervention.

## 2. Vision & Goals  
| Goal | Success Metric | Target |
|------|----------------|--------|
| Digitise core school operations for small–medium institutions worldwide | Monthly Active Schools (MAS) | ≥ 1 000 within 12 months |
| Reduce admin workload per school | Avg. hours saved / school / month | ≥ 40 |
| Reliable platform | 99.9 % monthly uptime | ≤ 43 min downtime |
| Revenue | ARR from subscriptions | ≥ USD 1 M by EOY 2026 |

## 3. Scope  

### 3.1 MVP (Release 1)  
1. **Multi‑tenant provisioning** – automated tenant creation, sub‑domain routing, isolated data schema.  
2. Core modules from the draft spec:  
   * Authentication & RBAC (FR1‑FR3)  
   * Student & Teacher management (FR4‑FR8)  
   * Class & Subject management (FR9‑FR11)  
   * Attendance (FR12‑FR14)  
   * Grades & report cards (FR15‑FR17)  
   * Fees & receipting (FR18‑FR23)  
   * Basic dashboard & reports (FR24‑FR26)  
3. Tenant‑level settings (branding colours, academic calendar).  
4. REST API coverage documented via OpenAPI (GraphQL deferred to a later phase).  
5. Containerised deployment (Docker Compose for development, CI/CD automation to be introduced as environments mature).  

### 3.2 Post‑MVP (nice‑to‑have)  
* Communication module (email/SMS) (FR27).  
* Timetable / scheduling (FR28‑FR29).  
* Mobile app wrappers (React Native / Flutter).  
* AI add‑ons: predictive attendance alerts, auto‑grading support.

### 3.3 Out‑of‑scope  
* Learning‑Management features (courseware, quizzes).  
* Payroll & HR for staff.  
* Offline desktop app.

## 4. Personas  
| Persona | Needs | Pain Points |
|---------|-------|-------------|
| **Admin (Alex)** | Configure school, run reports | Disparate spreadsheets |
| **Teacher (Tracy)** | Quick attendance, grade entry | Slow, manual duplication |
| **Accountant (Arif)** | Fees, receipts, ledgers | Manual receipts & reconciliation |
| **Parent (Pat)** | View child progress | Lack of transparency |

## 5. User Stories (excerpt)  
* **US‑1** – *As an Admin, I can create teacher accounts in bulk from Excel so that onboarding < 30 min.*  
* **US‑5** – *As a Teacher, I mark attendance via mobile in ≤ 2 taps.*  
* **US‑9** – *As an Accountant, I receive automatic reminders for unpaid fees 7 days before due.*  
(Complete backlog in Jira link; AI agents iterate per sprint.)

## 6. Functional Requirements  
Detailed in the system specification; key additions for SaaS:  

| ID | Description | Acceptance Criteria |
|----|-------------|---------------------|
| **FR‑M1** | New tenant provisioning API | POST `/tenants` returns 201 & DNS CNAME |
| **FR‑M2** | Data isolation | Tenant A cannot query Tenant B data (verified by integration test) |
| **FR‑M3** | Subscription plans & limits | Plan metadata enforced (max students, storage) |
| **FR‑M4** | Audit logging | CRUD events stored in tenant‑prefixed streams ≥ 90 days |

(Existing FR1‑FR29 remain unchanged; see Appendix A.)

## 7. Non‑Functional Requirements (NFR)  
| Area | Requirement | Target |
|------|-------------|--------|
| **Performance** | Dashboard < 2 s at p95 under 1 000 RPS | NFR‑P1 |
| **Security** | OWASP Top‑10, SOC‑2 readiness, data encrypted at rest & in transit | NFR‑S1 |
| **Scalability** | Horizontal scale on K8s (stateless services) to 10 000 schools | NFR‑SC1 |
| **Observability** | Structured logs, metrics (Prometheus), traces (OpenTelemetry) | NFR‑O1 |
| **Localization** | UTF‑8, RTL support, i18n strings externalised | NFR‑L1 |

## 8. Architecture & Tech Stack  
```
[ Browser ] ⇆ [ Next.js 16 App Router ] —REST→ [ NestJS 10 modular monolith ] —SQL→ [ PostgreSQL (shared schema, school_id discriminator) ]
                                         │
                                         └─► [ Zitadel OIDC ]
```
* **Frontend:** Next.js 16, React 18, Tailwind CSS, Material UI 7, TanStack Query.  
* **Backend:** NestJS 10, TypeScript, TypeORM 0.3, Jest for unit/e2e testing.  
* **Auth:** Zitadel OIDC (JWT + JWKS) with a legacy local JWT fallback for development.  
* **Messaging:** Not yet implemented; asynchronous processing will be introduced in Phase 2.  
* **CI/CD:** GitHub Actions planned; current workflows rely on Docker Compose for local orchestration.  

## 9. Data Model (high‑level)  
* `schools` (tenants) ←1‑M→ `users` (role-scoped per tenant)  
* `students` ↔ `classes` (M‑N via `class_students` join with `school_id`)  
* `classes` ↔ `subjects` (M‑N via `class_subjects` join with `school_id`)  
* `teachers` ↔ `classes` (M‑N assignment table with `school_id`)  
* Future finance entities (fees, payments) will follow the same `school_id` discriminator pattern.  

Entity‑relationship diagram attached in Appendix B.

## 10. API Design  
* **Versioning:** URI‑based (`/v1/`), semantic version in OpenAPI.  
* **Error format:** RFC 7807 (Problem JSON).  
* **Pagination:** cursor‑based (`?after=`), default 50, max 200.  
* **Rate‑limiting:** 100 req/min per tenant.  

## 11. Deployment & Environments  
| Env | Purpose | URL scheme |
|-----|---------|-----------|
| Dev | Feature branches (preview PR) | `*.dev.sms.com` |
| Staging | UAT (prod‑data subset) | `*.stg.sms.com` |
| Prod | Live tenants | `{school}.sms.com` |

Automated Terraform pipelines manage AWS infra; zero‑downtime deploys via blue‑green strategy.

## 12. Monitoring & Alerts  
* Latency, error‑rate, saturation (RED method).  
* PagerDuty critical alert when p95 > 3 s for 5 min.  

## 13. Compliance & Privacy  
* GDPR & COPPA data handling; parental consent flow.  
* Region‑aware data residency (EU, US).

## 14. Risks & Mitigation  
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Data breach | Low | High | Pen‑tests, automated SAST/DAST |
| Cost overrun | Med | Med | Phased rollout, usage‑based infra |
| Vendor lock‑in | Med | Low | Use OSS where feasible |

## 15. Roadmap  
| Milestone | Date | Status |
|-----------|------|--------|
| MVP Alpha | 2025‑09‑30 | ☐ |
| Beta (10 schools) | 2025‑11‑30 | ☐ |
| GA | 2026‑01‑31 | ☐ |

---

### Appendix A – Original Functional Requirements Mapping  
For traceability, original FR1‑FR29 from the draft spec map 1‑to‑1 to module epics.  

### Appendix B – ER Diagram  
_To be generated from the current TypeORM entities (see `/backend/src/*/entities`)._
