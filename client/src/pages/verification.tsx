import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Navigation from "@/components/navigation";
import { useBlockchain } from "@/context/BlockchainContext";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  FileCheck,
  Search,
  Package
} from "lucide-react";
import { format } from "date-fns";

export default function Verification() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { isConnected, verifyProduct } = useBlockchain();
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [isCreateVerificationOpen, setIsCreateVerificationOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [blockchainVerifying, setBlockchainVerifying] = useState(false);

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

  // Check if user is inspector
  useEffect(() => {
    if (!isLoading && isAuthenticated && user?.role !== 'inspector') {
      toast({
        title: "Access Denied",
        description: "Only inspectors can access the verification page.",
        variant: "destructive",
      });
    }
  }, [user, isLoading, isAuthenticated, toast]);

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["/api/products"],
    retry: false,
  });

  const { data: verifications, isLoading: verificationsLoading } = useQuery({
    queryKey: ["/api/products", selectedProduct, "verifications"],
    enabled: !!selectedProduct,
    retry: false,
  });

  const createVerificationMutation = useMutation({
    mutationFn: async (verificationData: any) => {
      // First save to database
      const response = await apiRequest("POST", `/api/products/${selectedProduct}/verifications`, verificationData);
      
      // Then record on blockchain if connected
      if (isConnected && selectedProduct) {
        setBlockchainVerifying(true);
        try {
          // Record verification on blockchain
          await verifyProduct(selectedProduct, `${verificationData.verificationType}: ${verificationData.result}`);
          
          // Update the verification in database with blockchain hash
          await apiRequest("PATCH", `/api/products/${selectedProduct}/verifications/${response.id}`, {
            blockchainVerified: true
          });
        } catch (error) {
          console.error("Error recording verification on blockchain:", error);
          toast({
            title: "Blockchain Warning",
            description: "Verification saved to database but failed to record on blockchain.",
            variant: "destructive",
          });
        } finally {
          setBlockchainVerifying(false);
        }
      }
      
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products", selectedProduct, "verifications"] });
      setIsCreateVerificationOpen(false);
      toast({
        title: "Verification Created",
        description: "Product verification has been successfully recorded",
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
        description: "Failed to create verification. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCreateVerification = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const verificationData = {
      verificationType: formData.get("verificationType"),
      result: formData.get("result"),
      certificateUrl: formData.get("certificateUrl") || null,
      notes: formData.get("notes"),
      validUntil: formData.get("validUntil") ? new Date(formData.get("validUntil") as string) : null,
    };

    createVerificationMutation.mutate(verificationData);
  };

  const getResultIcon = (result: string) => {
    switch (result) {
      case 'passed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'conditional':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getResultBadge = (result: string) => {
    switch (result) {
      case 'passed':
        return <Badge className="bg-green-100 text-green-800">Passed</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      case 'conditional':
        return <Badge className="bg-yellow-100 text-yellow-800">Conditional</Badge>;
      default:
        return <Badge variant="secondary">{result}</Badge>;
    }
  };

  const filteredProducts = products?.filter((product: any) => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.batchNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-card rounded w-64" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-card rounded-lg p-6 border border-border h-96" />
              <div className="bg-card rounded-lg p-6 border border-border h-96" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  if (user.role !== 'inspector') {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-12 text-center">
              <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold text-foreground mb-2">Access Restricted</h2>
              <p className="text-muted-foreground mb-4">
                Only certified inspectors can access the verification portal.
              </p>
              <p className="text-sm text-muted-foreground">
                Your current role: <Badge variant="secondary">{user.role}</Badge>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Product Verification</h1>
            <p className="text-muted-foreground">Verify product quality, authenticity, and compliance</p>
          </div>
          
          {selectedProduct && (
            <Dialog open={isCreateVerificationOpen} onOpenChange={setIsCreateVerificationOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-create-verification">
                  <Shield className="w-4 h-4 mr-2" />
                  Create Verification
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create Product Verification</DialogTitle>
                  <DialogDescription>
                    Record verification results for the selected product batch.
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleCreateVerification} className="space-y-4">
                  <div>
                    <Label htmlFor="verificationType">Verification Type</Label>
                    <Select name="verificationType" required>
                      <SelectTrigger data-testid="select-verification-type">
                        <SelectValue placeholder="Select verification type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="quality">Quality Inspection</SelectItem>
                        <SelectItem value="organic">Organic Certification</SelectItem>
                        <SelectItem value="safety">Food Safety</SelectItem>
                        <SelectItem value="origin">Origin Verification</SelectItem>
                        <SelectItem value="pesticide">Pesticide Testing</SelectItem>
                        <SelectItem value="nutrition">Nutritional Analysis</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="result">Verification Result</Label>
                    <Select name="result" required>
                      <SelectTrigger data-testid="select-verification-result">
                        <SelectValue placeholder="Select result" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="passed">Passed</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                        <SelectItem value="conditional">Conditional Pass</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="certificateUrl">Certificate URL (Optional)</Label>
                    <Input
                      id="certificateUrl"
                      name="certificateUrl"
                      type="url"
                      placeholder="https://example.com/certificate.pdf"
                      data-testid="input-certificate-url"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="validUntil">Valid Until</Label>
                    <Input
                      id="validUntil"
                      name="validUntil"
                      type="date"
                      data-testid="input-valid-until"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="notes">Verification Notes</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      placeholder="Detailed verification findings, test results, observations..."
                      rows={4}
                      data-testid="input-verification-notes"
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateVerificationOpen(false)}
                      data-testid="button-cancel-verification"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createVerificationMutation.isPending}
                      data-testid="button-submit-verification"
                    >
                      {createVerificationMutation.isPending ? "Creating..." : "Create Verification"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Products List */}
          <Card>
            <CardHeader>
              <CardTitle>Products for Verification</CardTitle>
              <p className="text-sm text-muted-foreground">
                Select a product to view and create verification records
              </p>
              <div className="flex items-center space-x-2 mt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search products or batch numbers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-products"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {productsLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-16 bg-muted rounded-lg" />
                    </div>
                  ))}
                </div>
              ) : filteredProducts && filteredProducts.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredProducts.map((product: any) => (
                    <Card 
                      key={product.id}
                      className={`cursor-pointer transition-colors ${
                        selectedProduct === product.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedProduct(product.id)}
                      data-testid={`verification-product-${product.id}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-foreground">{product.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              Batch: {product.batchNumber}
                            </p>
                            <div className="flex items-center mt-1 text-xs text-muted-foreground">
                              <Package className="w-3 h-3 mr-1" />
                              {product.quantity} {product.unit}
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={`mb-2 ${
                              product.status === 'quality_check' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {product.status.replace('_', ' ')}
                            </Badge>
                            {product.harvestDate && (
                              <p className="text-xs text-muted-foreground">
                                <Calendar className="w-3 h-3 inline mr-1" />
                                {format(new Date(product.harvestDate), 'MMM dd, yyyy')}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    {searchQuery ? "No products found matching your search" : "No products available for verification"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Verification Details */}
          <Card>
            <CardHeader>
              <CardTitle>Verification Records</CardTitle>
              <p className="text-sm text-muted-foreground">
                {selectedProduct 
                  ? "View and manage verification records for the selected product"
                  : "Select a product to view verification records"
                }
              </p>
            </CardHeader>
            <CardContent>
              {!selectedProduct ? (
                <div className="text-center py-12">
                  <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Select a product to view verifications</p>
                </div>
              ) : verificationsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-20 bg-muted rounded-lg" />
                    </div>
                  ))}
                </div>
              ) : verifications && verifications.length > 0 ? (
                <div className="space-y-4">
                  {verifications.map((verification: any) => (
                    <Card key={verification.id} className="border">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            {getResultIcon(verification.result)}
                            <div>
                              <h4 className="font-medium text-foreground capitalize" data-testid={`verification-type-${verification.id}`}>
                                {verification.verificationType.replace('_', ' ')} Verification
                              </h4>
                              <div className="flex flex-col gap-1">
                                <p className="text-sm text-muted-foreground" data-testid={`verification-date-${verification.id}`}>
                                  Verified on {format(new Date(verification.createdAt), 'MMM dd, yyyy')}
                                </p>
                                {verification.blockchainVerified ? (
                                  <div className="flex items-center">
                                    <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                                      <CheckCircle className="h-3 w-3" />
                                      Blockchain Verified
                                    </Badge>
                                  </div>
                                ) : isConnected ? (
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-6 px-2 text-xs w-fit"
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      setBlockchainVerifying(true);
                                      try {
                                        // Record verification on blockchain
                                        await verifyProduct(
                                          selectedProduct!,
                                          `${verification.verificationType}: ${verification.result}`
                                        );
                                        
                                        // Update the verification in database with blockchain hash
                                        await apiRequest("PATCH", `/api/products/${selectedProduct}/verifications/${verification.id}`, {
                                          blockchainVerified: true
                                        });
                                        
                                        // Refresh verifications
                                        queryClient.invalidateQueries({ queryKey: ["/api/products", selectedProduct, "verifications"] });
                                        
                                        toast({
                                          title: "Success",
                                          description: "Verification recorded on blockchain",
                                        });
                                      } catch (error) {
                                        console.error("Error recording verification on blockchain:", error);
                                        toast({
                                          title: "Blockchain Error",
                                          description: "Failed to record verification on blockchain",
                                          variant: "destructive",
                                        });
                                      } finally {
                                        setBlockchainVerifying(false);
                                      }
                                    }}
                                    disabled={blockchainVerifying}
                                  >
                                    {blockchainVerifying ? "Recording..." : "Record on Blockchain"}
                                  </Button>
                                ) : null}
                              </div>
                              {verification.validUntil && (
                                <p className="text-xs text-muted-foreground" data-testid={`verification-valid-until-${verification.id}`}>
                                  Valid until {format(new Date(verification.validUntil), 'MMM dd, yyyy')}
                                </p>
                              )}
                              {verification.notes && (
                                <p className="text-sm text-foreground mt-2" data-testid={`verification-notes-${verification.id}`}>
                                  {verification.notes}
                                </p>
                              )}
                              {verification.certificateUrl && (
                                <a 
                                  href={verification.certificateUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs text-primary hover:underline mt-1 inline-flex items-center"
                                  data-testid={`verification-certificate-${verification.id}`}
                                >
                                  <FileCheck className="w-3 h-3 mr-1" />
                                  View Certificate
                                </a>
                              )}
                            </div>
                          </div>
                          <div data-testid={`verification-result-${verification.id}`}>
                            {getResultBadge(verification.result)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileCheck className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No Verifications Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    This product hasn't been verified yet. Create the first verification record.
                  </p>
                  <Button 
                    onClick={() => setIsCreateVerificationOpen(true)}
                    data-testid="button-create-first-verification"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Create First Verification
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Verification Statistics */}
        {selectedProduct && verifications && verifications.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Verification Summary</CardTitle>
              <p className="text-sm text-muted-foreground">
                Overview of all verification results for this product
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600" data-testid="verification-passed-count">
                    {verifications.filter((v: any) => v.result === 'passed').length}
                  </div>
                  <p className="text-sm text-muted-foreground">Passed</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600" data-testid="verification-conditional-count">
                    {verifications.filter((v: any) => v.result === 'conditional').length}
                  </div>
                  <p className="text-sm text-muted-foreground">Conditional</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600" data-testid="verification-failed-count">
                    {verifications.filter((v: any) => v.result === 'failed').length}
                  </div>
                  <p className="text-sm text-muted-foreground">Failed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
