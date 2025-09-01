import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, Truck, Store, AlertCircle } from "lucide-react";
import { format } from "date-fns";

interface SupplyChainVisualizationProps {
  productId?: string;
}

export default function SupplyChainVisualization({ productId }: SupplyChainVisualizationProps) {
  const { data: stages, isLoading } = useQuery({
    queryKey: ["/api/products", productId, "supply-chain"],
    enabled: !!productId,
    retry: false,
  });

  if (!productId) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No product selected</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="w-8 h-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (!stages || stages.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No supply chain data available</p>
      </div>
    );
  }

  const getStageIcon = (stageType: string, status: string) => {
    if (status === 'completed') {
      return <CheckCircle className="w-4 h-4 text-white" />;
    }
    
    switch (stageType) {
      case 'transport':
        return <Truck className="w-4 h-4 text-white" />;
      case 'retail':
        return <Store className="w-4 h-4 text-white" />;
      default:
        return <AlertCircle className="w-4 h-4 text-white" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-primary';
      case 'in_progress':
        return 'bg-secondary';
      case 'pending':
        return 'bg-muted';
      default:
        return 'bg-muted';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case 'pending':
        return <Badge className="bg-gray-100 text-gray-800">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {stages.map((stage: any, index: number) => (
        <div key={stage.id} className="flex items-center space-x-4">
          <div className={`w-8 h-8 ${getStatusColor(stage.status)} rounded-full flex items-center justify-center`}>
            {getStageIcon(stage.stageType, stage.status)}
          </div>
          <div className="flex-1">
            <p className="font-medium text-foreground" data-testid={`stage-name-${index}`}>
              {stage.stageName}
            </p>
            <p className="text-sm text-muted-foreground" data-testid={`stage-location-${index}`}>
              {stage.location || 'Location not specified'}
            </p>
            <p className="text-xs text-muted-foreground" data-testid={`stage-timestamp-${index}`}>
              {stage.timestamp ? format(new Date(stage.timestamp), 'MMM dd, yyyy - HH:mm') : 'Time not recorded'}
            </p>
          </div>
          <div data-testid={`stage-status-${index}`}>
            {getStatusBadge(stage.status)}
          </div>
        </div>
      ))}
      
      {stages.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No supply chain stages recorded yet</p>
        </div>
      )}
    </div>
  );
}
