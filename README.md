# FlowForge

**Domain-agnostic workflow orchestration engine** for managing transactional lifecycles with configurable state machines and transaction isolation patterns.

[![Java](https://img.shields.io/badge/Java-17-orange?style=flat-square&logo=openjdk)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2-green?style=flat-square&logo=spring)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue?style=flat-square&logo=mysql)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

> **Not a traditional e-commerce app.** This is an **internal operations platform** for workflow lifecycle management—demonstrating state machine engineering, transaction semantics, and business rule validation.

---

## Key Features

|| Feature | Description |
||---------|-------------|
|| **Domain-Agnostic Workflow Engine** | Configurable state machines for any business entity type |
|| **Transaction Isolation** | `REQUIRES_NEW` propagation separates workflow from business transactions |
|| **Business Rule Validation** | Prevents invalid transitions (e.g., can't ship without payment) |
|| **Complete Audit Trail** | Every state change logged with actor, timestamp, context |
|| **Role-Based Transitions** | Fine-grained RBAC for workflow operations |
|| **Transactional Event Listeners** | `AFTER_COMMIT` phase ensures data visibility across transactions |
|| **Optimistic Locking** | Concurrent modification protection on business entities |
|| **Caffeine Caching** | Performance optimization for workflow definitions |

---

## System Architecture

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
│    React 19 SPA │ Bootstrap 5 │ React Router 7 │ Axios + Interceptors        │
│    ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐ │
│    │  AuthContext    │  │  CartContext    │  │  ErrorBoundary              │ │
│    │  (JWT + RBAC)   │  │  (State Mgmt)   │  │  (Graceful Error Handling)  │ │
│    └─────────────────┘  └─────────────────┘  └─────────────────────────────┘ │
├──────────────────────────────────────────────────────────────────────────────┤
│                            SECURITY LAYER                                    │
│    ┌──────────────────────────────────────────────────────────────────────┐  │
│    │  Spring Security 6 Filter Chain                                      │  │
│    │  ├─ JWT Authentication (HS256)                                       │  │
│    │  ├─ Role-Based Access Control (@PreAuthorize)                        │  │
│    │  ├─ Security Headers (CSP, HSTS, X-Frame-Options)                    │  │
│    │  ├─ Rate Limiting (100 req/min/IP)                                   │  │
│    │  └─ BCrypt Password Hashing (Strength 10)                            │  │
│    └──────────────────────────────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────────────────────────────────┤
│                            SERVICE LAYER                                     │
│    ┌─────────────────────────────┐  ┌──────────────────────────────────────┐ │
│    │     WORKFLOW ENGINE         │  │        DOMAIN SERVICES               │ │
│    │  ┌───────────────────────┐  │  │  ┌────────────────────────────────┐  │ │
│    │  │ WorkflowEngineService │  │  │  │ OrderService    PaymentService │  │ │
│    │  │ ├─ State Machine      │  │  │  │ ShippingService CartService    │  │ │
│    │  │ ├─ @Cacheable         │  │  │  │ ProductService  UserService    │  │ │
│    │  │ └─ @Retryable         │  │  │  │ CouponService   ReviewService  │  │ │
│    │  └───────────────────────┘  │  │  └────────────────────────────────┘  │ │
│    │  ┌───────────────────────┐  │  │  ┌────────────────────────────────┐  │ │
│    │  │ TransitionExecutor    │  │  │  │ Transactional Event Listeners   │  │ │
│    │  │ └─ @Transactional     │  │  │  │ ├─ PaymentCompletedEvent       │  │ │
│    │  │    (REQUIRES_NEW)     │  │  │  │ ├─ ShippingCreatedEvent        │  │ │
│    │  └───────────────────────┘  │  │  │ └─ OrderDeliveredEvent        │  │ │
│    │  ┌───────────────────────┐  │  │  │ (AFTER_COMMIT phase)           │  │ │
│    │  │ OrderRuleValidator    │  │  │  └────────────────────────────────┘  │ │
│    │  │ └─ Business Rules     │  │  │                                      │ │
│    │  └───────────────────────┘  │  │                                      │ │
│    └─────────────────────────────┘  └──────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────────────────────┤
│                          PERSISTENCE LAYER                                   │
│    ┌──────────────────────────────────────────────────────────────────────┐  │
│    │  MySQL 8.0 │ JPA/Hibernate 6 │ HikariCP (20 connections)             │  │
│    │  ├─ Optimistic Locking (@Version on Order, Product, Payment)         │  │
│    │  ├─ Indexed Queries (workflow_instances, orders, payments)           │  │
│    │  ├─ Caffeine Cache (10-min TTL for workflow definitions)             │  │
│    │  └─ Audit Logging (workflow_logs with actor, timestamp, context)     │  │
│    └──────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Order Workflow State Machine

```
┌─────────┐    ┌─────────────────┐    ┌──────┐    ┌────────────┐    ┌─────────┐    ┌───────────┐
│ CREATED │───▶│ PAYMENT_PENDING │───▶│ PAID │───▶│ PROCESSING │───▶│ SHIPPED │───▶│ DELIVERED │
└────┬────┘    └────────┬────────┘    └──┬───┘    └─────┬──────┘    └────┬────┘    └───────────┘
     │                  │                │              │                │           (Terminal)
     ▼                  ▼                ▼              ▼                ▼
┌─────────┐      ┌─────────┐       ┌─────────┐    ┌─────────┐      ┌─────────┐
│CANCELLED│      │CANCELLED│       │ REFUNDED│    │ REFUNDED│      │ REFUNDED│
└─────────┘      └─────────┘       └─────────┘    └─────────┘      └─────────┘
(Terminal)       (Terminal)        (Terminal)     (Terminal)       (Terminal)
```

### Transition Rules & Business Validation
|| Transition | Business Rules | Authorized Roles |
||------------|----------------|------------------|
|| CREATED → PAYMENT_PENDING | Auto-transition on order creation | SYSTEM, USER, ADMIN |
|| PAYMENT_PENDING → PAID | `Payment.status = COMPLETED` | SYSTEM, ADMIN |
|| PAYMENT_PENDING → CANCELLED | `Payment.status = FAILED` or user cancel | USER, ADMIN |
|| PAID → PROCESSING | Auto-transition after payment verified | SYSTEM, ADMIN |
|| PROCESSING → SHIPPED | `Shipping record exists`, `TrackingNumber != null` | ADMIN |
|| SHIPPED → DELIVERED | `Shipping.status = Delivered` | ADMIN, SYSTEM |
|| PAID/PROCESSING/SHIPPED → REFUNDED | Comment required, triggers `PaymentRefundedEvent` | ADMIN |

---

## Transaction Isolation Pattern

FlowForge uses `@Transactional(propagation = REQUIRES_NEW)` to separate workflow state transitions from business transactions:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    TRANSACTION ISOLATION FLOW                               │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│ Business Transaction │ (Payment Processing)
│  ├─ Save Payment     │
│  └─ Publish Event   │
└──────────┬───────────┘
           │ commits
           ▼
┌──────────────────────────────────┐
│ @TransactionalEventListener        │
│ (phase = AFTER_COMMIT)           │
│  └─ Trigger Workflow Transition  │
└──────────┬───────────────────────┘
           │ starts NEW transaction
           ▼
┌──────────────────────┐
│ Workflow Transaction │ (REQUIRES_NEW)
│  ├─ Validate Rules   │
│  ├─ Update State     │
│  └─ Log Audit Entry  │
└──────────────────────┘

Benefits:
• Workflow failures don't roll back business transactions
• Business data is visible to workflow when it runs
• Independent rollback boundaries for fault isolation
```

---

## Business Rule Validation

`OrderWorkflowRuleValidator` enforces data integrity before state transitions:

```java
// Cannot mark as PAID without actual payment
validatePaymentExists(orderId) {
    Payment payment = paymentRepository.findByOrder(order);
    if (!isPaymentCompleted(payment.getStatus())) {
        throw new BusinessRuleViolationException(
            "PAYMENT_NOT_COMPLETED", "PAID",
            "Cannot mark order as PAID: Payment must be COMPLETED first."
        );
    }
}

// Cannot ship without shipping record
validateReadyForShipping(orderId) {
    if (!shippingRepository.existsByOrderOrderId(orderId)) {
        throw new BusinessRuleViolationException(
            "NO_SHIPPING_RECORD", "SHIPPED",
            "Cannot mark as SHIPPED: No shipping record exists."
        );
    }
}
```

---

## Tech Stack

|| Layer | Technologies |
||-------|--------------|
|| **Frontend** | React 19, Vite 6, Bootstrap 5, Axios, React Router 7 |
|| **State Management** | React Context (AuthContext, CartContext), ErrorBoundary |
|| **Backend** | Spring Boot 3.2, Spring Security 6, JPA/Hibernate 6 |
|| **Auth & Security** | JWT (HS256), BCrypt, RBAC, CSP, HSTS, Rate Limiting |
|| **Database** | MySQL 8.0, HikariCP, Optimistic Locking (@Version) |
|| **Caching** | Caffeine (10-min TTL, 500 max entries) |
|| **Transaction Management** | REQUIRES_NEW propagation, AFTER_COMMIT event listeners |
|| **Resilience** | @Retryable (3 attempts) for transient failures |
|| **DevOps** | Docker, Render (Backend), Vercel (Frontend) |

---

## Database Schema

```
WORKFLOW ENGINE TABLES                    DOMAIN ENTITY TABLES
══════════════════════                    ════════════════════

┌────────────────────────┐               ┌────────────────────────┐
│ workflow_definitions   │               │ users                  │
│ ├─ id (PK)             │               │ ├─ id (PK)             │
│ ├─ name (UNIQUE)       │               │ ├─ username (UNIQUE)   │
│ ├─ entity_type         │               │ ├─ email (UNIQUE)      │
│ └─ is_active           │               │ ├─ password (BCrypt)   │
└─────────┬──────────────┘               │ └─ status              │
          │                              └─────────┬──────────────┘
          │ 1:N                                    │
          ▼                                        │ M:N
┌────────────────────────┐               ┌────────▼───────────────┐
│ workflow_states        │               │ user_roles             │
│ ├─ id (PK)             │               │ ├─ user_id (FK)        │
│ ├─ workflow_id (FK)    │               │ └─ role_id (FK)        │
│ ├─ state_name          │               └────────┬───────────────┘
│ ├─ is_initial          │                        │
│ └─ is_terminal         │               ┌────────▼───────────────┐
└─────────┬──────────────┘               │ roles                  │
          │                              │ ├─ id (PK, BIGINT)     │
          │ 1:N                          │ └─ name (ROLE_*)       │
          ▼                              └────────────────────────┘
┌────────────────────────┐
│ workflow_transitions   │               ┌────────────────────────┐
│ ├─ id (PK)             │               │ orders                 │
│ ├─ workflow_id (FK)    │               │ ├─ order_id (PK)       │
│ ├─ from_state_id (FK)  │◀─────────────▶│ ├─ user_id (FK)        │
│ ├─ to_state_id (FK)    │               │ ├─ workflow_instance_id│
│ └─ allowed_roles       │               │ ├─ total_amount        │
└────────────────────────┘               │ ├─ order_status        │
                                        │ └─ version (Optimistic)│
┌────────────────────────┐               └─────────┬──────────────┘
│ workflow_instances     │                         │ 1:N
│ ├─ id (PK)             │◀────────────────────────┘
│ ├─ workflow_id (FK)    │               ┌────────────────────────┐
│ ├─ entity_type         │               │ order_items            │
│ ├─ entity_id           │               │ ├─ id (PK)             │
│ ├─ current_state_id    │               │ ├─ order_id (FK)       │
│ └─ is_completed        │               │ ├─ product_id (FK)     │
└─────────┬──────────────┘               │ └─ price_at_purchase   │
          │                              └────────────────────────┘
          │ 1:N
          ▼                              ┌────────────────────────┐
┌────────────────────────┐               │ payments               │
│ workflow_logs (AUDIT)  │               │ ├─ payment_id (PK)     │
│ ├─ id (PK)             │               │ ├─ order_id (FK,UNIQUE)│
│ ├─ instance_id (FK)    │               │ ├─ amount              │
│ ├─ from_state          │               │ ├─ payment_status      │
│ ├─ to_state            │               │ └─ version (Optimistic)│
│ ├─ performed_by        │               └────────────────────────┘
│ ├─ performed_at        │
│ └─ comment             │               ┌────────────────────────┐
└────────────────────────┘               │ products               │
                                        │ ├─ product_id (PK)     │
                                        │ ├─ sku (UNIQUE)        │
                                        │ ├─ category_id (FK)    │
                                        │ ├─ inventory_count     │
                                        │ └─ version (Optimistic)│
                                        └────────────────────────┘
```

---

## Quick Start

### Prerequisites
- Java 17+ | Node.js 18+ | MySQL 8.0+

### Backend
```bash
cd Backend
cp .env.example .env  # Configure your database credentials
./mvnw spring-boot:run
# API: http://localhost:8080
```

### Frontend
```bash
cd Frontend
npm install && npm run dev
# App: http://localhost:5173
```

### Environment Variables
```bash
# Backend (.env)
DB_URL=jdbc:mysql://localhost:3306/workflow_commerce
DB_USERNAME=root
DB_PASSWORD=your_password
JWT_SECRET=your_256_bit_secret_key

# Frontend (.env)
VITE_API_URL=http://localhost:8080/api/auth/
```

### Database Setup
```bash
mysql -u root -p < FlowForge_Complete_SQL.sql
```

### Default Credentials
|| Role | Username | Password |
||------|----------|----------|
|| Admin | `admin` | `Admin@123` |
|| Customer | `customer` | `Customer@123` |

---

## API Highlights

|| Method | Endpoint | Description |
||--------|----------|-------------|
|| `POST` | `/api/auth/signup` | User registration (password policy enforced) |
|| `POST` | `/api/auth/signin` | JWT authentication |
|| `GET` | `/api/workflow/definitions` | List workflow definitions |
|| `GET` | `/api/workflow/instances/{id}` | Get instance with audit logs |
|| `POST` | `/api/workflow/instances/{id}/transition` | Execute state transition |
|| `GET` | `/api/workflow/logs/recent` | Recent audit entries |
|| `GET` | `/api/workflow/definitions/{id}/stats` | Workflow statistics (Admin) |

### Example: Execute Transition
```bash
curl -X POST 'http://localhost:8080/api/workflow/instances/1/transition' \
  -H 'Authorization: Bearer <token>' \
  -H 'Content-Type: application/json' \
  -d '{"targetState": "PROCESSING", "comment": "Payment verified"}'
```

---

## Project Structure

```
FlowForge/
├── Backend/
│   └── src/main/java/com/example/workflowcommerce/
│       ├── controller/           # REST endpoints
│       ├── service/
│       │   └── workflow/         # State machine engine
│       │       ├── WorkflowEngineService.java      # Core state machine
│       │       ├── WorkflowTransitionExecutor.java # Transaction isolation
│       │       ├── OrderWorkflowRuleValidator.java # Business rules
│       │       └── WorkflowIntegrationService.java # Event handlers
│       ├── model/
│       │   └── workflow/         # Workflow domain entities
│       ├── security/             # JWT + RBAC + Security Headers
│       ├── config/               # Cache, Async, OpenAPI configs
│       ├── event/                # Transactional event listeners
│       ├── dto/                  # Request/Response DTOs
│       └── exception/            # Custom exceptions + GlobalHandler
├── Frontend/
│   └── src/
│       ├── components/
│       │   └── ErrorBoundary.jsx # Graceful error handling
│       ├── contexts/
│       │   ├── AuthContext.jsx   # Centralized auth state
│       │   └── CartContext.jsx
│       ├── pages/
│       │   ├── Operations/       # Workflow dashboard
│       │   ├── Admin/            # Entity management
│       │   └── Customer/         # Shopping experience
│       ├── services/             # API integration (env-based URLs)
│       └── utils/
│           └── axiosInterceptor.js # Global error handling
├── screenshots/
├── FlowForge_Complete_SQL.sql    # Database schema + seed data
└── README.md
```

---

## Technical Highlights

|| Feature | Implementation |
||---------|----------------|
|| **Domain-Agnostic Design** | `WorkflowDefinition.entityType` supports any entity type |
|| **Transaction Isolation** | `REQUIRES_NEW` in `WorkflowTransitionExecutor` |
|| **Event-Driven Transitions** | `@TransactionalEventListener(phase = AFTER_COMMIT)` |
|| **Business Rule Validation** | `OrderWorkflowRuleValidator` enforces data integrity |
|| **Concurrency Control** | Optimistic locking with `@Version` on Order, Product, Payment |
|| **Caching Strategy** | Caffeine with 10-min TTL for workflow definitions |
|| **Retry Logic** | `@Retryable(maxAttempts=3)` for transient failures |
|| **Audit Trail** | Every transition logged with actor, role, timestamp, comment |
|| **Input Validation** | Jakarta Bean Validation with custom password pattern |
|| **Error Handling** | GlobalExceptionHandler + React ErrorBoundary |

---

## License

MIT

---

<p align="center">
  <strong>FlowForge</strong> — Workflow Orchestration Engine<br>
  <em>Built with Spring Boot 3 + React 19</em><br>
  <sub>Demonstrating state machine engineering, transaction semantics, and business rule validation</sub>
</p>
