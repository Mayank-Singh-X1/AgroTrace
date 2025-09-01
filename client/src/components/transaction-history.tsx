import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";

interface TransactionHistoryProps {
  limit?: number;
  productId?: string;
}

export default function TransactionHistory({ limit, productId }: TransactionHistoryProps) {
  const { user } = useAuth();
  
  const queryKey = productId 
    ? ["/api/products", productId, "transactions"]
    : ["/api/transactions"];

  const { data: transactions, isLoading } = useQuery({
    queryKey,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(limit || 5)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No transactions found</p>
      </div>
    );
  }

  const displayedTransactions = limit ? transactions.slice(0, limit) : transactions;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800">Verified</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTransactionDirection = (transaction: any) => {
    if (!user) return 'Unknown';
    
    if (transaction.fromUserId === user.id) {
      return `${user.role} → ${transaction.toUser?.role || 'Unknown'}`;
    } else if (transaction.toUserId === user.id) {
      return `${transaction.fromUser?.role || 'Unknown'} → ${user.role}`;
    }
    
    return `${transaction.fromUser?.role || 'Unknown'} → ${transaction.toUser?.role || 'Unknown'}`;
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-sm font-medium text-muted-foreground">Transaction ID</TableHead>
            <TableHead className="text-sm font-medium text-muted-foreground">Product</TableHead>
            <TableHead className="text-sm font-medium text-muted-foreground">From/To</TableHead>
            <TableHead className="text-sm font-medium text-muted-foreground">Status</TableHead>
            <TableHead className="text-sm font-medium text-muted-foreground">Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayedTransactions.map((transaction: any) => (
            <TableRow key={transaction.id}>
              <TableCell className="py-3 text-sm font-mono text-foreground" data-testid={`transaction-id-${transaction.id}`}>
                {transaction.id.slice(0, 8)}...
              </TableCell>
              <TableCell className="py-3 text-sm text-foreground" data-testid={`transaction-product-${transaction.id}`}>
                {transaction.product?.name || 'Unknown Product'}
              </TableCell>
              <TableCell className="py-3 text-sm text-muted-foreground" data-testid={`transaction-direction-${transaction.id}`}>
                {getTransactionDirection(transaction)}
              </TableCell>
              <TableCell className="py-3" data-testid={`transaction-status-${transaction.id}`}>
                {getStatusBadge(transaction.status)}
              </TableCell>
              <TableCell className="py-3 text-sm text-muted-foreground" data-testid={`transaction-date-${transaction.id}`}>
                {format(new Date(transaction.createdAt), 'MMM dd, yyyy')}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
