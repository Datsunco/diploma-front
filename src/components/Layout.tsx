import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { useAppSelector } from "@/hooks/redux";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useGetNotificationsQuery } from "@/store/api/notificationApi";

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isOnline } = useAppSelector((state) => state.network);

  // Получаем уведомления для отображения в хедере
  const { data: notificationsData } = useGetNotificationsQuery({ limit: 5 });

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Боковая панель */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Основной контент */}
      <div className="flex flex-col flex-1 w-0 overflow-hidden">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          notificationsCount={notificationsData?.unreadCount || 0}
          isOnline={isOnline}
        />

        <main className="flex-1 relative overflow-y-auto focus:outline-none p-6">
          <div className="container mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
