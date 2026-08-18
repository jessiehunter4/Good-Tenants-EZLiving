
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, MapPin, Users, DollarSign } from "lucide-react";
import { useMarketInsights } from "@/hooks/analytics/useMarketInsights";

interface MarketInsightsGridProps {
  userRole: string | null;
}

const MarketInsightsGrid = ({ userRole }: MarketInsightsGridProps) => {
  const { data: insights, isLoading } = useMarketInsights(userRole);

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-20 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {insights?.map((insight, index) => (
        <Card key={index} className="relative">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{insight.title}</CardTitle>
              <Badge variant={insight.priority === "high" ? "destructive" : insight.priority === "medium" ? "default" : "secondary"}>
                {insight.priority}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <CardDescription className="text-sm leading-relaxed">
              {insight.description}
            </CardDescription>
            
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <MapPin className="h-3 w-3" />
                <span>{insight.location}</span>
              </div>
              {insight.trend && (
                <div className="flex items-center space-x-1">
                  <TrendingUp className="h-3 w-3" />
                  <span>{insight.trend}%</span>
                </div>
              )}
            </div>

            {insight.actionItems && insight.actionItems.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Recommended Actions:</div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {insight.actionItems.map((action, actionIndex) => (
                    <li key={actionIndex} className="flex items-start space-x-2">
                      <span className="text-primary">•</span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {insight.cta && (
              <Button variant="outline" size="sm" className="w-full">
                {insight.cta}
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MarketInsightsGrid;
