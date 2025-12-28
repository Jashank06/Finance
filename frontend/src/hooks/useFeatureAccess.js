import { useAuth } from '../context/AuthContext';

// Feature Categories mapping
const FEATURE_CATEGORIES = {
    'daily_finance': {
        id: 'daily_finance',
        name: 'Daily Finance Management',
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
        ]
    },
    'monitoring': {
        id: 'monitoring',
        name: 'Monitoring & Planning',
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
        ]
    },
    'investments': {
        id: 'investments',
        name: 'Investment Management',
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
        ]
    },
    'static_data': {
        id: 'static_data',
        name: 'Static Data & Records',
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
        ]
    },
    'reports_analytics': {
        id: 'reports_analytics',
        name: 'Reports & Analytics',
        routes: [
            '/family/reports',
            '/family/analytics',
            '/family/cashflow-analysis'
        ]
    },
    'family_management': {
        id: 'family_management',
        name: 'Family Management',
        routes: [
            '/family-profile',
            '/family/tasks'
        ]
    }
};

export const useFeatureAccess = () => {
    const { user } = useAuth();

    // Get user's allowed feature categories
    const getAllowedFeatures = () => {
        // If admin, allow all features
        if (user?.isAdmin) {
            return Object.keys(FEATURE_CATEGORIES);
        }

        // Check if user has active or trial subscription status (backward compatibility for old users)
        const hasActiveSubscription = user?.subscriptionStatus === 'active' || user?.subscriptionStatus === 'trial';
        
        // If user has active/trial status but no plan details (old users), give full access
        if (hasActiveSubscription && !user?.subscriptionPlan) {
            return Object.keys(FEATURE_CATEGORIES); // Full access for existing users
        }

        // If no subscription plan or expired/cancelled, return empty array (no access)
        if (!user?.subscriptionPlan?.featureCategories || user?.subscriptionPlan?.featureCategories.length === 0) {
            return []; // No features unlocked
        }

        return user.subscriptionPlan.featureCategories;
    };

    // Check if user has access to a specific feature category
    const hasFeatureAccess = (featureCategoryId) => {
        if (user?.isAdmin) return true;
        
        const allowedFeatures = getAllowedFeatures();
        return allowedFeatures.includes(featureCategoryId);
    };

    // Check if user has access to a specific route
    const hasRouteAccess = (route) => {
        if (user?.isAdmin) return true;

        const allowedFeatures = getAllowedFeatures();
        
        // Check which category this route belongs to
        for (const categoryId of allowedFeatures) {
            const category = FEATURE_CATEGORIES[categoryId];
            if (category && category.routes.some(r => route.startsWith(r))) {
                return true;
            }
        }
        
        return false;
    };

    // Get category for a route
    const getRouteCategory = (route) => {
        for (const [categoryId, category] of Object.entries(FEATURE_CATEGORIES)) {
            if (category.routes.some(r => route.startsWith(r))) {
                return { categoryId, ...category };
            }
        }
        return null;
    };

    // Get locked features (features not in user's plan)
    const getLockedFeatures = () => {
        if (user?.isAdmin) return [];
        
        const allowedFeatures = getAllowedFeatures();
        return Object.keys(FEATURE_CATEGORIES).filter(
            featureId => !allowedFeatures.includes(featureId)
        );
    };

    return {
        hasFeatureAccess,
        hasRouteAccess,
        getRouteCategory,
        getAllowedFeatures,
        getLockedFeatures,
        featureCategories: FEATURE_CATEGORIES,
        userPlan: user?.subscriptionPlan
    };
};
