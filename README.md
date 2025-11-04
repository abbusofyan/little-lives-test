# LittleLives Test Assignment - Invoice & Payment API

This repository contains a Node.js TypeScript API for managing invoices, payments, and receipts.

---

## Quick Start

1. **Install dependencies**

```bash
npm install
```

2. **Set up environment variables**
   Create a `.env` file from `.env.example` and set your `DATABASE_URL`.

3. **Generate Prisma client**

```bash
npx prisma generate
```

4. **Run database migrations**

```bash
npx prisma migrate dev --name init
```

This will run migrations and create tables. Prisma may prompt for confirmation.
Alternatively, you can use:

```bash
npx prisma db push
```

to push the schema without generating migrations.

5. **Seed the database (optional)**

```bash
npm run seed
```

6. **Start the server**

```bash
npm run dev
```

---

## API Endpoints

### Invoices

* **POST** `/invoices`
  Create a new invoice.
  **Body Example:**

  ```json
  {
    "invoiceNumber": "INV-001",
    "invoiceDate": "2025-11-05",
    "items": [
      {
        "description": "Item A",
        "quantity": 2,
        "unitPrice": 100,
        "taxRate": 10
      },
      {
        "description": "Item B",
        "quantity": 1,
        "unitPrice": 50
      }
    ]
  }
  ```

* **GET** `/invoices/:id`
  Fetch an invoice by ID.

---

### Payments

* **POST** `/payments`
  Create a payment for an invoice.
  **Body Example:**

  ```json
  {
    "invoiceId": "invoice-uuid",
    "amount": 250,
    "paymentMethod": "Cash" // or "BankTransfer" | "Card"
  }
  ```

---

### Receipts

* **POST** `/receipts/:paymentId`
  Generate a receipt for a payment.

* **GET** `/receipts/:id`
  Fetch a receipt by ID.

---

## Notes

* Ensure `DATABASE_URL` is correctly set in your `.env` file.
* Follow the API contract strictly to avoid validation errors.
