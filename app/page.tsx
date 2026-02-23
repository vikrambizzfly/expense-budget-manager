'use client';

import { useAuth } from "@/contexts/AuthContext";
import { Sidebar } from "@/components/layout/Sidebar";
// import DashboardV1Gradient from "./(dashboard)/dashboard-v1-gradient";
// import DashboardV2Minimal from "./(dashboard)/dashboard-v2-minimal";
import DashboardV3Analytics from "./(dashboard)/dashboard-v3-analytics";
import LandingPage from "./landing-page";

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show dashboard if authenticated, landing page if not
  if (isAuthenticated) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-6 max-w-7xl">
            {/* <DashboardV1Gradient /> */}
            {/* <DashboardV2Minimal /> */}
            <DashboardV3Analytics />
          </div>
        </main>
      </div>
    );
  }

  return <LandingPage />;
}
