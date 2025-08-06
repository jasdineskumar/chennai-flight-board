import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import FlightsTable from "./pages/FlightsTable";
import AddFlight from "./pages/AddFlight";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import FidsDisplay from "./pages/FidsDisplay";
import Navigation from "./components/Navigation";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/display" element={<FidsDisplay />} />
          <Route path="/*" element={
            <div className="min-h-screen bg-background">
              <Navigation />
              <main className="max-w-7xl mx-auto px-6 py-8">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/flights" element={<FlightsTable />} />
                  <Route path="/add-flight" element={<AddFlight />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
          } />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
