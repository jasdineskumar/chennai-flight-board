import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { NavBar } from "@/components/ui/tubelight-navbar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import FlightsTable from "./pages/FlightsTable";
import AddFlight from "./pages/AddFlight";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import FidsDisplay from "./pages/FidsDisplay";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Navigation from "./components/Navigation";
import { useAuth } from "./hooks/useAuth";
import { LayoutDashboard, Plane, PlusCircle, Monitor, Settings as SettingsIcon } from "lucide-react";

const queryClient = new QueryClient();

const AppContent = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const ProtectedLayout = () => {
    const { user, loading } = useAuth();

    const navItems = [
      { name: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { name: "Flights", url: "/flights", icon: Plane },
      { name: "Add Flight", url: "/add-flight", icon: PlusCircle },
      { name: "Display", url: "/display", icon: Monitor },
      { name: "Settings", url: "/settings", icon: SettingsIcon },
    ];

    if (loading) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
        </div>
      );
    }

    if (!user) {
      return <Navigate to="/auth" replace />;
    }

    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <NavBar items={navItems} />
        <main className="max-w-7xl mx-auto px-6 py-8">
          <Outlet />
        </main>
      </div>
    );
  };
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/display" element={<FidsDisplay />} />
        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/flights" element={<FlightsTable />} />
          <Route path="/add-flight" element={<AddFlight />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppContent />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
