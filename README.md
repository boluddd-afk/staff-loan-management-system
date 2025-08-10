# Staff Loan Management System

A comprehensive Next.js application for tracking staff loans without interest. This system allows you to calculate monthly repayments, manage loan statuses, and generate detailed reports.

## Features

- **Loan Management**: Create, update, and track staff loans
- **Payment Tracking**: Record monthly payments and update outstanding balances
- **Status Management**: Mark loans as active, suspended, fully paid, or bad debt
- **Dashboard**: View key statistics and recent activity
- **Reports**: Generate monthly reports with detailed analytics
- **Responsive Design**: Works on desktop and mobile devices

## Quick Start

### Prerequisites
- Node.js 18+
- npm/yarn/pnpm

### Installation

1. Install dependencies:
```bash
npm install
```

2. The database is already set up with SQLite. No additional configuration needed.

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:8000`

## How to Use

### Creating Your First Loan

1. Navigate to the dashboard at `http://localhost:8000`
2. Click "New Loan Application"
3. Fill in the required details:
   - Staff member (or add new staff)
   - Loan amount
   - Duration in months
   - Optional notes

### Managing Loans

1. **View All Loans**: Go to `/loans` to see all loans
2. **Filter Loans**: Use search and status filters
3. **Record Payments**: Click on any loan to view details and add payments
4. **Update Status**: Change loan status as needed

### Generating Reports

1. Navigate to `/reports` (or Reports section)
2. Select month and year
3. View detailed monthly reports with:
   - Staff-wise outstanding balances
   - Total repayments
   - Department summaries
   - Payment history

### Dashboard Overview

The dashboard shows:
- Total loans given
- Outstanding balance
- Amount repaid
- Active/suspended/bad debt counts
- Recent activity
- Monthly trends

## API Endpoints

- `GET /api/loans` - List all loans
- `POST /api/loans` - Create new loan
- `GET /api/loans/[id]` - Get specific loan
- `PUT /api/loans/[id]` - Update loan status
- `POST /api/loans/[id]/payments` - Record payment
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/reports/monthly` - Monthly reports

## Database Schema

The system uses SQLite with the following tables:
- **Staff**: Staff member information
- **Loans**: Loan details and status
- **Payments**: Payment history

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Database operations
npx prisma db push  # Update database schema
npx prisma studio   # View database in browser
```

## Usage Examples

### Creating a Loan
1. Go to Dashboard → New Loan Application
2. Enter loan amount: $5000
3. Enter duration: 12 months
4. System calculates monthly payment: $416.67
5. Submit the form

### Recording a Payment
1. Go to Loans page
2. Click on any active loan
3. Enter payment amount
4. System automatically updates outstanding balance
5. Marks loan as fully paid when balance reaches 0

### Viewing Reports
1. Go to Reports section
2. Select month and year
3. View comprehensive monthly report
4. Export data if needed

## Technical Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Database**: SQLite with Prisma ORM
- **API**: RESTful endpoints
- **State Management**: React hooks
- **Icons**: Lucide React

## Troubleshooting

If you encounter any issues:

1. **Port 8000 in use**: The system will automatically find another port
2. **Database issues**: Run `npx prisma db push` to reset
3. **Missing dependencies**: Run `npm install` again
4. **CORS issues**: The system handles CORS automatically

## Support

For questions or issues, check the TODO.md file for implementation details or review the API endpoints in the `/api` directory.
