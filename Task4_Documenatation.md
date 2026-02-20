# Order Management Module - Assignment Submission

---

## Module 3: Order Management System

### Assignment Details
- **Candidate Name**: [Your Name]
- **Module**: Order Management System
- **Submission Date**: February 14, 2026
- **Organization**: [Your Organization]

---

## 1. GitHub Repository Link

**Repository URL**: https://github.com/aryangaikwad/workflow-commerce-system

**Repository Details**:
- Full stack application with React frontend and Spring Boot backend
- Complete Order Management module implementation
- All source code and configuration files included
- Commit history shows development progress

**Key Files in Repository**:
- `/Backend/src/main/java/com/example/workflowcommerce/controller/OrderController.java`
- `/Backend/src/main/java/com/example/workflowcommerce/service/OrderService.java`
- `/Backend/src/main/java/com/example/workflowcommerce/model/Order.java`
- `/Frontend/src/pages/Admin/OrderDashboard.jsx`
- `/Frontend/src/pages/Customer/MyOrders.jsx`
- `/Frontend/src/pages/Customer/Cart.jsx`
- `/Frontend/src/contexts/CartContext.jsx`

---

## 2. Deployed Application URL

**Live Application URL**: https://workflow-commerce-system.onrender.com

**Access Information**:
- **Frontend URL**: https://workflow-commerce-frontend.onrender.com
- **Backend API URL**: https://workflow-commerce-backend.onrender.com/api

**Test Credentials**:
- **Admin User**: 
  - Username: `admin`
  - Password: `admin123`
  - Role: ROLE_ADMIN
  
- **Customer User**:
  - Username: `customer1`
  - Password: `test123`
  - Role: ROLE_USER

---

## 3. End User Documentation

### 3.1 System Overview

The Order Management System is a full-stack web application built with React (frontend) and Spring Boot (backend). It provides a complete e-commerce order processing workflow with role-based access control.

### 3.2 Features Implemented

#### For Customers (ROLE_USER):
1. **Product Catalog**
   - Browse available products
   - View product details and inventory status
   - Add products to cart

2. **Shopping Cart**
   - View cart contents
   - Update product quantities
   - Remove items from cart
   - Calculate total price
   - Proceed to checkout

3. **Order Management**
   - Place orders with shipping address
   - View order history (My Orders page)
   - Check order status
   - Cancel pending orders

#### For Administrators (ROLE_ADMIN):
1. **Order Dashboard**
   - View all customer orders
   - Filter orders by status (Pending, Processing, Shipped, Delivered, Cancelled)
   - Update order status
   - Cancel orders
   - View order details including customer information

2. **Product Management**
   - Add new products
   - Edit existing products
   - Update inventory counts
   - Manage product categories

3. **Category Management**
   - Create product categories
   - Edit category details
   - Activate/Deactivate categories

### 3.3 User Guide

#### Getting Started:

**Step 1: Login**
1. Navigate to the application URL
2. Click on "Launch Console" or go to /login
3. Enter your credentials:
   - For admin access: Use admin/admin123
   - For customer access: Use customer1/test123
4. Click "Sign In"

**Step 2: Browse Products (Customer)**
1. Click on "Browse Products" from home page
2. View available products with prices and inventory
3. Click "Add to Cart" for desired items

**Step 3: Manage Cart (Customer)**
1. Click on cart icon in navigation
2. Review cart contents
3. Update quantities as needed
4. Click "Proceed to Checkout"
5. Enter shipping address
6. Click "Place Order"

**Step 4: View Orders (Customer)**
1. Click on "My Orders" in navigation
2. View all your orders with status
3. Click "Cancel" on pending orders if needed

**Step 5: Admin Order Management**
1. Login as admin user
2. Navigate to Admin Dashboard
3. Click on "Order Management"
4. View all customer orders
5. Use filter dropdown to filter by status
6. Click "Process" to update order status
7. Click "Cancel" to cancel orders if needed

### 3.4 API Documentation

**Base URL**: `http://localhost:8080/api` (Local) or `https://workflow-commerce-backend.onrender.com/api` (Deployed)

#### Order Endpoints:

**1. Create Order (Customer)**
- **Method**: POST
- **URL**: `/api/orders`
- **Auth Required**: Yes (ROLE_USER)
- **Request Body**:
```json
{
  "shippingAddress": "123 Main St, City",
  "items": [
    {
      "productId": 1,
      "quantity": 2
    }
  ]
}
```

**2. Get My Orders (Customer)**
- **Method**: GET
- **URL**: `/api/orders/my`
- **Auth Required**: Yes (ROLE_USER)

**3. Get All Orders (Admin)**
- **Method**: GET
- **URL**: `/api/orders`
- **Auth Required**: Yes (ROLE_ADMIN)

**4. Update Order Status (Admin)**
- **Method**: PUT
- **URL**: `/api/orders/{id}/status`
- **Auth Required**: Yes (ROLE_ADMIN)
- **Request Body**: `"Processing"` (or other status)

**5. Cancel Order**
- **Method**: PUT
- **URL**: `/api/orders/{id}/cancel`
- **Auth Required**: Yes (Owner or ROLE_ADMIN)

### 3.5 Technical Specifications

**Frontend Stack**:
- React 18 with Vite
- React Router for navigation
- Bootstrap 5 for UI styling
- Axios for API calls
- Context API for state management

**Backend Stack**:
- Spring Boot 3.x
- Spring Security with JWT authentication
- Spring Data JPA
- MySQL database
- Maven build system

**Security Features**:
- JWT token-based authentication
- Role-based access control (RBAC)
- Password encryption (BCrypt)
- Protected API endpoints
- Session timeout handling

**Database Schema**:
- Users table (authentication)
- Products table (catalog)
- Categories table (taxonomy)
- Orders table (order header)
- Order_Items table (order details)

### 3.6 Troubleshooting

**Issue**: "Your session has expired" message
**Solution**: Logout and login again to get a fresh token

**Issue**: Cannot place order
**Solution**: Ensure you're logged in as ROLE_USER and products are in stock

**Issue**: Cannot access admin dashboard
**Solution**: Login with admin credentials (admin/admin123)

---

## 4. Module Completion Summary

### Implemented Features:
✅ Order creation with inventory management
✅ Order status tracking workflow
✅ Customer order history (My Orders)
✅ Admin order management dashboard
✅ Role-based access control
✅ Shopping cart with persistent storage
✅ JWT authentication and authorization
✅ Infinite loop fixes in all components
✅ Backend API with proper error handling
✅ Frontend-Backend integration
✅ Database schema and relationships

### Files Created/Modified:
- OrderController.java (Backend API)
- OrderService.java (Business logic)
- Order.java (Entity model)
- OrderItem.java (Entity model)
- OrderDashboard.jsx (Admin UI)
- MyOrders.jsx (Customer UI)
- Cart.jsx (Shopping cart)
- CartContext.jsx (State management)
- Order service files (Frontend API calls)
- Authentication utilities

### Testing Completed:
✅ Order placement as customer
✅ Order viewing in My Orders
✅ Order cancellation
✅ Admin order management
✅ Status updates
✅ Authentication flow
✅ Authorization checks

---

## 5. Deployment Information

**Platform**: Render (Free Tier)
**Services Deployed**:
1. workflow-commerce-backend (Spring Boot)
2. workflow-commerce-frontend (React Static)

**Database**: MySQL (Local for development)
**Build Tools**: Maven (Backend), Vite (Frontend)

---

**Submitted by**: [Your Name]
**Date**: February 14, 2026
**Assignment**: Order Management Module - Full Stack Implementation

---
