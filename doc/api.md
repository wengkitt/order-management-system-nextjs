# Order Management System API

This document describes the REST API implemented under `app/api`.

## Getting started

The examples assume the application is running locally:

```text
http://localhost:3000
```

Set these environment variables before starting the application:

```dotenv
DATABASE_URL="postgresql://..."
AUTH_SECRET="a-random-secret-containing-at-least-32-characters"
```

Apply the database migration and optionally create the development administrator:

```bash
pnpm db:migrate
pnpm db:seed
pnpm dev
```

The seed account is `admin@example.com` with password `password`. It is intended only for local development.

## Conventions

### Content type

Requests with bodies and all non-empty responses use JSON:

```http
Content-Type: application/json
```

### Authentication

All endpoints except `POST /api/auth/login` require the JWT returned by login:

```http
Authorization: Bearer <jwt-token>
```

Tokens expire after eight hours. Requests from inactive or missing users are rejected even if the token has not expired.

### Roles

| Capability                          | ADMIN | STAFF | CUSTOMER |
| ----------------------------------- | :---: | :---: | :------: |
| Authentication profile              |  Yes  |  Yes  |   Yes    |
| Dashboard                           |  Yes  |  Yes  |    No    |
| Customer management                 |  Yes  |  Yes  |    No    |
| Product viewing                     |  Yes  |  Yes  |    No    |
| Product mutation                    |  Yes  |  No   |    No    |
| Order listing/details               |  Yes  |  Yes  | Own only |
| Order creation/edit/status/deletion |  Yes  |  Yes  |    No    |
| User management                     |  Yes  |  No   |    No    |
| Lookups                             |  Yes  |  Yes  |    No    |

### Pagination

Paginated endpoints accept `page` and `limit`. Defaults are `page=1` and `limit=20`; the maximum limit is 100.

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 0,
    "totalPages": 0
  }
}
```

### Errors

```json
{
  "error": {
    "code": "ORDER_NOT_FOUND",
    "message": "Order not found"
  }
}
```

Validation errors may include field-specific messages:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request",
    "fields": {
      "email": "Invalid email address"
    }
  }
}
```

Common statuses are `200`, `201`, `204`, `400`, `401`, `403`, `404`, `409`, `422`, and `500`.

## Authentication

### POST `/api/auth/login`

Public. Authenticates an active user.

```json
{
  "email": "admin@example.com",
  "password": "password"
}
```

Response: `200 OK`

```json
{
  "user": {
    "id": "uuid",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "ADMIN"
  },
  "token": "jwt-token"
}
```

Returns `401 INVALID_CREDENTIALS` for an incorrect email/password and `401 USER_INACTIVE` for an inactive account.

### GET `/api/auth/me`

Roles: all authenticated users.

```json
{
  "id": "uuid",
  "name": "Admin User",
  "email": "admin@example.com",
  "phoneNumber": "0123456789",
  "role": "ADMIN",
  "customerId": null
}
```

## Dashboard

### GET `/api/dashboard/summary`

Roles: `ADMIN`, `STAFF`.

```json
{
  "totalOrders": 125,
  "pendingOrders": 12,
  "confirmedOrders": 4,
  "processingOrders": 18,
  "shippedOrders": 20,
  "deliveredOrders": 64,
  "cancelledOrders": 7,
  "totalCustomers": 45,
  "totalProducts": 32,
  "totalRevenue": 58240.5
}
```

Revenue includes delivered orders only. Customer and product totals include active, non-deleted records.

### GET `/api/dashboard/recent-orders`

Roles: `ADMIN`, `STAFF`.

Query: `limit` defaults to 5 and accepts 1–50.

```json
{
  "data": [
    {
      "id": "uuid",
      "orderNumber": "ORD-1723456789000-A1B2C3",
      "customerName": "John Tan",
      "totalAmount": 248,
      "status": "PROCESSING",
      "createdAt": "2026-08-12T10:30:00.000Z"
    }
  ]
}
```

## Customers

Customer records do not contain an email field in the current database schema.

### GET `/api/customers`

Roles: `ADMIN`, `STAFF`.

| Query    | Default | Description                                     |
| -------- | ------: | ----------------------------------------------- |
| `page`   |     `1` | Page number                                     |
| `limit`  |    `20` | Page size, maximum 100                          |
| `search` |       — | Case-insensitive name, phone, or address search |

Only active, non-deleted customers are returned.

### GET `/api/customers/:id`

Roles: `ADMIN`, `STAFF`. The ID must be a UUID.

The response contains the stored customer fields plus `orderCount` for all orders and `totalSpent` for delivered orders.

```json
{
  "id": "uuid",
  "name": "John Tan",
  "address": "10 Example Street",
  "phoneNumber": "0123456789",
  "isActive": true,
  "deletedAt": null,
  "createdBy": "uuid",
  "updatedBy": null,
  "createdAt": "2026-08-12T10:00:00.000Z",
  "updatedAt": "2026-08-12T10:00:00.000Z",
  "orderCount": 8,
  "totalSpent": 1250.5
}
```

### POST `/api/customers`

Roles: `ADMIN`, `STAFF`.

```json
{
  "name": "John Tan",
  "address": "10 Example Street",
  "phoneNumber": "0123456789"
}
```

`name` and `address` are required. Returns the created customer with `201 Created`.

### PATCH `/api/customers/:id`

Roles: `ADMIN`, `STAFF`. At least one field is required.

```json
{
  "name": "John Tan Updated",
  "address": "20 New Street",
  "phoneNumber": null,
  "isActive": true
}
```

### DELETE `/api/customers/:id`

Roles: `ADMIN`, `STAFF`. Returns `204 No Content`.

This is a soft delete: `isActive` becomes false and `deletedAt` is populated. Historical orders remain intact.

## Products

### GET `/api/products`

Roles: `ADMIN`, `STAFF`.

| Query      | Default | Description                         |
| ---------- | ------: | ----------------------------------- |
| `page`     |     `1` | Page number                         |
| `limit`    |    `20` | Page size, maximum 100              |
| `search`   |       — | Case-insensitive name or SKU search |
| `category` |       — | Exact category filter               |
| `isActive` |       — | `true` or `false`                   |

Deleted products are excluded. Monetary values are JSON numbers.

### GET `/api/products/:id`

Roles: `ADMIN`, `STAFF`.

```json
{
  "id": "uuid",
  "sku": "KB-001",
  "name": "Mechanical Keyboard",
  "description": "Hot-swappable keyboard",
  "category": "Accessories",
  "price": 199,
  "stockQuantity": 20,
  "lowStockThreshold": 10,
  "isActive": true,
  "deletedAt": null,
  "createdBy": "uuid",
  "updatedBy": null,
  "createdAt": "2026-08-12T10:00:00.000Z",
  "updatedAt": "2026-08-12T10:00:00.000Z"
}
```

### POST `/api/products`

Role: `ADMIN`.

```json
{
  "sku": "KB-001",
  "name": "Mechanical Keyboard",
  "description": "Hot-swappable keyboard",
  "category": "Accessories",
  "price": 199,
  "stockQuantity": 20,
  "lowStockThreshold": 10,
  "isActive": true
}
```

Required: `sku`, `name`, `category`, and non-negative `price`. Returns `409 SKU_EXISTS` when the SKU is already used.

### PATCH `/api/products/:id`

Role: `ADMIN`. Accepts any non-empty subset of the product creation fields.

### DELETE `/api/products/:id`

Role: `ADMIN`. Returns `204 No Content` and soft-deletes the product, preserving historical order items.

## Orders

Statuses are `PENDING`, `CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, and `CANCELLED`.

### GET `/api/orders`

Roles: all authenticated users. Customers automatically receive only orders linked to their `customerId`.

| Query        |     Default | Description                                                         |
| ------------ | ----------: | ------------------------------------------------------------------- |
| `page`       |         `1` | Page number                                                         |
| `limit`      |        `20` | Page size, maximum 100                                              |
| `search`     |           — | Order number or customer name                                       |
| `status`     |           — | Exact valid order status                                            |
| `customerId` |           — | UUID; used for admin/staff requests                                 |
| `sortBy`     | `createdAt` | `createdAt`, `updatedAt`, `orderNumber`, `totalAmount`, or `status` |
| `sortOrder`  |      `desc` | `asc` or `desc`                                                     |

```json
{
  "data": [
    {
      "id": "uuid",
      "orderNumber": "ORD-1723456789000-A1B2C3",
      "customer": { "id": "uuid", "name": "John Tan" },
      "itemCount": 3,
      "totalAmount": 248,
      "status": "PROCESSING",
      "createdAt": "2026-08-12T10:30:00.000Z",
      "updatedAt": "2026-08-12T11:00:00.000Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 1, "totalPages": 1 }
}
```

### GET `/api/orders/:id`

Roles: all authenticated users. Customers may access only their own orders.

```json
{
  "id": "uuid",
  "orderNumber": "ORD-1723456789000-A1B2C3",
  "status": "PROCESSING",
  "customer": {
    "id": "uuid",
    "name": "John Tan",
    "phoneNumber": "0123456789",
    "address": "10 Example Street"
  },
  "items": [
    {
      "id": "uuid",
      "productId": "uuid",
      "productName": "Mechanical Keyboard",
      "sku": "KB-001",
      "quantity": 1,
      "unitPrice": 199,
      "subtotal": 199
    }
  ],
  "subtotal": 199,
  "totalAmount": 199,
  "shippingAddress": "10 Example Street",
  "notes": null,
  "createdAt": "2026-08-12T10:30:00.000Z",
  "updatedAt": "2026-08-12T10:30:00.000Z"
}
```

### POST `/api/orders`

Roles: `ADMIN`, `STAFF`.

```json
{
  "customerId": "uuid",
  "items": [
    { "productId": "uuid", "quantity": 2 },
    { "productId": "uuid", "quantity": 1 }
  ],
  "shippingAddress": "Optional override",
  "notes": "Optional note"
}
```

Rules:

- The customer and every product must be active and not deleted.
- Items require a positive integer quantity and may contain at most 100 lines.
- A product cannot appear twice in one order.
- Prices, snapshots, subtotals, totals, and the order number are generated by the server.
- The customer address is used when `shippingAddress` is omitted.
- The order, items, and initial status-history record are written atomically.
- New orders start as `PENDING`.

Returns the complete order with `201 Created`.

### PATCH `/api/orders/:id`

Roles: `ADMIN`, `STAFF`. Only `PENDING` orders are editable.

```json
{
  "customerId": "uuid",
  "shippingAddress": "20 New Street",
  "notes": null
}
```

At least one field is required. Totals and items cannot be modified through this endpoint.

### PATCH `/api/orders/:id/status`

Roles: `ADMIN`, `STAFF`.

```json
{
  "status": "PROCESSING",
  "notes": "Payment confirmed"
}
```

Allowed transitions:

```text
PENDING -> CONFIRMED or CANCELLED
CONFIRMED -> PROCESSING or CANCELLED
PROCESSING -> SHIPPED or CANCELLED
SHIPPED -> DELIVERED or CANCELLED
DELIVERED -> final
CANCELLED -> final
```

Every accepted transition creates an order status-history record. Invalid transitions return `409 INVALID_STATUS_TRANSITION`.

### DELETE `/api/orders/:id`

Roles: `ADMIN`, `STAFF`. Only `PENDING` orders can be deleted. The order, its items, and its status history are deleted atomically. Returns `204 No Content`.

## Users

All user-management endpoints require `ADMIN`. Password hashes are never returned.

### GET `/api/users`

| Query      | Default | Description                     |
| ---------- | ------: | ------------------------------- |
| `page`     |     `1` | Page number                     |
| `limit`    |    `20` | Page size, maximum 100          |
| `search`   |       — | Name or email                   |
| `role`     |       — | `ADMIN`, `STAFF`, or `CUSTOMER` |
| `isActive` |       — | `true` or `false`               |

### GET `/api/users/:id`

Returns the safe user fields: `id`, `name`, `email`, `phoneNumber`, `role`, `customerId`, `isActive`, `createdAt`, and `updatedAt`.

### POST `/api/users`

```json
{
  "name": "Jane Lee",
  "email": "jane@example.com",
  "password": "password",
  "phoneNumber": "0123456789",
  "role": "STAFF",
  "customerId": null
}
```

Passwords must be 8–200 characters and are hashed with bcrypt. `customerId` is required when the role is `CUSTOMER`. Duplicate email addresses return `409 EMAIL_EXISTS`.

### PATCH `/api/users/:id`

Accepts at least one of `name`, `email`, `phoneNumber`, `role`, or `customerId`.

```json
{
  "name": "Jane Lee Updated",
  "role": "STAFF"
}
```

### PATCH `/api/users/:id/status`

```json
{
  "isActive": false
}
```

Administrators cannot deactivate their own account. Otherwise, the updated safe user record is returned.

## Lookups

### GET `/api/lookups/customers`

Roles: `ADMIN`, `STAFF`. Returns active, non-deleted customers ordered by name.

Query parameters: optional `search` by name and `limit` from 1–100, default 20.

```json
[{ "id": "uuid", "name": "John Tan" }]
```

### GET `/api/lookups/products`

Roles: `ADMIN`, `STAFF`. Returns active, non-deleted products ordered by name.

Query parameters: optional `search` by name/SKU and `limit` from 1–100, default 20.

```json
[{ "id": "uuid", "name": "Mechanical Keyboard", "sku": "KB-001", "price": 199 }]
```

## Endpoint index

| Method             | Endpoint                       | Roles                            |
| ------------------ | ------------------------------ | -------------------------------- |
| POST               | `/api/auth/login`              | Public                           |
| GET                | `/api/auth/me`                 | Authenticated                    |
| GET                | `/api/dashboard/summary`       | ADMIN, STAFF                     |
| GET                | `/api/dashboard/recent-orders` | ADMIN, STAFF                     |
| GET, POST          | `/api/customers`               | ADMIN, STAFF                     |
| GET, PATCH, DELETE | `/api/customers/:id`           | ADMIN, STAFF                     |
| GET                | `/api/products`                | ADMIN, STAFF                     |
| POST               | `/api/products`                | ADMIN                            |
| GET                | `/api/products/:id`            | ADMIN, STAFF                     |
| PATCH, DELETE      | `/api/products/:id`            | ADMIN                            |
| GET                | `/api/orders`                  | Authenticated; CUSTOMER own only |
| POST               | `/api/orders`                  | ADMIN, STAFF                     |
| GET                | `/api/orders/:id`              | Authenticated; CUSTOMER own only |
| PATCH, DELETE      | `/api/orders/:id`              | ADMIN, STAFF                     |
| PATCH              | `/api/orders/:id/status`       | ADMIN, STAFF                     |
| GET, POST          | `/api/users`                   | ADMIN                            |
| GET, PATCH         | `/api/users/:id`               | ADMIN                            |
| PATCH              | `/api/users/:id/status`        | ADMIN                            |
| GET                | `/api/lookups/customers`       | ADMIN, STAFF                     |
| GET                | `/api/lookups/products`        | ADMIN, STAFF                     |
