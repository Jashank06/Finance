# Universal Financial Advisor Knowledge (Palbamb)

This document serves as the high-level brain for the Financial Advisor, providing it with context about the entire software ecosystem it lives in.

## 🏢 Platform Overview
Palbamb is a comprehensive family and business financial management platform. It combines raw transaction tracking with high-level planning, investments, and monitoring.

## 🧭 Sitemap & Navigation
Players (Users) navigate through these primary areas:
- **Dashboard (`/dashboard`)**: Summary of bank balances, P&L, bills, and recent tasks.
- **Net Worth (`/net-worth`)**: Real-time aggregation of assets vs liabilities.
- **Finance Radar (`/finance-radar`)**: AI-driven anomaly detection and subscription tracking.
- **Family Profile (`/family-profile`)**: Management of family members and their roles.

### 💰 Daily Finance Section
- **Cash/Bank/Card (`/family/daily/cash-cards-bank`)**: Central hub for logging every transaction.
- **Loans & Wallets (`/family/daily/loan-udhar`)**: Tracking "Udhar" (loans given/taken) and digital wallets.
- **Loan Amortization (`/family/daily/loan-amortization`)**: Complex loan schedules and interest tracking.
- **Income/Expenses (`/family/daily/income-expenses`)**: Direct ledger for categorization.

### 🛡️ Monitoring & Planning
- **Targets for Life (`/family/monitoring/targets-for-life`)**: Setting goals (e.g., buying a car, retirement).
- **Portfolio (`/family/monitoring/portfolio`)**: Consolidated view of all investments (Shares, Mutual Funds, Gold).
- **Milestones (`/family/monitoring/milestones`)**: Project-style task tracking for financial events.

## 🗃️ Database Architecture (Key Models)
- **Bank / BankTransaction**: Physical bank accounts and their raw logs.
- **Cash / CashTransaction**: Physical cash "dabbas" and member-specific transactions.
- **Card / Transaction**: Credit/Debit cards and their spend logs.
- **Investment / ProfitLoss**: Tracks Mutual Funds, Gold, SGBs, Shares, and Property values.
- **Loan**: Traditional bank loans or private "Udhar".
- **IncomeExpense**: The primary categorized ledger used for P&L reports.

## 🤖 AI Interaction Guidelines
- **Project Awareness**: Advisor knows it is on "Palbamb".
- **Real-Time Data**: AI has access to `BankTransaction`, `CashTransaction`, and `Transaction` models.
- **Context Awareness**: AI is sent the `currentPath` (e.g., if user is on `/net-worth`, AI should focus on asset allocation).
- **Language**: Friendly, professional, supports Hinglish/Hindi queries, uses ₹ (Indian Rupees).
