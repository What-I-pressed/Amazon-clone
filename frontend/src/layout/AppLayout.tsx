import React from "react";
import { SidebarProvider } from "../context/SidebarContext";
import { AuthProvider } from "../context/AuthContext";
import { Outlet } from "react-router";
import AppHeader from "./AppHeader";
import AppFooter from "./AppFooter";

const LayoutContent: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#ffffff]">
      <AppHeader />

      <main
        className="flex-grow"
        style={{
          minHeight: "calc(100vh - 144px + 69px)",
        }}
      >
        <Outlet />
      </main>

      <AppFooter />
    </div>
  );
};

const AppLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <AuthProvider>
        <LayoutContent />
      </AuthProvider>
    </SidebarProvider>
  );
};

export default AppLayout;
