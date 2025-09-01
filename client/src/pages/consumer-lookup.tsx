import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { 
  Leaf,
  Search,
  QrCode,
  MapPin,
  Calendar,
  Package,
  Shield,
  Truck,
  CheckCircle,
  AlertCircle,
  Store,
  FileCheck,
  ArrowRight
} from "lucide-react";
import { format } from "date-fns";
import SupplyChainVisualization from "@/components/supply-chain-visualization";

export default function ConsumerLookup() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const [lookupQuery, setLookupQuery] = useState(params.identifier || "");
  const [activeTab, setActiveTab] = useState("overview");

  const { data: productData, isLoading, error } = useQuery({
    queryKey: ["/api/lookup", lookupQuery],
    enabled: !!lookupQuery.trim(),
    retry: false,
  });

  const handleLookup = () => {
    if (lookupQuery.trim()) {
      setLocation(`/lookup/${encodeURIComponent(lookupQuery.trim())}`);
    }
  };

  const handleScanQR = () => {
    // Simulate QR scanning
    alert("Camera access would be requested here for QR code scanning. This feature requires device camera permissions.");
  };

  const getStageIcon = (stageType: string) => {
    switch (stageType) {
      case 'production':
        return <Leaf className="w-4 h-4" />;
      case 'inspection':
        return <Shield className="w-4 h-4" />;
      case 'transport':
        return <Truck className="w-4 h-4" />;
      case 'retail':
        return <Store className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const getVerificationIcon = (result: string) => {
    switch (result) {
      case 'passed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'conditional':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
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
              <span className="text-muted-foreground">- Product Lookup</span>
            </div>
            <Button
              variant="outline"
              onClick={() => setLocation("/")}
              data-testid="button-back-home"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <Card className="mb-8 bg-gradient-to-r from-green-50 to-blue-50">
          <CardContent className="p-8 text-center">
            <div className="max-w-2xl mx-auto">
              <h1 className="text-3xl font-bold text-foreground mb-4">
                Track Your Product Journey
              </h1>
              <p className="text-muted-foreground mb-6">
                Enter a product ID, batch number, or scan a QR code to trace the complete journey from farm to table
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <div className="flex space-x-2 flex-1">
                  <Input
                    type="text"
                    placeholder="Product ID or Batch Number"
                    value={lookupQuery}
                    onChange={(e) => setLookupQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleLookup()}
                    className="flex-1"
                    data-testid="input-product-lookup"
                  />
                  <Button onClick={handleLookup} data-testid="button-lookup">
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
                <Button 
                  variant="secondary" 
                  onClick={handleScanQR}
                  className="sm:w-auto"
                  data-testid="button-scan-qr-lookup"
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  Scan QR Code
                </Button>
              </div>
              
              <p className="text-xs text-muted-foreground mt-4">
                <Shield className="inline w-3 h-3 mr-1" />
                All product data is verified on the blockchain for authenticity
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        {isLoading && (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-8">
                <div className="animate-pulse space-y-4">
                  <div className="h-8 bg-muted rounded w-1/2" />
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-16 bg-muted rounded" />
                    <div className="h-16 bg-muted rounded" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {error && (
          <Card>
            <CardContent className="p-12 text-center">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
              <h2 className="text-2xl font-bold text-foreground mb-2">Product Not Found</h2>
              <p className="text-muted-foreground mb-4">
                The product ID or batch number you entered could not be found in our system.
              </p>
              <p className="text-sm text-muted-foreground">
                Please check the ID and try again, or scan the QR code directly from the product packaging.
              </p>
            </CardContent>
          </Card>
        )}

        {productData && (
          <div className="space-y-8">
            {/* Product Overview */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl text-foreground" data-testid="product-overview-name">
                      {productData.product.name}
                    </CardTitle>
                    <p className="text-muted-foreground" data-testid="product-overview-batch">
                      Batch Number: {productData.product.batchNumber}
                    </p>
                  </div>
                  <Badge className="bg-primary/10 text-primary" data-testid="product-overview-status">
                    {productData.product.status.replace('_', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center text-sm">
                      <Package className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span className="text-muted-foreground">Quantity:</span>
                      <span className="ml-2 font-medium" data-testid="product-overview-quantity">
                        {productData.product.quantity} {productData.product.unit}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span className="text-muted-foreground">Harvested:</span>
                      <span className="ml-2 font-medium" data-testid="product-overview-harvest-date">
                        {productData.product.harvestDate 
                          ? format(new Date(productData.product.harvestDate), 'MMM dd, yyyy')
                          : 'Not specified'
                        }
                      </span>
                    </div>
                    {productData.product.expiryDate && (
                      <div className="flex items-center text-sm">
                        <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                        <span className="text-muted-foreground">Expires:</span>
                        <span className="ml-2 font-medium" data-testid="product-overview-expiry-date">
                          {format(new Date(productData.product.expiryDate), 'MMM dd, yyyy')}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="md:col-span-2">
                    {productData.product.description && (
                      <div>
                        <Label className="text-sm font-medium">Description</Label>
                        <p className="text-foreground mt-1" data-testid="product-overview-description">
                          {productData.product.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs Navigation */}
            <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
              <Button
                variant={activeTab === "overview" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("overview")}
                data-testid="tab-overview"
              >
                Supply Chain
              </Button>
              <Button
                variant={activeTab === "verifications" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("verifications")}
                data-testid="tab-verifications"
              >
                Verifications
              </Button>
              <Button
                variant={activeTab === "transactions" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("transactions")}
                data-testid="tab-transactions"
              >
                Transaction History
              </Button>
            </div>

            {/* Tab Content */}
            {activeTab === "overview" && (
              <Card>
                <CardHeader>
                  <CardTitle>Supply Chain Journey</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Complete journey of this product through the supply chain
                  </p>
                </CardHeader>
                <CardContent>
                  {productData.supplyChain && productData.supplyChain.length > 0 ? (
                    <div className="space-y-6">
                      {productData.supplyChain.map((stage: any, index: number) => (
                        <div key={stage.id} className="flex items-start space-x-4">
                          <div className="flex flex-col items-center">
                            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white">
                              {getStageIcon(stage.stageType)}
                            </div>
                            {index < productData.supplyChain.length - 1 && (
                              <div className="w-px h-16 bg-border mt-2" />
                            )}
                          </div>
                          <div className="flex-1 pb-8">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-foreground" data-testid={`stage-name-${index}`}>
                                {stage.stageName}
                              </h4>
                              <Badge className="bg-green-100 text-green-800">
                                {stage.status}
                              </Badge>
                            </div>
                            <div className="space-y-1 text-sm text-muted-foreground">
                              {stage.location && (
                                <div className="flex items-center" data-testid={`stage-location-${index}`}>
                                  <MapPin className="w-3 h-3 mr-2" />
                                  {stage.location}
                                </div>
                              )}
                              <div className="flex items-center" data-testid={`stage-timestamp-${index}`}>
                                <Calendar className="w-3 h-3 mr-2" />
                                {stage.timestamp 
                                  ? format(new Date(stage.timestamp), 'MMM dd, yyyy - HH:mm')
                                  : 'Time not recorded'
                                }
                              </div>
                            </div>
                            {stage.notes && (
                              <p className="text-sm text-foreground mt-2" data-testid={`stage-notes-${index}`}>
                                {stage.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Truck className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">No supply chain data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === "verifications" && (
              <Card>
                <CardHeader>
                  <CardTitle>Quality & Safety Verifications</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Independent verification and certification records
                  </p>
                </CardHeader>
                <CardContent>
                  {productData.verifications && productData.verifications.length > 0 ? (
                    <div className="space-y-4">
                      {productData.verifications.map((verification: any) => (
                        <Card key={verification.id} className="border">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-3">
                                {getVerificationIcon(verification.result)}
                                <div>
                                  <h4 className="font-medium text-foreground capitalize" data-testid={`verification-type-${verification.id}`}>
                                    {verification.verificationType.replace('_', ' ')} Verification
                                  </h4>
                                  <p className="text-sm text-muted-foreground" data-testid={`verification-date-${verification.id}`}>
                                    Verified on {format(new Date(verification.createdAt), 'MMM dd, yyyy')}
                                  </p>
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
                              <Badge className={
                                verification.result === 'passed' ? 'bg-green-100 text-green-800' :
                                verification.result === 'failed' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              } data-testid={`verification-result-${verification.id}`}>
                                {verification.result}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">No verification records available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === "transactions" && (
              <Card>
                <CardHeader>
                  <CardTitle>Transaction History</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Verified blockchain transactions for this product
                  </p>
                </CardHeader>
                <CardContent>
                  {productData.transactions && productData.transactions.length > 0 ? (
                    <div className="space-y-4">
                      {productData.transactions.map((transaction: any, index: number) => (
                        <Card key={transaction.id} className="border">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                  <ArrowRight className="w-4 h-4 text-primary" />
                                </div>
                                <div>
                                  <h4 className="font-medium text-foreground" data-testid={`transaction-type-${index}`}>
                                    {transaction.transactionType.replace('_', ' ')} Transaction
                                  </h4>
                                  <p className="text-sm text-muted-foreground" data-testid={`transaction-date-${index}`}>
                                    {format(new Date(transaction.createdAt), 'MMM dd, yyyy - HH:mm')}
                                  </p>
                                  <p className="text-xs font-mono text-muted-foreground" data-testid={`transaction-id-${index}`}>
                                    ID: {transaction.id.slice(0, 8)}...
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <Badge className="bg-green-100 text-green-800 mb-1" data-testid={`transaction-status-${index}`}>
                                  {transaction.status}
                                </Badge>
                                {transaction.quantity && (
                                  <p className="text-sm text-muted-foreground" data-testid={`transaction-quantity-${index}`}>
                                    {transaction.quantity} units
                                  </p>
                                )}
                                {transaction.price && (
                                  <p className="text-sm font-medium text-foreground" data-testid={`transaction-price-${index}`}>
                                    ${parseFloat(transaction.price).toFixed(2)}
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
                      <FileCheck className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">No transaction records available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Transparency Statement */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-6 text-center">
                <Shield className="w-8 h-8 mx-auto mb-3 text-primary" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Verified Transparency
                </h3>
                <p className="text-sm text-muted-foreground">
                  This product's entire journey has been recorded and verified on our blockchain-based 
                  transparency platform. All data shown is authentic and has been validated by certified inspectors.
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {!lookupQuery.trim() && !isLoading && !error && (
          <div className="text-center py-16">
            <QrCode className="w-24 h-24 mx-auto mb-6 text-muted-foreground" />
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Discover Your Product's Journey
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Enter a product ID or batch number above to see the complete supply chain journey, 
              quality verifications, and transaction history.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Leaf className="text-primary" />
              <span className="font-bold text-foreground">AgriTrace</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Ensuring transparency and trust in agricultural supply chains
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
