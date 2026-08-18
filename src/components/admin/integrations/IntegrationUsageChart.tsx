
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IntegrationUsage } from "@/types/integrations";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface IntegrationUsageChartProps {
  usageData: IntegrationUsage[];
}

/** One bar's worth of aggregated usage. */
interface UsagePoint {
  date: string;
  requests: number;
  success: number;
  errors: number;
}

const IntegrationUsageChart = ({ usageData }: IntegrationUsageChartProps) => {
  // Aggregate usage data by date
  const chartData = usageData.reduce<UsagePoint[]>((acc, usage) => {
    const existingEntry = acc.find(item => item.date === usage.date);
    if (existingEntry) {
      existingEntry.requests += usage.request_count;
      existingEntry.success += usage.success_count;
      existingEntry.errors += usage.error_count;
    } else {
      acc.push({
        date: usage.date,
        requests: usage.request_count,
        success: usage.success_count,
        errors: usage.error_count,
      });
    }
    return acc;
  }, []).slice(0, 7).reverse(); // Last 7 days

  return (
    <Card>
      <CardHeader>
        <CardTitle>Integration Usage (Last 7 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="requests" fill="#3b82f6" name="Total Requests" />
            <Bar dataKey="success" fill="#10b981" name="Successful" />
            <Bar dataKey="errors" fill="#ef4444" name="Errors" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default IntegrationUsageChart;
