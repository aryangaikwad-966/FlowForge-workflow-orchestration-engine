# FlowForge

**Production-grade workflow orchestration engine** for managing transactional lifecycles with deterministic state machines.

[![Java](https://img.shields.io/badge/Java-17-orange?style=flat-square&logo=openjdk)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2-green?style=flat-square&logo=spring)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue?style=flat-square&logo=mysql)](https://www.mysql.com/)

> **Not a traditional e-commerce app.** This is an **internal operations platform** for workflow lifecycle management—similar to how Stripe, Square, and Uber build internal systems for transaction processing.

---

## Key Features

| Feature | Description |
|---------|-------------|
| **State Machine Engine** | Domain-agnostic workflow orchestration for any business entity |
| **Business Rule Validation** | Prevents invalid transitions (e.g., can't ship without payment) |
| **Complete Audit Trail** | Every state change logged with actor, timestamp, context |
| **Role-Based Transitions** | Fine-grained RBAC for workflow operations |
| **Event-Driven Architecture** | Async processing with Spring Events |

---

## Screenshots

<table>
<tr>
<td width="50%">

### Operations Dashboard
Real-time metrics showing active workflows, order pipeline status, and KPI cards for monitoring system throughput.

![Operations Dashboard](screenshots/dashboard.png)

</td>
<td width="50%">

### Workflow State Management
Interactive state visualization displaying current order states, transition buttons, and workflow instance details.

![Workflow States](screenshots/workflow-states.png)

</td>
</tr>
<tr>
<td width="50%">

### Audit Logs
Chronological event log capturing every state transition with performer identity, timestamps, and action context.

![Audit Logs](screenshots/audit-logs.png)

</td>
<td width="50%">

### Order Management
Order lifecycle view with status badges, payment verification, shipping tracking, and workflow state integration.

![Order Management](screenshots/order-management.png)

</td>
</tr>
<tr>
<td width="50%">

### Product Catalog
Inventory management interface with category filtering, stock levels, pricing controls, and product status toggles.

![Product Catalog](screenshots/product-catalog.png)

</td>
<td width="50%">

### Admin Panel
Centralized control center for managing users, categories, coupons, reviews, and system configuration.

![Admin Panel](screenshots/admin-panel.png)

</td>
</tr>
</table>

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│   React SPA │ Bootstrap 5 │ Operations Dashboard                │
├─────────────────────────────────────────────────────────────────┤
│                      SECURITY LAYER                             │
│   JWT Auth │ RBAC │ Spring Security Filter Chain                │
├─────────────────────────────────────────────────────────────────┤
│                      SERVICE LAYER                              │
│  ┌──────────────────────┐  ┌─────────────────────────────────┐  │
│  │  WORKFLOW ENGINE     │  │      DOMAIN SERVICES            │  │
│  │  ├─ State Machine    │  │  Order │ Payment │ Shipping     │  │
│  │  ├─ Rule Validator   │  │  Cart  │ Coupon  │ Review       │  │
│  │  └─ Audit Logger     │  │  Product │ Category │ User      │  │
│  └──────────────────────┘  └─────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                    PERSISTENCE LAYER                            │
│   MySQL 8 │ JPA/Hibernate │ HikariCP (20 connections)           │
└─────────────────────────────────────────────────────────────────┘
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

### Transition Rules
| Transition | Requires | Authorized Roles |
|------------|----------|------------------|
| → PAID | Payment status = COMPLETED | SYSTEM, ADMIN |
| → SHIPPED | Shipping record exists | ADMIN |
| → DELIVERED | Shipping status = Delivered | ADMIN, SYSTEM |
| → REFUNDED | Valid refund state | ADMIN (comment required) |

---

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React 19, Vite 6, Bootstrap 5, Axios, React Router 7 |
| **Backend** | Spring Boot 3.2, Spring Security 6, JPA/Hibernate 6 |
| **Auth** | JWT (HS256), Role-Based Access Control |
| **Database** | MySQL 8.0, HikariCP Connection Pool |
| **DevOps** | Docker, Render (Backend), Vercel (Frontend) |

---

## Database Schema

```
WORKFLOW ENGINE                          DOMAIN ENTITIES
┌────────────────────────────┐          ┌─────────────────────────┐
│ workflow_definitions       │          │ orders / order_items    │
│ workflow_states            │          │ payments                │
│ workflow_transitions       │          │ shipping                │
│ workflow_instances         │◀────────▶│ products / categories   │
│ workflow_logs (audit)      │          │ users / roles           │
└────────────────────────────┘          │ cart / wishlists        │
                                        │ reviews / coupons       │
                                        └─────────────────────────┘
```

---

## Quick Start

### Prerequisites
- Java 17+ | Node.js 18+ | MySQL 8.0+

### Backend
```bash
cd Backend
./mvnw spring-boot:run
# API: http://localhost:8080
# Swagger: http://localhost:8080/swagger-ui.html
```

### Frontend
```bash
cd Frontend
npm install && npm run dev
# App: http://localhost:5173
```

### Default Credentials
| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin123` |
| Customer | `customer` | `customer123` |

---

## API Highlights

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/signup` | User registration |
| `POST` | `/api/auth/signin` | JWT authentication |
| `GET` | `/api/workflow/definitions` | List workflow definitions |
| `GET` | `/api/workflow/instances/{id}` | Get instance with audit logs |
| `POST` | `/api/workflow/instances/{id}/transition` | Execute state transition |
| `GET` | `/api/workflow/logs/recent` | Recent audit entries |

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
│       ├── service/workflow/     # State machine engine
│       ├── model/                # JPA entities
│       └── security/             # JWT + RBAC
├── Frontend/
│   └── src/
│       ├── pages/Operations/     # Workflow dashboard
│       ├── pages/Admin/          # Entity management
│       └── services/             # API integration
└── screenshots/
```

---

## License

MIT

---

<p align="center">
  <strong>FlowForge</strong> — Workflow Orchestration Engine<br>
  <em>Built with Spring Boot 3 + React 19</em>
</p>
