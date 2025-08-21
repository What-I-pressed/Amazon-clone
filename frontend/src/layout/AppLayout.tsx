import React from "react";
import { SidebarProvider } from "../context/SidebarContext";
import { Outlet } from "react-router";
import AppHeader from "./AppHeader";
import AppFooter from "./AppFooter";

const LayoutContent: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />

      <main
        className="flex-grow p-4 max-w-7xl mx-auto md:p-6"
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
      <LayoutContent />
    </SidebarProvider>
  );
};

export default AppLayout;
