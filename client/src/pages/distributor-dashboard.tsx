import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SupplyChainVisualization from "@/components/supply-chain-visualization";
import { 
  Truck, 
  Package, 
  MapPin, 
  Clock, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Route
} from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

export default function DistributorDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: distributorStats } = useQuery({
    queryKey: ["/api/distributor/stats"],
    retry: false,
  });

  const { data: activeShipments } = useQuery({
    queryKey: ["/api/distributor/shipments"],
    retry: false,
  });

  const { data: inventory } = useQuery({
    queryKey: ["/api/distributor/inventory"],
    retry: false,
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Distribution Hub - {user?.firstName || 'Distributor'}
          </h1>
          <p className="text-muted-foreground">
            Manage logistics, track shipments, and coordinate supply chain operations
          </p>
        </div>

        {/* Distribution Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Shipments</p>
                  <p className="text-3xl font-bold text-foreground">
                    {distributorStats?.activeShipments || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Truck className="text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Inventory Items</p>
                  <p className="text-3xl font-bold text-foreground">
                    {distributorStats?.inventoryCount || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Package className="text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">On-Time Delivery</p>
                  <p className="text-3xl font-bold text-foreground">
                    {distributorStats?.onTimeRate || 0}%
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Routes Active</p>
                  <p className="text-3xl font-bold text-foreground">
                    {distributorStats?.activeRoutes || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Route className="text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Shipment Management */}
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Active Shipments</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Monitor current deliveries and logistics
                    </p>
                  </div>
                  <Button 
                    onClick={() => setLocation('/products')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Truck className="w-4 h-4 mr-2" />
                    New Shipment
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeShipments?.slice(0, 5).map((shipment: any) => (
                    <div key={shipment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Truck className="text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">#{shipment.id} - {shipment.destination}</p>
                          <p className="text-sm text-muted-foreground">
                            {shipment.productCount} items • Driver: {shipment.driver}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={shipment.status === 'in-transit' ? 'default' : 
                                      shipment.status === 'delivered' ? 'outline' : 'destructive'}>
                          {shipment.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          ETA: {new Date(shipment.eta).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-8 text-muted-foreground">
                      <Truck className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No active shipments</p>
                      <Button 
                        onClick={() => setLocation('/products')}
                        className="mt-4"
                        variant="outline"
                      >
                        Create New Shipment
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Supply Chain Visualization */}
            <Card>
              <CardHeader>
                <CardTitle>Supply Chain Network</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Visualize product flow through your distribution network
                </p>
              </CardHeader>
              <CardContent>
                <SupplyChainVisualization productId={activeShipments?.[0]?.productId} />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Alerts & Inventory */}
          <div className="space-y-6">
            {/* Critical Alerts */}
            <Card className="border-red-200 bg-red-50/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-red-800">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Critical Alerts</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-red-100 rounded-lg">
                    <p className="font-medium text-red-800 text-sm">Temperature Alert</p>
                    <p className="text-xs text-red-600">
                      Shipment #1247 - Cold chain breach detected
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <p className="font-medium text-yellow-800 text-sm">Delayed Delivery</p>
                    <p className="text-xs text-yellow-600">
                      Route #456 running 2 hours behind schedule
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    View All Alerts
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Inventory Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="w-5 h-5" />
                  <span>Inventory Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {inventory?.slice(0, 4).map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.location}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{item.quantity}</p>
                        <Badge 
                          variant={item.status === 'in-stock' ? 'default' : 
                                  item.status === 'low' ? 'destructive' : 'secondary'}
                          className="text-xs"
                        >
                          {item.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="w-full">
                    Full Inventory
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Distribution Tools */}
            <Card>
              <CardHeader>
                <CardTitle>Distribution Tools</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setLocation('/products')}
                >
                  <Truck className="w-4 h-4 mr-2" />
                  Plan Route
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setLocation('/verify')}
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Track Location
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Schedule Pickup
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Analytics Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}