import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { QrCode, Camera } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface QRCodeGeneratorProps {
  product?: {
    id: string;
    name: string;
    batchNumber: string;
  };
}

export default function QRCodeGenerator({ product }: QRCodeGeneratorProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateQR = async () => {
    if (!product) {
      toast({
        title: "No Product Selected",
        description: "Please select a product to generate QR code",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    // Simulate QR generation
    setTimeout(() => {
      setIsGenerating(false);
      toast({
        title: "QR Code Generated",
        description: `QR code generated for ${product.name}`,
      });
    }, 1000);
  };

  const handleScanQR = () => {
    toast({
      title: "QR Scanner",
      description: "Camera access required for QR scanning. This feature will be implemented with device camera access.",
    });
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <Card className="w-48 h-48 qr-code-pattern border-2 border-border rounded-lg p-4 flex items-center justify-center">
        {product ? (
          <div className="text-center">
            <QrCode className="w-24 h-24 mx-auto mb-2 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">QR Code for {product.name}</p>
          </div>
        ) : (
          <div className="text-center">
            <QrCode className="w-16 h-16 mx-auto mb-2 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">No product selected</p>
          </div>
        )}
      </Card>
      
      {product && (
        <div className="text-center">
          <p className="text-sm font-medium text-foreground" data-testid="product-id">
            Product ID: {product.batchNumber}
          </p>
          <p className="text-xs text-muted-foreground" data-testid="product-name">
            {product.name}
          </p>
        </div>
      )}
      
      <div className="flex space-x-2 w-full">
        <Button 
          className="flex-1" 
          onClick={handleGenerateQR}
          disabled={isGenerating || !product}
          data-testid="button-generate-qr"
        >
          <QrCode className="w-4 h-4 mr-2" />
          {isGenerating ? "Generating..." : "Generate"}
        </Button>
        <Button 
          variant="secondary" 
          className="flex-1" 
          onClick={handleScanQR}
          data-testid="button-scan-qr"
        >
          <Camera className="w-4 h-4 mr-2" />
          Scan
        </Button>
      </div>
    </div>
  );
}
