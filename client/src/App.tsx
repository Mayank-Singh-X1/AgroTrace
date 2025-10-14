import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import FarmerDashboard from "@/pages/farmer-dashboard";
import DistributorDashboard from "@/pages/distributor-dashboard";
import RetailerDashboard from "@/pages/retailer-dashboard";
import ProductTracking from "@/pages/product-tracking";
import Verification from "@/pages/verification";
import ConsumerLookup from "@/pages/consumer-lookup";
import { BlockchainProvider } from "@/context/BlockchainContext";

function Router() {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Determine which dashboard to show based on user role
  const getDashboardComponent = () => {
    if (!user) return Dashboard;
    switch (user.role?.toLowerCase()) {
      case 'farmer':
        return FarmerDashboard;
      case 'distributor':
        return DistributorDashboard;
      case 'retailer':
        return RetailerDashboard;
      case 'consumer':
        return ConsumerLookup; // Consumers get the lookup page as their main dashboard
      default:
        return Dashboard; // Fallback to general dashboard
    }
  };

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/lookup" component={ConsumerLookup} />
          <Route path="/lookup/:identifier" component={ConsumerLookup} />
        </>
      ) : (
        <>
          <Route path="/" component={getDashboardComponent()} />
          <Route path="/products" component={ProductTracking} />
          <Route path="/verify" component={Verification} />
          <Route path="/lookup" component={ConsumerLookup} />
          <Route path="/lookup/:identifier" component={ConsumerLookup} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BlockchainProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </BlockchainProvider>
    </QueryClientProvider>
  );
}

export default App;
