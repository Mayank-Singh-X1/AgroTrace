import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Cpu, Activity, CheckCircle, TrendingUp } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useBlockchain } from "@/context/BlockchainContext";

export default function WalletConnect() {
  const { 
    isConnected,
    isLoading,
    stats,
    mineBlock,
    refreshStats
  } = useBlockchain();

  const [isMining, setIsMining] = useState(false);

  const handleMineBlock = async () => {
    if (stats.pendingTransactions === 0) return;
    
    setIsMining(true);
    try {
      await mineBlock();
    } catch (error) {
      console.error('Mining failed:', error);
    } finally {
      setIsMining(false);
    }
  };

  if (isConnected) {
    return (
      <div className="flex items-center space-x-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge 
                variant="secondary" 
                className="bg-green-100 text-green-800 border-green-200 cursor-help"
              >
                <CheckCircle className="w-3 h-3 mr-1" />
                JS Blockchain
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>JavaScript Blockchain Active</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        {/* Blockchain Stats */}
        <div className="hidden md:flex items-center space-x-1 text-xs text-muted-foreground">
          <span>Blocks: {stats.totalBlocks}</span>
          <span>•</span>
          <span>Products: {stats.totalProducts}</span>
        </div>
        
        {/* Mine Block Button */}
        {stats.pendingTransactions > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleMineBlock}
                  disabled={isMining}
                  size="sm"
                  variant="outline"
                  className="text-blue-600 hover:text-blue-700"
                  data-testid="mine-block-button"
                >
                  {isMining ? (
                    <>
                      <Activity className="w-4 h-4 mr-1 animate-spin" />
                      Mining...
                    </>
                  ) : (
                    <>
                      <Cpu className="w-4 h-4 mr-1" />
                      Mine ({stats.pendingTransactions})
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Mine pending transactions into a new block</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        {/* Refresh Stats */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={refreshStats}
                className="text-muted-foreground hover:text-foreground"
                data-testid="refresh-stats-button"
              >
                <TrendingUp className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Refresh blockchain statistics</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <Badge variant="secondary" className="text-xs">
        <Cpu className="w-3 h-3 mr-1" />
        Blockchain Ready
      </Badge>
    </div>
  );
}
