import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import TransactionHistory from "@/components/transaction-history";
import { 
  ShoppingCart, 
  Users, 
  DollarSign, 
  Star, 
  TrendingUp, 
  Package,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

export default function RetailerDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: retailerStats } = useQuery({
    queryKey: ["/api/retailer/stats"],
    retry: false,
  });

  const { data: recentSales } = useQuery({
    queryKey: ["/api/retailer/sales"],
    retry: false,
  });

  const { data: inventory } = useQuery({
    queryKey: ["/api/retailer/inventory"],
    retry: false,
  });

  const { data: customerFeedback } = useQuery({
    queryKey: ["/api/retailer/feedback"],
    retry: false,
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Retail Store - {user?.firstName || 'Retailer'}
          </h1>
          <p className="text-muted-foreground">
            Manage inventory, track sales, and provide transparency to customers
          </p>
        </div>

        {/* Retail Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Daily Sales</p>
                  <p className="text-3xl font-bold text-foreground">
                    ${retailerStats?.dailySales?.toLocaleString() || 0}
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
                  <p className="text-sm font-medium text-muted-foreground">Products Sold</p>
                  <p className="text-3xl font-bold text-foreground">
                    {retailerStats?.productsSold || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Customer Satisfaction</p>
                  <p className="text-3xl font-bold text-foreground">
                    {retailerStats?.customerSatisfaction || 0}★
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Star className="text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Customers</p>
                  <p className="text-3xl font-bold text-foreground">
                    {retailerStats?.activeCustomers || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Sales & Transactions */}
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Recent Sales</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Track product sales and customer purchases
                    </p>
                  </div>
                  <Button 
                    onClick={() => setLocation('/products')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    New Sale
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentSales?.slice(0, 5).map((sale: any) => (
                    <div key={sale.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <ShoppingCart className="text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">{sale.productName}</p>
                          <p className="text-sm text-muted-foreground">
                            Customer: {sale.customerName} • Qty: {sale.quantity}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">${sale.amount}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(sale.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-8 text-muted-foreground">
                      <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No sales recorded today</p>
                      <Button 
                        onClick={() => setLocation('/products')}
                        className="mt-4"
                        variant="outline"
                      >
                        Record First Sale
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Transaction History */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Transactions</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Blockchain verified purchase records
                </p>
              </CardHeader>
              <CardContent>
                <TransactionHistory limit={5} />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Inventory & Feedback */}
          <div className="space-y-6">
            {/* Inventory Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="w-5 h-5" />
                  <span>Inventory Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {inventory?.slice(0, 5).map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Batch: {item.batchNumber}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{item.quantity} units</p>
                        <Badge 
                          variant={item.quantity > 10 ? 'default' : 
                                  item.quantity > 0 ? 'secondary' : 'destructive'}
                          className="text-xs"
                        >
                          {item.quantity > 10 ? 'In Stock' : 
                           item.quantity > 0 ? 'Low Stock' : 'Out of Stock'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="w-full">
                    Manage Inventory
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Customer Feedback */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="w-5 h-5" />
                  <span>Customer Feedback</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {customerFeedback?.slice(0, 3).map((feedback: any) => (
                    <div key={feedback.id} className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="flex">
                          {[...Array(feedback.rating)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {feedback.customerName}
                        </span>
                      </div>
                      <p className="text-sm text-foreground">{feedback.comment}</p>
                    </div>
                  )) || (
                    <div className="text-center py-4 text-muted-foreground">
                      <Star className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No feedback yet</p>
                    </div>
                  )}
                  <Button variant="outline" size="sm" className="w-full">
                    View All Reviews
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quality Alerts */}
            <Card className="border-orange-200 bg-orange-50/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-orange-800">
                  <AlertCircle className="w-5 h-5" />
                  <span>Quality Alerts</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <p className="font-medium text-orange-800 text-sm">Expiry Warning</p>
                    <p className="text-xs text-orange-600">
                      3 products expire within 2 days
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <p className="font-medium text-green-800 text-sm">Quality Certified</p>
                    <p className="text-xs text-green-600">
                      15 products verified today
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    Quality Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Retail Tools */}
            <Card>
              <CardHeader>
                <CardTitle>Retail Tools</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setLocation('/products')}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  POS System
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setLocation('/verify')}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Verify Product
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Sales Report
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Customer Analytics
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}