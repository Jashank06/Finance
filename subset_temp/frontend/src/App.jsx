import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import PlaceholderPage from './pages/PlaceholderPage';
import UserSubscription from './pages/UserSubscription';
import CompanyProfile from './pages/CompanyProfile';
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
import ManageFinance from './pages/family/daily/ManageFinance';
import IncomeExpenses from './pages/family/daily/IncomeExpenses';
import ChequeRegister from './pages/family/daily/ChequeRegister';
import DailyCashRegister from './pages/family/daily/DailyCashRegister';
import DocumentManager from './pages/documents/DocumentManager';
import NetWorthDashboard from './pages/NetWorthDashboard';

// Admin Panel Imports
import AdminRedirect from './components/AdminRedirect';

// Landing Page Import
import LandingLayout from './landing/components/LandingLayout';

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
          <Route path="/forgot-password" element={<ForgotPassword />} />
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
            path="/net-worth"
            element={
              <ProtectedRoute>
                <Layout>
                  <NetWorthDashboard />
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
            path="/family/daily/loan-amortization"
            element={
              <ProtectedRoute>
                <Layout>
                  <LoanAmortization />
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
            path="/documents"
            element={
              <ProtectedRoute>
                <Layout>
                  <DocumentManager />
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
                  <UserSubscription />
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



        </Routes>
      </BrowserRouter >
    </AuthProvider >
  );
}

export default App;
