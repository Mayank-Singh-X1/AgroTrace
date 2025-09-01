import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navigation from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import QRCodeGenerator from "@/components/qr-code-generator";
import SupplyChainVisualization from "@/components/supply-chain-visualization";
import TransactionHistory from "@/components/transaction-history";
import { 
  Box, 
  CheckCircle, 
  Users, 
  DollarSign, 
  Plus, 
  Shield, 
  BarChart3, 
  UserPlus,
  Search
} from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

export default function Dashboard() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [lookupQuery, setLookupQuery] = useState("");

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/analytics/stats"],
    retry: false,
  });

  const { data: recentProducts } = useQuery({
    queryKey: ["/api/products"],
    retry: false,
  });

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'addProduct':
        setLocation('/products');
        break;
      case 'verifyBatch':
        setLocation('/verify');
        break;
      case 'generateReport':
        toast({
          title: "Report Generation",
          description: "Report generation feature coming soon!",
        });
        break;
      case 'inviteStakeholder':
        toast({
          title: "Stakeholder Invitation",
          description: "Stakeholder invitation feature coming soon!",
        });
        break;
      default:
        break;
    }
  };

  const handleLookup = () => {
    if (lookupQuery.trim()) {
      setLocation(`/lookup/${encodeURIComponent(lookupQuery.trim())}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-card rounded-lg p-6 border border-border h-24" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Products</p>
                  <p className="text-3xl font-bold text-foreground" data-testid="stat-active-products">
                    {statsLoading ? "..." : stats?.activeProducts || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Box className="text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Verified Transactions</p>
                  <p className="text-3xl font-bold text-foreground" data-testid="stat-verified-transactions">
                    {statsLoading ? "..." : stats?.verifiedTransactions || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                  <CheckCircle className="text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Supply Chain Partners</p>
                  <p className="text-3xl font-bold text-foreground" data-testid="stat-partners">
                    {statsLoading ? "..." : stats?.partners || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Users className="text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Revenue This Month</p>
                  <p className="text-3xl font-bold text-foreground" data-testid="stat-revenue">
                    {statsLoading ? "..." : `$${stats?.revenue?.toLocaleString() || 0}`}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Product Tracking Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* QR Code Generator */}
          <Card>
            <CardHeader>
              <CardTitle>Product QR Code</CardTitle>
              <p className="text-sm text-muted-foreground">Generate or scan QR codes for product tracking</p>
            </CardHeader>
            <CardContent>
              <QRCodeGenerator product={recentProducts?.[0]} />
            </CardContent>
          </Card>

          {/* Supply Chain Visualization */}
          <Card>
            <CardHeader>
              <CardTitle>Supply Chain Journey</CardTitle>
              <p className="text-sm text-muted-foreground">Track product movement through the supply chain</p>
            </CardHeader>
            <CardContent>
              <SupplyChainVisualization productId={recentProducts?.[0]?.id} />
            </CardContent>
          </Card>
        </div>

        {/* Transaction History & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Recent Transactions */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Recent Transactions</CardTitle>
                    <p className="text-sm text-muted-foreground">Latest blockchain verified transactions</p>
                  </div>
                  <Button 
                    onClick={() => setLocation('/transactions')}
                    data-testid="button-view-all-transactions"
                  >
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <TransactionHistory limit={5} />
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <p className="text-sm text-muted-foreground">Common tasks and operations</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {user.role === 'farmer' && (
                <Button 
                  className="w-full bg-primary text-primary-foreground p-4 h-auto justify-start hover:bg-primary/90"
                  onClick={() => handleQuickAction('addProduct')}
                  data-testid="button-add-product"
                >
                  <div className="flex items-center space-x-3">
                    <Plus className="text-xl" />
                    <div className="text-left">
                      <p className="font-medium">Add New Product</p>
                      <p className="text-xs opacity-90">Register a new batch for tracking</p>
                    </div>
                  </div>
                </Button>
              )}
              
              <Button 
                className="w-full bg-secondary text-secondary-foreground p-4 h-auto justify-start hover:bg-secondary/90"
                onClick={() => handleQuickAction('verifyBatch')}
                data-testid="button-verify-batch"
              >
                <div className="flex items-center space-x-3">
                  <Shield className="text-xl" />
                  <div className="text-left">
                    <p className="font-medium">Verify Batch</p>
                    <p className="text-xs opacity-90">Check authenticity and quality</p>
                  </div>
                </div>
              </Button>
              
              <Button 
                className="w-full bg-accent text-accent-foreground p-4 h-auto justify-start hover:bg-accent/90"
                onClick={() => handleQuickAction('generateReport')}
                data-testid="button-generate-report"
              >
                <div className="flex items-center space-x-3">
                  <BarChart3 className="text-xl" />
                  <div className="text-left">
                    <p className="font-medium">Generate Report</p>
                    <p className="text-xs opacity-90">Export transaction and quality data</p>
                  </div>
                </div>
              </Button>
              
              <Button 
                className="w-full bg-muted text-muted-foreground p-4 h-auto justify-start hover:bg-muted/80"
                onClick={() => handleQuickAction('inviteStakeholder')}
                data-testid="button-invite-stakeholder"
              >
                <div className="flex items-center space-x-3">
                  <UserPlus className="text-xl" />
                  <div className="text-left">
                    <p className="font-medium">Invite Stakeholder</p>
                    <p className="text-xs opacity-90">Add new supply chain partner</p>
                  </div>
                </div>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Consumer Lookup Section */}
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-border">
          <CardContent className="p-8 text-center">
            <div className="max-w-md mx-auto">
              <h3 className="text-xl font-semibold text-foreground mb-2">Consumer Product Lookup</h3>
              <p className="text-muted-foreground mb-6">Scan QR code or enter product ID to trace origin and journey</p>
              <div className="flex space-x-2">
                <Input 
                  type="text" 
                  placeholder="Enter Product ID (e.g., AGR-2024-001)" 
                  value={lookupQuery}
                  onChange={(e) => setLookupQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLookup()}
                  className="flex-1"
                  data-testid="input-consumer-lookup"
                />
                <Button onClick={handleLookup} data-testid="button-consumer-lookup">
                  <Search />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                <Shield className="inline w-3 h-3 mr-1" />
                All lookups are recorded on the blockchain for transparency
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
