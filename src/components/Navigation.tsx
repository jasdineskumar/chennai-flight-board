import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Plane, Home, List, Plus, Settings } from "lucide-react";

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard", icon: Home },
    { path: "/flights", label: "Flights", icon: List },
    { path: "/add-flight", label: "Add Flight", icon: Plus },
    { path: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <nav className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-2">
          <Plane className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-xl font-bold text-foreground">Chennai Airport</h1>
            <p className="text-sm text-muted-foreground">Flight Information Display System</p>
          </div>
        </div>
        
        <div className="flex space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;