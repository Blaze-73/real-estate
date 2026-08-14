import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PublicLayout from './components/layout/PublicLayout';
import AdminLayout from './components/layout/AdminLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import ScrollToTop from './components/common/ScrollToTop';

const Home = lazy(() => import('./pages/public/Home'));
const Properties = lazy(() => import('./pages/public/Properties'));
const PropertyDetails = lazy(() => import('./pages/public/PropertyDetails'));
const About = lazy(() => import('./pages/public/About'));
const Contact = lazy(() => import('./pages/public/Contact'));
const PaymentPage = lazy(() => import('./pages/public/PaymentPage'));
const NotFound = lazy(() => import('./pages/public/NotFound'));
const Login = lazy(() => import('./pages/Auth/Login'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const PropertiesManagement = lazy(() => import('./pages/admin/PropertiesManagement'));
const ClientsManagement = lazy(() => import('./pages/admin/ClientsManagement'));
const ReservationsManagement = lazy(() => import('./pages/admin/ReservationsManagement'));
const RentalsManagement = lazy(() => import('./pages/admin/RentalsManagement'));
const PaymentsManagement = lazy(() => import('./pages/admin/PaymentsManagement'));
const TestimonialsManagement = lazy(() => import('./pages/admin/TestimonialsManagement'));
const ReviewsManagement = lazy(() => import('./pages/admin/ReviewsManagement'));
const MessagesManagement = lazy(() => import('./pages/admin/MessagesManagement'));
const NotificationsPage = lazy(() => import('./pages/admin/NotificationsPage'));
const SettingsPage = lazy(() => import('./pages/admin/SettingsPage'));
const ActivityLogs = lazy(() => import('./pages/admin/ActivityLogs'));
const CalendarManagement = lazy(() => import('./pages/admin/CalendarManagement'));

const PageLoader = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex items-center justify-center bg-sand-50 dark:bg-ink-950">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-ocean-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-ink-400 dark:text-ink-300">{t('app.loading')}</p>
      </div>
    </div>
  );
};

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <ScrollToTop />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/properties/:slug" element={<PropertyDetails />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/pay/:token" element={<PaymentPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="properties" element={<PropertiesManagement />} />
            <Route path="clients" element={<ClientsManagement />} />
            <Route path="reservations" element={<ReservationsManagement />} />
            <Route path="calendar" element={<CalendarManagement />} />
            <Route path="rentals" element={<RentalsManagement />} />
            <Route path="payments" element={<PaymentsManagement />} />
            <Route path="testimonials" element={<TestimonialsManagement />} />
            <Route path="reviews" element={<ReviewsManagement />} />
            <Route path="messages" element={<MessagesManagement />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="activity-logs" element={<ActivityLogs />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
