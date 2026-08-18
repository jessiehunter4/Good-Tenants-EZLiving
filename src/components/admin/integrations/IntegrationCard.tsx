
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Integration } from "@/types/integrations";
import { PlayCircle, PauseCircle, TestTube, Settings } from "lucide-react";

interface IntegrationCardProps {
  integration: Integration;
  onStatusChange: (id: string, status: Integration['status']) => void;
  onTest: (id: string) => void;
}

const IntegrationCard = ({ integration, onStatusChange, onTest }: IntegrationCardProps) => {
  const getStatusColor = (status: Integration['status']) => {
    switch (status) {
      case 'active':
        return 'bg-success';
      case 'inactive':
        return 'bg-muted-foreground';
      case 'maintenance':
        return 'bg-warning';
      case 'deprecated':
        return 'bg-destructive';
      default:
        return 'bg-muted-foreground';
    }
  };

  const getTestResultColor = (result?: string) => {
    switch (result) {
      case 'success':
        return 'bg-success';
      case 'failed':
        return 'bg-destructive';
      case 'pending':
        return 'bg-warning';
      default:
        return 'bg-muted-foreground';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{integration.name}</CardTitle>
            <CardDescription>{integration.description}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`${getStatusColor(integration.status)} text-white`}>
              {integration.status}
            </Badge>
            {integration.test_result && (
              <Badge className={`${getTestResultColor(integration.test_result)} text-white`}>
                {integration.test_result}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Provider:</span> {integration.provider}
            </div>
            <div>
              <span className="font-medium">Type:</span> {integration.integration_type}
            </div>
            <div>
              <span className="font-medium">API Key Required:</span> {integration.requires_api_key ? 'Yes' : 'No'}
            </div>
            {integration.last_tested_at && (
              <div>
                <span className="font-medium">Last Tested:</span> {new Date(integration.last_tested_at).toLocaleDateString()}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {integration.status === 'inactive' ? (
              <Button
                size="sm"
                onClick={() => onStatusChange(integration.id, 'active')}
                className="flex items-center gap-1"
              >
                <PlayCircle className="h-4 w-4" />
                Activate
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onStatusChange(integration.id, 'inactive')}
                className="flex items-center gap-1"
              >
                <PauseCircle className="h-4 w-4" />
                Deactivate
              </Button>
            )}
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => onTest(integration.id)}
              className="flex items-center gap-1"
            >
              <TestTube className="h-4 w-4" />
              Test
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              className="flex items-center gap-1"
            >
              <Settings className="h-4 w-4" />
              Configure
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default IntegrationCard;
