
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useIntegrationClient } from "@/hooks/useIntegrationClient";
import { Badge } from "@/components/ui/badge";
import { TestTube, CheckCircle, XCircle, Loader2 } from "lucide-react";

const IntegrationTester = () => {
  const [licenseNumber, setLicenseNumber] = useState("");
  const [state, setState] = useState("");
  const [testResult, setTestResult] = useState<any>(null);
  const { loading, testConnection, verifyLicense } = useIntegrationClient();

  const handleTestConnection = async () => {
    const result = await testConnection("integration-template");
    setTestResult(result);
  };

  const handleVerifyLicense = async () => {
    if (!licenseNumber || !state) {
      return;
    }
    
    const result = await verifyLicense("integration-template", {
      license_number: licenseNumber,
      state: state.toUpperCase(),
    });
    setTestResult(result);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Integration Testing
        </CardTitle>
        <CardDescription>
          Test the integration framework with sample API calls
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Connection Test */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Connection Test</Label>
          <Button 
            onClick={handleTestConnection} 
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <TestTube className="h-4 w-4 mr-2" />
            )}
            Test Connection
          </Button>
        </div>

        {/* License Verification Test */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">License Verification Test</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="license" className="text-xs">License Number</Label>
              <Input
                id="license"
                placeholder="12345"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="state" className="text-xs">State</Label>
              <Input
                id="state"
                placeholder="CA"
                value={state}
                onChange={(e) => setState(e.target.value)}
                maxLength={2}
              />
            </div>
          </div>
          <Button 
            onClick={handleVerifyLicense} 
            disabled={loading || !licenseNumber || !state}
            className="w-full"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <TestTube className="h-4 w-4 mr-2" />
            )}
            Verify License
          </Button>
        </div>

        {/* Test Results */}
        {testResult && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Test Results</Label>
            <div className="p-3 bg-muted/40 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                {testResult.success ? (
                  <CheckCircle className="h-4 w-4 text-success" />
                ) : (
                  <XCircle className="h-4 w-4 text-destructive" />
                )}
                <Badge variant={testResult.success ? "default" : "destructive"}>
                  {testResult.success ? "Success" : "Failed"}
                </Badge>
                {testResult.usage && (
                  <Badge variant="outline">
                    {testResult.usage.response_time}ms
                  </Badge>
                )}
              </div>
              <pre className="text-xs bg-white p-2 rounded overflow-auto max-h-32">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IntegrationTester;
