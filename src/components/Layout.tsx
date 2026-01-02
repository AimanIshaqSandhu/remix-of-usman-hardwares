import { Outlet, Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Database, FlaskConical, LineChart, Brain, Activity } from "lucide-react";

const Layout = () => {
  const location = useLocation();
  
  const navItems = [
    { path: "/", label: "Home", icon: Activity },
    { path: "/dataset", label: "Dataset", icon: Database },
    { path: "/training", label: "Training", icon: FlaskConical },
    { path: "/dashboard", label: "Dashboard", icon: LineChart },
    { path: "/predictions", label: "Predictions", icon: Brain },
  ];

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Brain className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl text-foreground">NeoHack</span>
            </Link>
            
            <div className="flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center space-x-2 px-4 py-2 rounded-md transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>
      
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
