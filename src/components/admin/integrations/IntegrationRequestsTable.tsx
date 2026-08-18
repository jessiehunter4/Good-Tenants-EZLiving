
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IntegrationRequest } from "@/types/integrations";
import { Check, X, Clock } from "lucide-react";

interface IntegrationRequestsTableProps {
  requests: IntegrationRequest[];
  onStatusUpdate: (id: string, status: IntegrationRequest['status'], notes?: string) => void;
}

const IntegrationRequestsTable = ({ requests, onStatusUpdate }: IntegrationRequestsTableProps) => {
  const getPriorityColor = (priority: IntegrationRequest['priority']) => {
    switch (priority) {
      case 'critical':
        return 'bg-destructive';
      case 'high':
        return 'bg-warning';
      case 'medium':
        return 'bg-warning';
      case 'low':
        return 'bg-info';
      default:
        return 'bg-muted-foreground';
    }
  };

  const getStatusColor = (status: IntegrationRequest['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-warning';
      case 'approved':
        return 'bg-success';
      case 'in_development':
        return 'bg-info';
      case 'completed':
        return 'bg-success';
      case 'rejected':
        return 'bg-destructive';
      default:
        return 'bg-muted-foreground';
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Integration</TableHead>
          <TableHead>Requested By</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Justification</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {requests.map((request) => (
          <TableRow key={request.id}>
            <TableCell>
              <div>
                <div className="font-medium">{request.integration_name}</div>
                <div className="text-sm text-muted-foreground">{request.provider_name}</div>
              </div>
            </TableCell>
            <TableCell>{request.user?.email}</TableCell>
            <TableCell>
              <Badge className={`${getPriorityColor(request.priority)} text-white`}>
                {request.priority}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge className={`${getStatusColor(request.status)} text-white`}>
                {request.status}
              </Badge>
            </TableCell>
            <TableCell className="max-w-xs truncate">
              {request.business_justification}
            </TableCell>
            <TableCell>
              {new Date(request.created_at).toLocaleDateString()}
            </TableCell>
            <TableCell>
              {request.status === 'pending' && (
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    onClick={() => onStatusUpdate(request.id, 'approved')}
                    className="flex items-center gap-1"
                  >
                    <Check className="h-3 w-3" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onStatusUpdate(request.id, 'rejected')}
                    className="flex items-center gap-1"
                  >
                    <X className="h-3 w-3" />
                    Reject
                  </Button>
                </div>
              )}
              {request.status === 'approved' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onStatusUpdate(request.id, 'in_development')}
                  className="flex items-center gap-1"
                >
                  <Clock className="h-3 w-3" />
                  Start Dev
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default IntegrationRequestsTable;
