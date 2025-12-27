import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import PlaceholderPage from './pages/PlaceholderPage';
import CompanyProfile from './pages/CompanyProfile';
import NpsPpfInvestment from './pages/investments/NpsPpfInvestment';
import GoldSgbInvestment from './pages/investments/GoldSgbInvestment';
import BankSchemesInvestment from './pages/investments/BankSchemesInvestment';
import MfInsuranceSharesInvestment from './pages/investments/MfInsuranceSharesInvestment';
import InvestmentValuationNew from './pages/investments/InvestmentValuationNew';
import ProjectIncomeExpense from './pages/investments/ProjectIncomeExpense';
import InvestmentProfile from './pages/investments/InvestmentProfile';
import LoanAmortization from './pages/investments/LoanAmortization';
import RetirementFinancial from './pages/investments/RetirementFinancial';
import TradingDetails from './pages/investments/TradingDetails';
import ProfitLoss from './pages/investments/ProfitLoss';
import BasicDetails from './pages/family/static/BasicDetails';
import OnlineAccessDetails from './pages/family/static/OnlineAccessDetails';
import MobileEmailDetails from './pages/family/static/MobileEmailDetails';
import CompanyRecords from './pages/family/static/CompanyRecords';
import PersonalRecords from './pages/family/static/PersonalRecords';
import FamilyProfile from './pages/FamilyProfile';
import FamilyTasks from './pages/family/FamilyTasks';
import InventoryRecord from './pages/family/static/InventoryRecord';
import ContactManagement from './pages/family/static/ContactManagement';
import DigitalAssets from './pages/family/static/DigitalAssets';
import CustomerSupport from './pages/family/static/CustomerSupport';
import LandRecords from './pages/family/static/LandRecords';
import MembershipList from './pages/family/static/MembershipList';
import CashCardsBank from './pages/family/daily/CashCardsBank';
import LoanLedger from './pages/family/daily/LoanLedger';
import BillChecklistNew from './pages/family/daily/BillChecklistNew';
import TelephoneConversation from './pages/family/daily/TelephoneConversation';
import BillDates from './pages/family/monitoring/BillDates';
import WeeklyAppointments from './pages/family/monitoring/WeeklyAppointments';
import YearlyCalendar from './pages/family/monitoring/YearlyCalendar';
import MultipleCalendars from './pages/family/monitoring/MultipleCalendars';
import RemindersNotifications from './pages/family/monitoring/RemindersNotifications';
import ManageFinance from './pages/family/daily/ManageFinance';
import IncomeExpenses from './pages/family/daily/IncomeExpenses';
import ChequeRegister from './pages/family/daily/ChequeRegister';
import DailyCashRegister from './pages/family/daily/DailyCashRegister';
import Milestones from './pages/family/monitoring/Milestones';
import TargetsForLife from './pages/family/monitoring/TargetsForLife';

// Admin Panel Imports
import AdminLayout from './components/AdminLayout';
import AdminRedirect from './components/AdminRedirect';
import AdminDashboard from './pages/admin/AdminDashboard';
import SubscriberManagement from './pages/admin/SubscriberManagement';
import SubscriptionPlans from './pages/admin/SubscriptionPlans';
import SpaceRetailing from './pages/admin/SpaceRetailing';
import FeaturesAnalytics from './pages/admin/FeaturesAnalytics';
import BlogsManagement from './pages/admin/BlogsManagement';
import SuccessStoriesManagement from './pages/admin/SuccessStoriesManagement';
import CareerManagement from './pages/admin/CareerManagement';
import ContactMessages from './pages/admin/ContactMessages';
import ContactDeveloper from './pages/admin/ContactDeveloper';
import FeedbackManagement from './pages/admin/FeedbackManagement';

// Landing Page Import
import LandingLayout from './landing/components/LandingLayout';
import BlogsPage from './landing/components/BlogsPage';
import BlogDetailPage from './landing/components/BlogDetailPage';
import SuccessStoriesPage from './landing/components/SuccessStoriesPage';
import SuccessStoryDetailPage from './landing/components/SuccessStoryDetailPage';
import CareersPage from './landing/components/CareersPage';
import CareerDetailPage from './landing/components/CareerDetailPage';

// Payment Pages
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailure from './pages/PaymentFailure';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename="/">
        <Routes>
          {/* Root redirect to landing page */}
          <Route path="/" element={<Navigate to="/landing" replace />} />
          
          {/* Landing Page - Public Route */}
          <Route path="/landing/*" element={<LandingLayout />} />

          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-failure" element={<PaymentFailure />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/family-profile"
            element={
              <ProtectedRoute>
                <Layout>
                  <FamilyProfile />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/company-profile"
            element={
              <ProtectedRoute>
                <Layout>
                  <CompanyProfile />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Family Routes */}
          <Route
            path="/family/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <PlaceholderPage title="Family Section" />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/family/tasks"
            element={
              <ProtectedRoute>
                <Layout>
                  <FamilyTasks />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Business Routes */}
          <Route
            path="/business/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <PlaceholderPage title="Business Section" />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Investment Routes under Family */}
          <Route
            path="/family/investments/nps-ppf"
            element={
              <ProtectedRoute>
                <Layout>
                  <NpsPpfInvestment />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/family/investments/gold-sgb"
            element={
              <ProtectedRoute>
                <Layout>
                  <GoldSgbInvestment />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/family/investments/bank-schemes"
            element={
              <ProtectedRoute>
                <Layout>
                  <BankSchemesInvestment />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/family/investments/mf-insurance-shares"
            element={
              <ProtectedRoute>
                <Layout>
                  <MfInsuranceSharesInvestment />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/family/investments/valuation-allocation"
            element={
              <ProtectedRoute>
                <Layout>
                  <InvestmentValuationNew />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/family/investments/project-income-expense"
            element={
              <ProtectedRoute>
                <Layout>
                  <ProjectIncomeExpense />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/family/investments/profile"
            element={
              <ProtectedRoute>
                <Layout>
                  <InvestmentProfile />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/family/investments/loan-amortization"
            element={
              <ProtectedRoute>
                <Layout>
                  <LoanAmortization />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/family/investments/retirement"
            element={
              <ProtectedRoute>
                <Layout>
                  <RetirementFinancial />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/family/investments/trading-details"
            element={
              <ProtectedRoute>
                <Layout>
                  <TradingDetails />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/family/investments/profit-loss"
            element={
              <ProtectedRoute>
                <Layout>
                  <ProfitLoss />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Static Routes under Family */}
          <Route
            path="/family/static/basic-details"
            element={
              <ProtectedRoute>
                <Layout>
                  <BasicDetails />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/family/static/online-access-details"
            element={
              <ProtectedRoute>
                <Layout>
                  <OnlineAccessDetails />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/family/static/mobile-email-details"
            element={
              <ProtectedRoute>
                <Layout>
                  <MobileEmailDetails />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/family/static/company-records"
            element={
              <ProtectedRoute>
                <Layout>
                  <CompanyRecords />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/family/static/personal-records"
            element={
              <ProtectedRoute>
                <Layout>
                  <PersonalRecords />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/family/static/family-profile"
            element={
              <ProtectedRoute>
                <Layout>
                  <FamilyProfile />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/family/static/inventory-record"
            element={
              <ProtectedRoute>
                <Layout>
                  <InventoryRecord />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/family/static/contact-management"
            element={
              <ProtectedRoute>
                <Layout>
                  <ContactManagement />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/family/static/digital-assets"
            element={
              <ProtectedRoute>
                <Layout>
                  <DigitalAssets />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/family/static/customer-support"
            element={
              <ProtectedRoute>
                <Layout>
                  <CustomerSupport />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/family/static/land-records"
            element={
              <ProtectedRoute>
                <Layout>
                  <LandRecords />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/family/static/membership-list"
            element={
              <ProtectedRoute>
                <Layout>
                  <MembershipList />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Daily Routes under Family */}
          <Route
            path="/family/daily/cash-cards-bank"
            element={
              <ProtectedRoute>
                <Layout>
                  <CashCardsBank />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/family/daily/loan-udhar"
            element={
              <ProtectedRoute>
                <Layout>
                  <LoanLedger />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/family/daily/bill-paying"
            element={
              <ProtectedRoute>
                <Layout>
                  <BillChecklistNew />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/family/daily/manage-finance"
            element={
              <ProtectedRoute>
                <Layout>
                  <ManageFinance />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/family/daily/income-expenses"
            element={
              <ProtectedRoute>
                <Layout>
                  <IncomeExpenses />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/family/daily/telephone-conversation"
            element={
              <ProtectedRoute>
                <Layout>
                  <TelephoneConversation />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/family/monitoring/bill-dates"
            element={
              <ProtectedRoute>
                <Layout>
                  <BillDates />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/family/monitoring/weekly-appointment"
            element={
              <ProtectedRoute>
                <Layout>
                  <WeeklyAppointments />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/family/monitoring/yearly-calendar"
            element={
              <ProtectedRoute>
                <Layout>
                  <YearlyCalendar />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/family/monitoring/multiple-calendars"
            element={
              <ProtectedRoute>
                <Layout>
                  <MultipleCalendars />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/family/daily/cheque-register"
            element={
              <ProtectedRoute>
                <Layout>
                  <ChequeRegister />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/family/daily/daily-cash-register"
            element={
              <ProtectedRoute>
                <Layout>
                  <DailyCashRegister />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/family/monitoring/milestones"
            element={
              <ProtectedRoute>
                <Layout>
                  <Milestones />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/family/monitoring/targets-for-life"
            element={
              <ProtectedRoute>
                <Layout>
                  <TargetsForLife />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/family/monitoring/reminders-notifications"
            element={
              <ProtectedRoute>
                <Layout>
                  <RemindersNotifications />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/libraries"
            element={
              <ProtectedRoute>
                <Layout>
                  <PlaceholderPage title="Libraries" />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/subscription"
            element={
              <ProtectedRoute>
                <Layout>
                  <PlaceholderPage title="Subscription Plan" />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/feedback"
            element={
              <ProtectedRoute>
                <Layout>
                  <PlaceholderPage title="Feedback" />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/contact"
            element={
              <ProtectedRoute>
                <Layout>
                  <PlaceholderPage title="Contact Developer" />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Redirect root based on user role */}
          <Route path="/" element={<AdminRedirect />} />

          {/* Admin Panel Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/subscribers"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <SubscriberManagement />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/plans"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <SubscriptionPlans />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/space-retailing"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <SpaceRetailing />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <FeaturesAnalytics />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/blogs"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <BlogsManagement />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/success-stories"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <SuccessStoriesManagement />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/careers"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <CareerManagement />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/contact-messages"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <ContactMessages />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/contact"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <ContactDeveloper />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/feedback"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <FeedbackManagement />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter >
    </AuthProvider >
  );
}

export default App;
