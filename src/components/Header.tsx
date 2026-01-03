import { ClipboardList, User, Menu, Home, ChevronRight, Maximize, Minimize } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useToast } from "@/hooks/use-toast";
import { useSidebar } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLocation } from "react-router-dom";

export function Header() {
  const { toast } = useToast();
  const { toggleSidebar } = useSidebar();
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Fullscreen toggle function
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((err) => {
        console.error('Error attempting to enable fullscreen:', err);
        toast({
          title: "Fullscreen Error",
          description: "Could not enter fullscreen mode",
          variant: "destructive"
        });
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch((err) => {
        console.error('Error attempting to exit fullscreen:', err);
      });
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Breadcrumb generation based on current route
  const getBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: Array<{ name: string; path: string; icon?: React.ForwardRefExoticComponent<any> }> = [
      { name: 'Dashboard', path: '/', icon: Home }
    ];
    
    let currentPath = '';
    pathSegments.forEach(segment => {
      currentPath += `/${segment}`;
      let name = segment.charAt(0).toUpperCase() + segment.slice(1).replace('-', ' ');
      
      // Special case for reports route
      if (segment === 'reports') {
        name = 'Ask AI';
      }
      
      breadcrumbs.push({ name, path: currentPath });
    });
    
    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="h-16 border-b border-border bg-background sticky top-0 z-50">
      <div className="flex h-full items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-4 flex-1">
          {/* Mobile Sidebar Toggle */}
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="md:hidden h-8 w-8"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          
          {/* Breadcrumb Navigation - Hidden on mobile */}
          <div className="hidden md:flex items-center gap-2 flex-1">
            <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
              {breadcrumbs.map((breadcrumb, index) => (
                <div key={breadcrumb.path} className="flex items-center">
                  {index === 0 && breadcrumb.icon && (
                    <breadcrumb.icon className="h-4 w-4 mr-1" />
                  )}
                  <span className={index === breadcrumbs.length - 1 ? "text-foreground font-medium" : "hover:text-foreground cursor-pointer"}>
                    {breadcrumb.name}
                  </span>
                  {index < breadcrumbs.length - 1 && (
                    <ChevronRight className="h-4 w-4 mx-1" />
                  )}
                </div>
              ))}
            </nav>
          </div>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          {/* Fullscreen Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            className="h-8 w-8 md:h-10 md:w-10 hover:bg-accent hover:text-accent-foreground"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? (
              <Minimize className="h-4 w-4 md:h-5 md:w-5" />
            ) : (
              <Maximize className="h-4 w-4 md:h-5 md:w-5" />
            )}
          </Button>

          {/* Inventory Logs Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/inventory-logs')}
            className="h-8 w-8 md:h-10 md:w-10 hover:bg-accent hover:text-accent-foreground"
            title="Inventory Logs"
          >
            <ClipboardList className="h-4 w-4 md:h-5 md:w-5" />
          </Button>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/avatars/01.png" alt="Admin" />
                  <AvatarFallback className="bg-primary text-primary-foreground">A</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-background border shadow-lg z-50" align="end" forceMount>
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
