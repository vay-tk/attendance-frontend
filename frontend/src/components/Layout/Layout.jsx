import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
      />
      
      <div className="flex">
        {/* Desktop Sidebar - Always visible on large screens */}
        <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:pt-16">
          <Sidebar 
            open={true} 
            setOpen={setSidebarOpen}
            userRole={user?.role}
          />
        </div>
        
        {/* Mobile Sidebar */}
        <div className="lg:hidden">
          <Sidebar 
            open={sidebarOpen} 
            setOpen={setSidebarOpen}
            userRole={user?.role}
          />
        </div>
        
        {/* Main content */}
        <main className="flex-1 lg:pl-64">
          <div className="p-4 !pt-20 lg:pt-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;