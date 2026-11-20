# StockPulse Checker (SPC)

Smart Inventory Demand Predictor, Point-of-Sale (POS) & Automated Restocking Engine.

## Overview

StockPulse Checker is an inventory management and forecasting platform consisting of:
- **Database (MySQL)**: Relational schema tracking products, categories, stock movements, and transactional sales.
- **Backend (Java)**: Native Java HTTP server and CLI application implementing inventory business logic, ACID sales recording, and Reorder Point (ROP) demand forecasting.
- **Frontend (React + Vite)**: Glassmorphic dashboard with dual theme (Dark/Light mode), interactive POS counter, Cash-on-Delivery (COD) delivery tracker, and dynamic invoice generation.

---

## Core Capabilities

1. **Demand Prediction Engine**
   - Calculates Reorder Point (ROP) based on Average Daily Sales (ADS), vendor lead time, and safety buffer.
   - Calculates days of remaining stock and generates purchase order quantities.

2. **Point of Sale (POS) & Transactions**
   - Atomic sales recording preventing stock over-deduction.
   - Payment flows: Demo QR code, Card details modal, and Cash on Delivery.
   - Invoice reversal / void feature that restores deducted stock.
   - PDF tax invoice generation.

3. **Deliveries Management**
   - Centralized tracking for COD orders with collection status and cancellation.

4. **Stock Movements**
   - Inward (vendor receipts) and outward (deductions / adjustments) ledger.

---

## Directory Structure

```text
├── 1-Database-MySQL/       # SQL schema and seed data
├── 2-Backend-Java/         # Java HTTP server, JDBC DAO, models & terminal CLI
└── smart-inventory-pro/    # React frontend application
```

---

## Getting Started

### 1. Database Setup
Import the database schema and seed data using MySQL 8.0:
```sql
source 1-Database-MySQL/smart schema.sql;
source 1-Database-MySQL/seed_data.sql;
```

### 2. Backend Setup
Navigate to `2-Backend-Java` and compile/run:
```cmd
compile.bat
run.bat
```
The backend starts on port `8080`. To launch the terminal CLI instead, run `run-terminal.bat`.

### 3. Frontend Setup
Navigate to `smart-inventory-pro`:
```cmd
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.
