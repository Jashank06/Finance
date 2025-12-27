# Feature Usage Tracking Guide

## Overview
This guide explains how to add feature usage tracking to components in the application. The tracking system automatically collects analytics about which features users are using.

## Quick Start - Adding Tracking to Any Component

### Step 1: Import the Tracking Utility
```javascript
import { trackFeatureUsage, trackAction } from '../../../utils/featureTracking';
```

### Step 2: Track Page Views
Add tracking in `useEffect` when the component mounts:

```javascript
useEffect(() => {
    // Your existing code...
    
    // Add this line to track page view
    trackFeatureUsage('/family/monitoring/budget', 'view');
}, []);
```

### Step 3: Track User Actions
Add tracking when users perform actions:

```javascript
const handleCreate = async () => {
    // Your create logic
    await api.post('/your-endpoint', data);
    
    // Track the create action
    trackAction.create('/family/monitoring/budget', { type: 'monthly' });
};

const handleUpdate = async (id) => {
    // Your update logic
    await api.put(`/your-endpoint/${id}`, data);
    
    // Track the update action
    trackAction.update('/family/monitoring/budget', { id });
};

const handleDelete = async (id) => {
    // Your delete logic
    await api.delete(`/your-endpoint/${id}`);
    
    // Track the delete action
    trackAction.delete('/family/monitoring/budget', { id });
};

const handleExport = async () => {
    // Your export logic
    
    // Track the export action
    trackAction.export('/family/monitoring/budget', { format: 'xlsx' });
};
```

## Route Mapping

All routes are pre-mapped in `frontend/src/utils/featureTracking.js`. Use these exact routes:

### Daily Finance Routes
- `/family/daily/cash-cards-bank` - Cash Cards Bank
- `/family/daily/daily-transactions` - Daily Transactions
- `/family/daily/income-expenses` - Income Expenses
- `/family/daily/manage-finance` - Manage Finance
- `/family/daily/bill-checklist` - Bill Checklist
- `/family/daily/cheque-register` - Cheque Register
- `/family/daily/loan-ledger` - Loan Ledger
- `/family/daily/daily-cash-register` - Daily Cash Register
- `/family/daily/telephone-conversation` - Telephone Conversation

### Monitoring Routes
- `/family/monitoring/budget` - Budget Management
- `/family/monitoring/budget-plan` - Budget Plan
- `/family/monitoring/multiple-calendars` - Multiple Calendars
- `/family/monitoring/reminders-notifications` - Reminders Notifications
- `/family/monitoring/targets-for-life` - Targets For Life
- `/family/monitoring/roadmap` - Roadmap
- `/family/monitoring/milestones` - Milestones
- `/family/monitoring/bill-dates` - Bill Dates
- `/family/monitoring/yearly-calendar` - Yearly Calendar
- `/family/monitoring/weekly-appointments` - Weekly Appointments

### Investment Routes
- `/family/investments/mf-insurance-shares` - MF Insurance Shares
- `/family/investments/gold-sgb` - Gold SGB
- `/family/investments/nps-ppf` - NPS PPF
- `/family/investments/bank-schemes` - Bank Schemes
- `/family/investments/investment-profile` - Investment Profile
- `/family/investments/investment-valuation` - Investment Valuation
- `/family/investments/profit-loss` - Profit Loss
- `/family/investments/project-income-expense` - Project Income Expense
- `/family/investments/trading-details` - Trading Details
- `/family/investments/loan-amortization` - Loan Amortization
- `/family/investments/retirement-financial` - Retirement Financial

### Static Data Routes
- `/family/static/family-profile` - Family Profile
- `/family/static/basic-details` - Basic Details
- `/family/static/contact-management` - Contact Management
- `/family/static/personal-records` - Personal Records
- `/family/static/company-records` - Company Records
- `/family/static/land-records` - Land Records
- `/family/static/membership-list` - Membership List
- `/family/static/inventory-record` - Inventory Record
- `/family/static/mobile-email-details` - Mobile Email Details
- `/family/static/online-access-details` - Online Access Details
- `/family/static/digital-assets` - Digital Assets
- `/family/static/customer-support` - Customer Support

### Reports & Analytics Routes
- `/family/reports` - Reports
- `/family/analytics` - Analytics
- `/family/cashflow-analysis` - Cashflow Analysis

### Family Management Routes
- `/family-profile` - Family Profile Overview
- `/family/tasks` - Family Tasks

## Available Actions

The tracking system supports these action types:
- `view` - Page/feature view (default)
- `create` - Creating new records
- `update` - Updating existing records
- `delete` - Deleting records
- `export` - Exporting data
- `import` - Importing data

## Example: Complete Component Implementation

```javascript
import { useState, useEffect } from 'react';
import { trackFeatureUsage, trackAction } from '../../../utils/featureTracking';
import api from '../../../utils/api';

const Budget = () => {
    const [budgets, setBudgets] = useState([]);

    // Track page view on mount
    useEffect(() => {
        fetchBudgets();
        trackFeatureUsage('/family/monitoring/budget', 'view');
    }, []);

    const fetchBudgets = async () => {
        const response = await api.get('/budget');
        setBudgets(response.data);
    };

    const handleCreateBudget = async (data) => {
        await api.post('/budget', data);
        trackAction.create('/family/monitoring/budget', { 
            type: data.type, 
            amount: data.amount 
        });
        fetchBudgets();
    };

    const handleUpdateBudget = async (id, data) => {
        await api.put(`/budget/${id}`, data);
        trackAction.update('/family/monitoring/budget', { id });
        fetchBudgets();
    };

    const handleDeleteBudget = async (id) => {
        if (confirm('Delete budget?')) {
            await api.delete(`/budget/${id}`);
            trackAction.delete('/family/monitoring/budget', { id });
            fetchBudgets();
        }
    };

    const handleExportBudgets = async () => {
        // Export logic
        trackAction.export('/family/monitoring/budget', { format: 'xlsx' });
    };

    return (
        <div>
            <h1>Budget Management</h1>
            {/* Your component JSX */}
        </div>
    );
};

export default Budget;
```

## Metadata (Optional)

You can pass additional metadata with tracking calls:

```javascript
trackAction.create('/family/monitoring/budget', {
    budgetType: 'monthly',
    amount: 5000,
    category: 'household',
    currency: 'INR'
});
```

This metadata will be stored and can be viewed in the admin analytics dashboard.

## Components Already Tracked

✅ **Daily Finance:**
- CashCardsBank.jsx
- IncomeExpenses.jsx
- ManageFinance.jsx (partial)

## Components Ready for Tracking

The following components still need tracking added (follow the guide above):

### Monitoring Components
- Budget.jsx
- BudgetPlanTab.jsx
- MultipleCalendars.jsx
- RemindersNotifications.jsx (or RemindersNotificationsNew.jsx)
- TargetsForLife.jsx
- Milestones.jsx
- BillDates.jsx

### Investment Components
- InvestmentProfile.jsx
- InvestmentValuationNew.jsx
- MfInsuranceSharesInvestment.jsx
- GoldSgbInvestment.jsx
- NpsPpfInvestment.jsx
- BankSchemesInvestment.jsx
- ProfitLoss.jsx
- ProjectIncomeExpense.jsx
- TradingDetails.jsx
- LoanAmortization.jsx
- RetirementFinancial.jsx

### Static Data Components
- FamilyProfile.jsx
- BasicDetails.jsx
- ContactManagement.jsx
- PersonalRecords.jsx
- CompanyRecords.jsx
- LandRecords.jsx
- MembershipList.jsx
- InventoryRecord.jsx
- MobileEmailDetails.jsx
- OnlineAccessDetails.jsx
- DigitalAssets.jsx
- CustomerSupport.jsx

## Viewing Analytics

Admin users can view comprehensive analytics at:
- **URL:** `/admin/features-analytics`
- **Features:**
  - Total usage statistics
  - Usage by category
  - Most used features
  - Daily trends
  - User engagement metrics
  - Category drill-down details

## Technical Details

### How It Works
1. **Silent Tracking:** Tracking calls fail silently and never disrupt user experience
2. **Session-Based:** Each browser session gets a unique ID for tracking
3. **Automatic Storage:** Data is stored in MongoDB with 1-year retention
4. **Real-time Analytics:** Analytics dashboard updates in real-time

### Backend API
- **Endpoint:** `POST /api/feature-usage/track`
- **Auth:** Requires valid JWT token
- **Payload:**
```json
{
  "featureCategory": "daily_finance",
  "featureName": "Cash Cards Bank",
  "route": "/family/daily/cash-cards-bank",
  "action": "view",
  "metadata": {},
  "sessionId": "session_123456"
}
```

## Best Practices

1. **Always track page views** in the main useEffect
2. **Track important actions** like create, update, delete
3. **Use meaningful metadata** to provide context
4. **Don't over-track** - avoid tracking every minor interaction
5. **Test tracking** by checking the admin analytics dashboard

## Troubleshooting

**Issue:** Tracking not appearing in analytics
- Check if user is logged in (tracking requires authentication)
- Verify the route matches exactly from the mapping
- Check browser console for errors
- Ensure backend server is running

**Issue:** Wrong feature name in analytics
- Use the exact route from the mapping above
- The route determines the feature name automatically

## Need Help?

If you need to add a new route that's not in the mapping:
1. Add it to `frontend/src/utils/featureTracking.js` in the `FEATURE_ROUTE_MAP` object
2. Follow the existing pattern for category and name
3. Test that it appears correctly in the admin dashboard
