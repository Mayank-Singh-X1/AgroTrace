import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import ProductTracking from "@/pages/product-tracking";
import Verification from "@/pages/verification";
import ConsumerLookup from "@/pages/consumer-lookup";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

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
          <Route path="/" component={Dashboard} />
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
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
