// Feature Categories - Main menu sections that can be enabled/disabled
const FEATURE_CATEGORIES = [
    {
        id: 'daily_finance',
        name: 'Daily Finance Management',
        description: 'Cash, Cards, Bank transactions and daily expense tracking',
        routes: [
            '/family/daily/cash-cards-bank',
            '/family/daily/daily-transactions',
            '/family/daily/income-expenses',
            '/family/daily/manage-finance',
            '/family/daily/bill-checklist',
            '/family/daily/cheque-register',
            '/family/daily/loan-ledger',
            '/family/daily/daily-cash-register',
            '/family/daily/telephone-conversation'
        ],
        icon: 'FiDollarSign'
    },
    {
        id: 'monitoring',
        name: 'Monitoring & Planning',
        description: 'Budget, Calendar, Reminders, Targets and Roadmap',
        routes: [
            '/family/monitoring/budget',
            '/family/monitoring/budget-plan',
            '/family/monitoring/multiple-calendars',
            '/family/monitoring/reminders-notifications',
            '/family/monitoring/targets-for-life',
            '/family/monitoring/roadmap',
            '/family/monitoring/milestones',
            '/family/monitoring/bill-dates',
            '/family/monitoring/yearly-calendar',
            '/family/monitoring/weekly-appointments'
        ],
        icon: 'FiCalendar'
    },
    {
        id: 'investments',
        name: 'Investment Management',
        description: 'Mutual Funds, Shares, Gold, Insurance, and Investment tracking',
        routes: [
            '/family/investments/mf-insurance-shares',
            '/family/investments/gold-sgb',
            '/family/investments/nps-ppf',
            '/family/investments/bank-schemes',
            '/family/investments/investment-profile',
            '/family/investments/investment-valuation',
            '/family/investments/profit-loss',
            '/family/investments/project-income-expense',
            '/family/investments/trading-details',
            '/family/investments/loan-amortization',
            '/family/investments/retirement-financial'
        ],
        icon: 'FiTrendingUp'
    },
    {
        id: 'static_data',
        name: 'Static Data & Records',
        description: 'Family profiles, Documents, Contacts and Inventory',
        routes: [
            '/family/static/family-profile',
            '/family/static/basic-details',
            '/family/static/contact-management',
            '/family/static/personal-records',
            '/family/static/company-records',
            '/family/static/land-records',
            '/family/static/membership-list',
            '/family/static/inventory-record',
            '/family/static/mobile-email-details',
            '/family/static/online-access-details',
            '/family/static/digital-assets',
            '/family/static/customer-support'
        ],
        icon: 'FiDatabase'
    },
    {
        id: 'reports_analytics',
        name: 'Reports & Analytics',
        description: 'Financial reports, Analytics and Data export',
        routes: [
            '/family/reports',
            '/family/analytics',
            '/family/cashflow-analysis'
        ],
        icon: 'FiBarChart2'
    },
    {
        id: 'family_management',
        name: 'Family Management',
        description: 'Family profile, Members and Tasks',
        routes: [
            '/family-profile',
            '/family/tasks'
        ],
        icon: 'FiUsers'
    }
];

// Basic features included in all plans
const BASIC_FEATURES = ['daily_finance', 'static_data'];

// Feature display names for UI
const FEATURE_DISPLAY_NAMES = {
    'daily_finance': 'Daily Finance Management',
    'monitoring': 'Monitoring & Planning',
    'investments': 'Investment Management',
    'static_data': 'Static Data & Records',
    'reports_analytics': 'Reports & Analytics',
    'family_management': 'Family Management'
};

module.exports = {
    FEATURE_CATEGORIES,
    BASIC_FEATURES,
    FEATURE_DISPLAY_NAMES
};
