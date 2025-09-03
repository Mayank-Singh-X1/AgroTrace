import { Button } from "@/components/ui/button";
import { useBlockchainContext } from "@/context/BlockchainContext";
import { Wallet, Loader2 } from "lucide-react";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function WalletConnect() {
  const { connected, connecting, connect, disconnect, account, error } = useBlockchainContext();
  const [isHovering, setIsHovering] = useState(false);

  const handleConnect = async () => {
    try {
      await connect();
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  const handleDisconnect = () => {
    disconnect();
  };

  const shortenAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  if (!window.ethereum) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={() => window.open("https://metamask.io/download/", "_blank")}
            >
              <Wallet className="h-4 w-4" />
              Install MetaMask
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>MetaMask is required to use blockchain features</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (connected && account) {
    return (
      <TooltipProvider>
        <Tooltip open={isHovering}>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              onClick={handleDisconnect}
              data-testid="wallet-disconnect-button"
            >
              <Wallet className="h-4 w-4 text-green-500" />
              {shortenAddress(account)}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Click to disconnect wallet</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="gap-2"
      onClick={handleConnect}
      disabled={connecting}
      data-testid="wallet-connect-button"
    >
      {connecting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Connecting...
        </>
      ) : (
        <>
          <Wallet className="h-4 w-4" />
          Connect Wallet
        </>
      )}
    </Button>
  );
}