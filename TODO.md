# Staff Loan Tracking System - Implementation Plan

## Phase 1: Database Schema & Models
- [ ] Create database schema for staff, loans, and payments
- [ ] Set up Prisma ORM with SQLite for data persistence
- [ ] Define relationships between entities

## Phase 2: API Endpoints
- [ ] Create REST API endpoints for loan management
- [ ] Implement loan calculation logic
- [ ] Add payment processing endpoints
- [ ] Create report generation endpoints

## Phase 3: Frontend Components
- [ ] Dashboard with loan statistics
- [ ] Loan application form
- [ ] Loan management interface
- [ ] Payment entry form
- [ ] Monthly reports view
- [ ] Loan history viewer

## Phase 4: Reports & Analytics
- [ ] Monthly outstanding balance report
- [ ] Loan repayment history
- [ ] Total loans dashboard widget
- [ ] Export functionality for reports

## Phase 5: Testing & Polish
- [ ] Test all functionality
- [ ] Add responsive design
- [ ] Final UI/UX improvements

## Database Schema Design

### Staff Table
- id (primary key)
- name
- email
- department
- employeeId
- createdAt
- updatedAt

### Loans Table
- id (primary key)
- staffId (foreign key)
- loanAmount
- durationMonths
- monthlyPayment
- outstandingBalance
- status (ACTIVE, SUSPENDED, FULLY_PAID, BAD_DEBT)
- startDate
- endDate
- createdAt
- updatedAt

### Payments Table
- id (primary key)
- loanId (foreign key)
- amount
- paymentDate
- remainingBalance
- notes
- createdAt

## API Endpoints
- POST /api/loans - Create new loan
- GET /api/loans - List all loans
- GET /api/loans/:id - Get loan details
- PUT /api/loans/:id - Update loan status
- POST /api/loans/:id/payments - Record payment
- GET /api/reports/monthly - Monthly report
- GET /api/dashboard/stats - Dashboard statistics
