import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Navigation from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Plus,
  Package,
  Calendar,
  MapPin,
  Truck,
  Eye
} from "lucide-react";
import { format } from "date-fns";
import SupplyChainVisualization from "@/components/supply-chain-visualization";

export default function ProductTracking() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isAddStageOpen, setIsAddStageOpen] = useState(false);

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

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["/api/products"],
    retry: false,
  });

  const createProductMutation = useMutation({
    mutationFn: async (productData: any) => {
      await apiRequest("POST", "/api/products", productData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setIsAddProductOpen(false);
      toast({
        title: "Product Created",
        description: "Product has been successfully created and registered",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to create product. Please try again.",
        variant: "destructive",
      });
    },
  });

  const addStageMutation = useMutation({
    mutationFn: async (stageData: any) => {
      await apiRequest("POST", `/api/products/${selectedProduct}/supply-chain`, stageData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products", selectedProduct, "supply-chain"] });
      setIsAddStageOpen(false);
      toast({
        title: "Stage Added",
        description: "Supply chain stage has been successfully added",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to add supply chain stage. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCreateProduct = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const productData = {
      name: formData.get("name"),
      description: formData.get("description"),
      productType: formData.get("productType"),
      batchNumber: formData.get("batchNumber"),
      quantity: parseFloat(formData.get("quantity") as string),
      unit: formData.get("unit"),
      harvestDate: formData.get("harvestDate") ? new Date(formData.get("harvestDate") as string) : null,
      expiryDate: formData.get("expiryDate") ? new Date(formData.get("expiryDate") as string) : null,
    };

    createProductMutation.mutate(productData);
  };

  const handleAddStage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const stageData = {
      stageName: formData.get("stageName"),
      stageType: formData.get("stageType"),
      location: formData.get("location"),
      notes: formData.get("notes"),
      status: "completed",
    };

    addStageMutation.mutate(stageData);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'created':
        return 'bg-gray-100 text-gray-800';
      case 'in_production':
        return 'bg-yellow-100 text-yellow-800';
      case 'quality_check':
        return 'bg-blue-100 text-blue-800';
      case 'in_transit':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'sold':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-card rounded w-64" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-card rounded-lg p-6 border border-border h-48" />
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Product Tracking</h1>
            <p className="text-muted-foreground">Manage and track your agricultural products</p>
          </div>
          
          {user.role === 'farmer' && (
            <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-new-product">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add New Product</DialogTitle>
                  <DialogDescription>
                    Register a new product batch for tracking through the supply chain.
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleCreateProduct} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Product Name</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="e.g., Organic Tomatoes"
                        required
                        data-testid="input-product-name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="productType">Product Type</Label>
                      <Select name="productType" required>
                        <SelectTrigger data-testid="select-product-type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="vegetables">Vegetables</SelectItem>
                          <SelectItem value="fruits">Fruits</SelectItem>
                          <SelectItem value="grains">Grains</SelectItem>
                          <SelectItem value="dairy">Dairy</SelectItem>
                          <SelectItem value="meat">Meat</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="batchNumber">Batch Number</Label>
                      <Input
                        id="batchNumber"
                        name="batchNumber"
                        placeholder="e.g., BATCH-2024-001"
                        required
                        data-testid="input-batch-number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="quantity">Quantity</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="quantity"
                          name="quantity"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          required
                          data-testid="input-quantity"
                        />
                        <Select name="unit" required>
                          <SelectTrigger className="w-24" data-testid="select-unit">
                            <SelectValue placeholder="Unit" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="kg">kg</SelectItem>
                            <SelectItem value="lbs">lbs</SelectItem>
                            <SelectItem value="tons">tons</SelectItem>
                            <SelectItem value="pieces">pieces</SelectItem>
                            <SelectItem value="boxes">boxes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Product description, farming methods, etc."
                      data-testid="input-description"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="harvestDate">Harvest Date</Label>
                      <Input
                        id="harvestDate"
                        name="harvestDate"
                        type="date"
                        data-testid="input-harvest-date"
                      />
                    </div>
                    <div>
                      <Label htmlFor="expiryDate">Expiry Date</Label>
                      <Input
                        id="expiryDate"
                        name="expiryDate"
                        type="date"
                        data-testid="input-expiry-date"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddProductOpen(false)}
                      data-testid="button-cancel-product"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createProductMutation.isPending}
                      data-testid="button-create-product"
                    >
                      {createProductMutation.isPending ? "Creating..." : "Create Product"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {productsLoading ? (
            [...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                    <div className="h-3 bg-muted rounded w-2/3" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : products && products.length > 0 ? (
            products.map((product: any) => (
              <Card 
                key={product.id} 
                className={`cursor-pointer transition-colors ${
                  selectedProduct === product.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedProduct(product.id)}
                data-testid={`product-card-${product.id}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Batch: {product.batchNumber}
                      </p>
                    </div>
                    <Badge className={getStatusColor(product.status)}>
                      {product.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Package className="w-4 h-4 mr-2" />
                      {product.quantity} {product.unit}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 mr-2" />
                      {product.harvestDate 
                        ? format(new Date(product.harvestDate), 'MMM dd, yyyy')
                        : 'Harvest date not set'
                      }
                    </div>
                    {product.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {product.description}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full">
              <Card>
                <CardContent className="p-12 text-center">
                  <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No Products Found</h3>
                  <p className="text-muted-foreground mb-4">
                    {user.role === 'farmer' 
                      ? "You haven't created any products yet. Create your first product to start tracking."
                      : "No products are available to view."
                    }
                  </p>
                  {user.role === 'farmer' && (
                    <Button onClick={() => setIsAddProductOpen(true)} data-testid="button-create-first-product">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Product
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Selected Product Details */}
        {selectedProduct && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Supply Chain Journey</CardTitle>
                  {(user.role === 'distributor' || user.role === 'retailer' || user.role === 'inspector') && (
                    <Dialog open={isAddStageOpen} onOpenChange={setIsAddStageOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" data-testid="button-add-stage">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Stage
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Supply Chain Stage</DialogTitle>
                          <DialogDescription>
                            Record a new stage in the product's supply chain journey.
                          </DialogDescription>
                        </DialogHeader>
                        
                        <form onSubmit={handleAddStage} className="space-y-4">
                          <div>
                            <Label htmlFor="stageName">Stage Name</Label>
                            <Input
                              id="stageName"
                              name="stageName"
                              placeholder="e.g., Quality Inspection"
                              required
                              data-testid="input-stage-name"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="stageType">Stage Type</Label>
                            <Select name="stageType" required>
                              <SelectTrigger data-testid="select-stage-type">
                                <SelectValue placeholder="Select stage type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="production">Production</SelectItem>
                                <SelectItem value="inspection">Inspection</SelectItem>
                                <SelectItem value="transport">Transport</SelectItem>
                                <SelectItem value="storage">Storage</SelectItem>
                                <SelectItem value="retail">Retail</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label htmlFor="location">Location</Label>
                            <Input
                              id="location"
                              name="location"
                              placeholder="e.g., Distribution Center, NYC"
                              data-testid="input-stage-location"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                              id="notes"
                              name="notes"
                              placeholder="Additional details about this stage..."
                              data-testid="input-stage-notes"
                            />
                          </div>
                          
                          <div className="flex justify-end space-x-2 pt-4">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setIsAddStageOpen(false)}
                              data-testid="button-cancel-stage"
                            >
                              Cancel
                            </Button>
                            <Button
                              type="submit"
                              disabled={addStageMutation.isPending}
                              data-testid="button-add-stage-submit"
                            >
                              {addStageMutation.isPending ? "Adding..." : "Add Stage"}
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Track the product through each stage of the supply chain
                </p>
              </CardHeader>
              <CardContent>
                <SupplyChainVisualization productId={selectedProduct} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Product Information</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Detailed information about the selected product
                </p>
              </CardHeader>
              <CardContent>
                {(() => {
                  const product = products?.find((p: any) => p.id === selectedProduct);
                  if (!product) return <p>Product not found</p>;
                  
                  return (
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Product Name</Label>
                        <p className="text-foreground" data-testid="selected-product-name">{product.name}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Batch Number</Label>
                        <p className="text-foreground font-mono" data-testid="selected-product-batch">{product.batchNumber}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Status</Label>
                        <div className="mt-1">
                          <Badge className={getStatusColor(product.status)} data-testid="selected-product-status">
                            {product.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Quantity</Label>
                        <p className="text-foreground" data-testid="selected-product-quantity">
                          {product.quantity} {product.unit}
                        </p>
                      </div>
                      {product.description && (
                        <div>
                          <Label className="text-sm font-medium">Description</Label>
                          <p className="text-foreground" data-testid="selected-product-description">{product.description}</p>
                        </div>
                      )}
                      {product.harvestDate && (
                        <div>
                          <Label className="text-sm font-medium">Harvest Date</Label>
                          <p className="text-foreground" data-testid="selected-product-harvest-date">
                            {format(new Date(product.harvestDate), 'MMMM dd, yyyy')}
                          </p>
                        </div>
                      )}
                      {product.expiryDate && (
                        <div>
                          <Label className="text-sm font-medium">Expiry Date</Label>
                          <p className="text-foreground" data-testid="selected-product-expiry-date">
                            {format(new Date(product.expiryDate), 'MMMM dd, yyyy')}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
