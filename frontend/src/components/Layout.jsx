// components/Layout.jsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  FileText, 
  BarChart3,
  LogOut,
  User,
  Shield
} from 'lucide-react';

export default function Layout({ children }) {
  const { user, logout, isSuperAdmin, isSubAdmin, isStudent } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const superAdminNav = [
    { name: 'Dashboard', href: '/super-admin/dashboard', icon: LayoutDashboard },
    { name: 'Manage Students', href: '/super-admin/students', icon: Users },
    { name: 'Sub Admins', href: '/super-admin/sub-admins', icon: Shield },
    { name: 'Analytics', href: '/super-admin/analytics', icon: BarChart3 },
  ];

  const subAdminNav = [
    { name: 'Dashboard', href: '/sub-admin/dashboard', icon: LayoutDashboard },
    { name: 'Create Company', href: '/sub-admin/create-company', icon: Building2 },
    { name: 'Verify Experiences', href: '/sub-admin/verify-experiences', icon: FileText },
    { name: 'Verify Profiles', href: '/sub-admin/verify-profiles', icon: Users },
  ];

  const studentNav = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Companies', href: '/companies', icon: Building2 },
    { name: 'My Applications', href: '/my-applications', icon: FileText },
    { name: 'My Track', href: '/my-track', icon: BarChart3 },
  ];

  const getNavItems = () => {
    if (isSuperAdmin()) return superAdminNav;
    if (isSubAdmin()) return subAdminNav;
    if (isStudent()) return studentNav;
    return [];
  };

  const getRoleBadge = () => {
    if (isSuperAdmin()) return { text: 'Super Admin', color: 'bg-red-100 text-red-800' };
    if (isSubAdmin()) return { text: 'Sub Admin', color: 'bg-blue-100 text-blue-800' };
    if (isStudent()) return { text: 'Student', color: 'bg-green-100 text-green-800' };
    return { text: 'User', color: 'bg-gray-100 text-gray-800' };
  };

  const roleBadge = getRoleBadge();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 border-b">
            <h1 className="text-xl font-bold text-blue-600">Placify</h1>
          </div>

          {/* User Info */}
          <div className="p-4 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  {user?.email}
                </p>
                <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${roleBadge.color}`}>
                  {roleBadge.text}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {getNavItems().map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <button
                  key={item.name}
                  onClick={() => navigate(item.href)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64">
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}