import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Leaf, Shield, Eye, Truck, QrCode, Users } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";

export default function Landing() {
  const [lookupId, setLookupId] = useState("");
  const [, setLocation] = useLocation();
  const { refreshAuth } = useAuth();

  const handleLookup = () => {
    if (lookupId.trim()) {
      setLocation(`/lookup/${encodeURIComponent(lookupId.trim())}`);
    }
  };

  const handleLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    // Use fetch instead of window.location to prevent page refresh
    fetch('/api/login', {
      method: 'GET',
      credentials: 'include',
    })
      .then(response => {
        if (response.ok) {
          // If login successful, refresh auth state and navigate to dashboard
          refreshAuth();
          setLocation('/');
        } else {
          // Handle any other response
          console.error('Login failed');
        }
      })
      .catch(error => {
        console.error('Login error:', error);
      });
  };

  const handleStakeholderLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    // Use fetch instead of window.location to prevent page refresh
    fetch('/api/login', {
      method: 'GET',
      credentials: 'include',
    })
      .then(response => {
        if (response.ok) {
          // If login successful, refresh auth state and navigate to dashboard
          refreshAuth();
          setLocation('/');
        } else {
          // Handle any other response
          console.error('Login failed');
        }
      })
      .catch(error => {
        console.error('Login error:', error);
      });
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
            <Button onClick={handleLogin} data-testid="button-login">
              Sign In
            </Button>
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

          <Button size="lg" onClick={handleLogin} data-testid="button-get-started">
            Get Started as Stakeholder
          </Button>
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
          <Button size="lg" onClick={handleLogin} data-testid="button-join-now">
            Join AgriTrace Now
          </Button>
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
