import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Leaf, Shield, Eye, Truck, QrCode, Users, User, Building, Store, CheckCircle2, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";

export default function Landing() {
  const [lookupId, setLookupId] = useState("");
  const [, setLocation] = useLocation();
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const { refreshAuth } = useAuth();

  // Fetch available roles
  const { data: rolesData } = useQuery({
    queryKey: ["/api/roles"],
    retry: false,
  });

  const handleLookup = () => {
    if (lookupId.trim()) {
      setLocation(`/lookup/${encodeURIComponent(lookupId.trim())}`);
    }
  };

  const handleRoleLogin = async (role: string) => {
    setLoggingIn(true);
    try {
      const response = await fetch(`/api/login?role=${role}`, {
        method: 'GET',
        credentials: 'include',
      });
      
      if (response.ok) {
        // If login successful, refresh auth state and navigate to dashboard
        refreshAuth();
        setRoleModalOpen(false);
        setLocation('/');
      } else {
        console.error('Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    setRoleModalOpen(true);
  };

  const handleStakeholderLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    setRoleModalOpen(true);
  };
  
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'farmer': return <Leaf className="w-5 h-5" />;
      case 'distributor': return <Truck className="w-5 h-5" />;
      case 'retailer': return <Store className="w-5 h-5" />;
      case 'inspector': return <CheckCircle2 className="w-5 h-5" />;
      case 'consumer': return <User className="w-5 h-5" />;
      default: return <User className="w-5 h-5" />;
    }
  };
  
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'farmer': return 'bg-green-600 hover:bg-green-700';
      case 'distributor': return 'bg-blue-600 hover:bg-blue-700';
      case 'retailer': return 'bg-red-600 hover:bg-red-700';
      case 'inspector': return 'bg-purple-600 hover:bg-purple-700';
      case 'consumer': return 'bg-emerald-600 hover:bg-emerald-700';
      default: return 'bg-gray-600 hover:bg-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Leaf className="text-primary text-2xl" />
              <span className="text-xl font-bold text-foreground">AgriTrace</span>
            </div>
            <Dialog open={roleModalOpen} onOpenChange={setRoleModalOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-login">
                  Sign In
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Choose Your Role</DialogTitle>
                  <DialogDescription>
                    Select your role to access the appropriate dashboard and features.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 gap-4 py-4">
                  {rolesData?.roles?.map((roleData: any) => (
                    <Card 
                      key={roleData.role}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => !loggingIn && handleRoleLogin(roleData.role)}
                    >
                      <CardContent className="flex items-center space-x-4 p-4">
                        <div className={`p-3 rounded-full ${getRoleColor(roleData.role)} text-white`}>
                          {getRoleIcon(roleData.role)}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{roleData.label}</h3>
                          <p className="text-sm text-muted-foreground">
                            {roleData.user.firstName} {roleData.user.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {roleData.user.companyName || roleData.user.email}
                          </p>
                        </div>
                        <Badge variant="secondary">
                          {roleData.user.location}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {loggingIn && (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">Signing in...</p>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-50 to-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Transparent Supply Chain for Agricultural Produce
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Track your food from farm to table. Verify quality, origin, and authenticity 
            with blockchain-powered transparency for farmers, distributors, and consumers.
          </p>
          
          {/* Consumer Lookup */}
          <div className="max-w-md mx-auto mb-8">
            <div className="flex space-x-2">
              <Input
                type="text"
                placeholder="Enter Product ID or Batch Number"
                value={lookupId}
                onChange={(e) => setLookupId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLookup()}
                className="flex-1"
                data-testid="input-lookup"
              />
              <Button onClick={handleLookup} data-testid="button-lookup">
                Track Product
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              <Shield className="inline w-3 h-3 mr-1" />
              All lookups are recorded for transparency
            </p>
          </div>

          <Dialog open={roleModalOpen} onOpenChange={setRoleModalOpen}>
            <DialogTrigger asChild>
              <Button size="lg" data-testid="button-get-started">
                Get Started as Stakeholder
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Complete Supply Chain Transparency
            </h2>
            <p className="text-muted-foreground text-lg">
              Built for farmers, distributors, retailers, and consumers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <QrCode className="w-8 h-8 text-primary mb-2" />
                <CardTitle>QR Code Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Every product gets a unique QR code for instant tracking and verification
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Eye className="w-8 h-8 text-secondary mb-2" />
                <CardTitle>Supply Chain Visibility</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Track products through every stage from farm to consumer
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="w-8 h-8 text-accent mb-2" />
                <CardTitle>Quality Verification</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Independent verification and certification at each stage
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Truck className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Real-time Updates</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Live tracking of product movement and status changes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="w-8 h-8 text-secondary mb-2" />
                <CardTitle>Stakeholder Network</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Connect farmers, distributors, retailers, and consumers
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Leaf className="w-8 h-8 text-accent mb-2" />
                <CardTitle>Sustainable Practices</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Promote transparency and reduce exploitation in agriculture
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stakeholder Benefits */}
      <section className="bg-muted py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Benefits for Every Stakeholder
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-primary">Farmers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">• Product registration & tracking</p>
                <p className="text-sm text-muted-foreground">• Fair pricing transparency</p>
                <p className="text-sm text-muted-foreground">• Direct market access</p>
                <p className="text-sm text-muted-foreground">• Quality certification</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-secondary">Distributors</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">• Supply chain visibility</p>
                <p className="text-sm text-muted-foreground">• Inventory tracking</p>
                <p className="text-sm text-muted-foreground">• Partner verification</p>
                <p className="text-sm text-muted-foreground">• Logistics optimization</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-accent">Retailers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">• Product authenticity</p>
                <p className="text-sm text-muted-foreground">• Quality assurance</p>
                <p className="text-sm text-muted-foreground">• Consumer trust</p>
                <p className="text-sm text-muted-foreground">• Compliance reporting</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-primary">Consumers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">• Product origin lookup</p>
                <p className="text-sm text-muted-foreground">• Quality verification</p>
                <p className="text-sm text-muted-foreground">• Freshness tracking</p>
                <p className="text-sm text-muted-foreground">• Ethical sourcing</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to Transform Your Supply Chain?
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Join the transparency revolution and build trust with your stakeholders
          </p>
          <Dialog open={roleModalOpen} onOpenChange={setRoleModalOpen}>
            <DialogTrigger asChild>
              <Button size="lg" data-testid="button-join-now">
                Join AgriTrace Now
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-2">
            <Leaf className="text-primary" />
            <span className="font-bold text-foreground">AgriTrace</span>
            <span className="text-muted-foreground">- Transparency in Agriculture</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
