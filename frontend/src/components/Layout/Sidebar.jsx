import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Calendar,
  Users,
  BookOpen,
  BarChart3,
  Settings,
  QrCode,
  History,
  Shield,
  X
} from 'lucide-react';

const Sidebar = ({ open, setOpen, userRole }) => {
  const location = useLocation();

  const navigationItems = {
    student: [
      { name: 'Dashboard', href: '/dashboard', icon: Home },
      { name: 'Mark Attendance', href: '/mark-attendance', icon: QrCode },
      { name: 'Attendance History', href: '/attendance-history', icon: History },
      { name: 'Profile', href: '/profile', icon: Users },
    ],
    faculty: [
      { name: 'Dashboard', href: '/faculty/dashboard', icon: Home },
      { name: 'My Courses', href: '/faculty/courses', icon: BookOpen },
      { name: 'Sessions', href: '/faculty/sessions', icon: Calendar },
      { name: 'Analytics', href: '/faculty/analytics', icon: BarChart3 },
      { name: 'Profile', href: '/profile', icon: Users },
    ],
    admin: [
      { name: 'Dashboard', href: '/admin/dashboard', icon: Home },
      { name: 'Users', href: '/admin/users', icon: Users },
      { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
      { name: 'System', href: '/admin/system', icon: Shield },
      { name: 'Profile', href: '/profile', icon: Users },
    ],
  };

  const items = navigationItems[userRole] || [];

  const isActive = (href) => location.pathname === href;

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div className={`
        fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 z-30 transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0 lg:z-auto
        ${open ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Close button for mobile */}
          <div className="flex items-center justify-between px-4 py-2 lg:hidden">
            <span className="text-lg font-semibold text-gray-900">Navigation</span>
            <button
              onClick={() => setOpen(false)}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4">
            <ul className="space-y-2">
              {items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                
                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      onClick={() => setOpen(false)}
                      className={`
                        flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group
                        ${active 
                          ? 'bg-primary-50 text-primary-600 border-r-4 border-primary-600' 
                          : 'text-gray-700 hover:bg-gray-100 hover:text-primary-600'
                        }
                      `}
                    >
                      <Icon size={20} className="flex-shrink-0 mr-3" />
                      <span>{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;