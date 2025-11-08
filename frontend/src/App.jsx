// App.jsx
import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute, SuperAdminRoute, SubAdminRoute, StudentRoute } from "./components/ProtectedRoute";

// Lazy loading for pages
const LoginPage = lazy(() => import("./pages/auth/LoginPage.jsx"));
const RegisterPage = lazy(() => import("./pages/auth/RegisterPage.jsx"));
const SetupPage = lazy(() => import("./pages/setup/SetupPage.jsx"));

// Student Pages
const DashboardPage = lazy(() => import("./pages/dashboard/DashboardPage.jsx"));
const CompanyPage = lazy(() => import("./pages/company/CompanyPage.jsx"));
const MyApplicationsPage = lazy(() => import("./pages/my-application/MyApplicationsPage.jsx"));
const MyTrackPage = lazy(() => import("./pages/my-track/MyTrackPage.jsx"));
const ProfilePage = lazy(() => import("./pages/profile/ProfilePage.jsx"));
const SubmitExperiencePage = lazy(() => import("./pages/submit-experience/SubmitExperiencePage.jsx"));

// Super Admin Pages
const SuperAdminDashboard = lazy(() => import("./pages/super-admin/SuperAdminDashboard.jsx"));
const ManageStudentsPage = lazy(() => import("./pages/super-admin/ManageStudentsPage.jsx"));
const ManageSubAdminsPage = lazy(() => import("./pages/super-admin/ManageSubAdminsPage.jsx"));
const AnalyticsPage = lazy(() => import("./pages/super-admin/AnalyticsPage.jsx"));
const ManageCompaniesPage = lazy(() => import("./pages/super-admin/CompaniesPage.jsx"));

// Sub Admin Pages
const SubAdminDashboard = lazy(() => import("./pages/sub-admin/SubAdminDashboard.jsx"));
const CreateCompanyPage = lazy(() => import("./pages/sub-admin/CreateCompanyPage.jsx"));
const VerifyExperiencesPage = lazy(() => import("./pages/sub-admin/VerifyExperiencesPage.jsx"));
const VerifyProfilesPage = lazy(() => import("./pages/sub-admin/VerifyProfilesPage.jsx"));

function Loader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<Loader />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Student Routes */}
            <Route path="/setup" element={<ProtectedRoute><SetupPage /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/company/:id" element={<StudentRoute><CompanyPage /></StudentRoute>} />
            <Route path="/my-applications" element={<StudentRoute><MyApplicationsPage /></StudentRoute>} />
            <Route path="/my-track" element={<StudentRoute><MyTrackPage /></StudentRoute>} />
            <Route path="/profile" element={<StudentRoute><ProfilePage /></StudentRoute>} />
            <Route path="/submit-experience" element={<StudentRoute><SubmitExperiencePage /></StudentRoute>} />

            {/* Super Admin Routes */}
            <Route path="/super-admin/dashboard" element={<SuperAdminRoute><SuperAdminDashboard /></SuperAdminRoute>} />
            <Route path="/super-admin/students" element={<SuperAdminRoute><ManageStudentsPage /></SuperAdminRoute>} />
            <Route path="/super-admin/sub-admins" element={<SuperAdminRoute><ManageSubAdminsPage /></SuperAdminRoute>} />
            <Route path="/super-admin/analytics" element={<SuperAdminRoute><AnalyticsPage /></SuperAdminRoute>} />
            <Route path="/super-admin/companies" element={<SuperAdminRoute><ManageCompaniesPage /></SuperAdminRoute>} />

            {/* Sub Admin Routes */}
            <Route path="/sub-admin/dashboard" element={<SubAdminRoute><SubAdminDashboard /></SubAdminRoute>} />
            <Route path="/sub-admin/create-company" element={<SubAdminRoute><CreateCompanyPage /></SubAdminRoute>} />
            <Route path="/sub-admin/verify-experiences" element={<SubAdminRoute><VerifyExperiencesPage /></SubAdminRoute>} />
            <Route path="/sub-admin/verify-profiles" element={<SubAdminRoute><VerifyProfilesPage /></SubAdminRoute>} />

            {/* Default Route */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* 404 Route */}
            <Route path="*" element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                  <p className="text-xl text-gray-600">Page not found</p>
                </div>
              </div>
            } />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}