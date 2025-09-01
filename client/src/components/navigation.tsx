import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Link, useLocation } from "wouter";
import { Leaf, Menu, LogOut } from "lucide-react";
import { useState } from "react";

export default function Navigation() {
  const { user } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/' },
    { name: 'Track Product', href: '/products' },
    { name: 'Verify', href: '/verify' },
    { name: 'Lookup', href: '/lookup' },
  ];

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const NavItems = () => (
    <>
      {navigation.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className={`${
            location === item.href
              ? 'text-primary font-medium'
              : 'text-muted-foreground hover:text-foreground'
          } transition-colors`}
          onClick={() => setMobileMenuOpen(false)}
          data-testid={`nav-${item.name.toLowerCase().replace(' ', '-')}`}
        >
          {item.name}
        </Link>
      ))}
    </>
  );

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2" data-testid="nav-logo">
              <Leaf className="text-primary text-2xl" />
              <span className="text-xl font-bold text-foreground">AgriTrace</span>
            </Link>
            <nav className="hidden md:flex space-x-8">
              <NavItems />
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            {user && (
              <div className="hidden md:flex items-center space-x-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user.profileImageUrl || undefined} />
                  <AvatarFallback>
                    {user.firstName?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium" data-testid="user-name">
                    {user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.email}
                  </span>
                  <Badge variant="secondary" className="text-xs" data-testid="user-role">
                    {user.role}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  data-testid="button-logout"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            )}
            
            {/* Mobile menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden" data-testid="button-mobile-menu">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col h-full">
                  <div className="flex items-center space-x-2 mb-8">
                    <Leaf className="text-primary" />
                    <span className="font-semibold">AgriTrace</span>
                  </div>
                  
                  <nav className="flex flex-col space-y-4 flex-1">
                    <NavItems />
                  </nav>
                  
                  {user && (
                    <div className="border-t pt-4 mt-4">
                      <div className="flex items-center space-x-3 mb-4">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={user.profileImageUrl || undefined} />
                          <AvatarFallback>
                            {user.firstName?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">
                            {user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.email}
                          </p>
                          <p className="text-sm text-muted-foreground">{user.role}</p>
                        </div>
                      </div>
                      <Button 
                        onClick={handleLogout} 
                        variant="outline" 
                        className="w-full"
                        data-testid="button-mobile-logout"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
