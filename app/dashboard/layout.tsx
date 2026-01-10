"use client";

import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../lib/store";

import Sidebar from "../components/homepage/SideBar";
import Header from "../components/homepage/Header";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { darkMode, sidebarOpen } = useSelector((state: RootState) => state.ui);

  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);
  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode ? "dark bg-gray-900" : "bg-gray-50"
      }`}
    >
      <div className="flex">
        <Sidebar />
        <div
          className={`flex-1 transition-all duration-300 ${
            sidebarOpen ? "md:ml-64" : "md:ml-16"
          }`}
        >
          <Header />
          <main className="flex-1 p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </div>
  );
}
