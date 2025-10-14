import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import QRCodeGenerator from "@/components/qr-code-generator";
import { 
  Sprout, 
  Package, 
  TrendingUp, 
  DollarSign, 
  Plus, 
  Calendar,
  MapPin,
  Thermometer
} from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

export default function FarmerDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: farmerStats } = useQuery({
    queryKey: ["/api/farmer/stats"],
    retry: false,
  });

  const { data: myProducts } = useQuery({
    queryKey: ["/api/farmer/products"],
    retry: false,
  });

  const { data: weatherData } = useQuery({
    queryKey: ["/api/farmer/weather"],
    retry: false,
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {user?.firstName || 'Farmer'}!
          </h1>
          <p className="text-muted-foreground">
            Manage your crops, track harvests, and monitor your farm's performance
          </p>
        </div>

        {/* Farm Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Crops</p>
                  <p className="text-3xl font-bold text-foreground">
                    {farmerStats?.activeCrops || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Sprout className="text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Products Registered</p>
                  <p className="text-3xl font-bold text-foreground">
                    {farmerStats?.totalProducts || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Package className="text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
                  <p className="text-3xl font-bold text-foreground">
                    ${farmerStats?.monthlyRevenue?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Growth Rate</p>
                  <p className="text-3xl font-bold text-foreground">
                    +{farmerStats?.growthRate || 0}%
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Product Registration & QR Code */}
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Product Registration</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Register new batches and generate tracking codes
                    </p>
                  </div>
                  <Button 
                    onClick={() => setLocation('/products')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <QRCodeGenerator product={myProducts?.[0]} />
              </CardContent>
            </Card>

            {/* My Recent Products */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Products</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Your recently registered products and their status
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {myProducts?.slice(0, 5).map((product: any) => (
                    <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <Package className="text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Batch: {product.batchNumber}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                          {product.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(product.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-8 text-muted-foreground">
                      <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No products registered yet</p>
                      <Button 
                        onClick={() => setLocation('/products')}
                        className="mt-4"
                        variant="outline"
                      >
                        Register Your First Product
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Farm Information & Weather */}
          <div className="space-y-6">
            {/* Weather Widget */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Thermometer className="w-5 h-5" />
                  <span>Weather Today</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-foreground mb-2">
                    {weatherData?.temperature || '--'}°C
                  </div>
                  <p className="text-muted-foreground mb-4">
                    {weatherData?.condition || 'Loading...'}
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Humidity</p>
                      <p className="font-medium">{weatherData?.humidity || '--'}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Rainfall</p>
                      <p className="font-medium">{weatherData?.rainfall || '--'}mm</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Farm Location */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5" />
                  <span>Farm Location</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium">
                    {user?.farmName || 'Your Farm'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {user?.location || 'Location not set'}
                  </p>
                  <Button variant="outline" size="sm" className="w-full mt-4">
                    Update Location
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Farmer Tools</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setLocation('/products')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Register New Batch
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setLocation('/verify')}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Harvest
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View Analytics
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}