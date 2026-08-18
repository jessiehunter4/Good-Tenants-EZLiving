
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Calculator, DollarSign } from "lucide-react";
import { useROICalculation } from "@/hooks/analytics/useROICalculation";

const ROICalculator = () => {
  const { inputs, metrics, updateInput, marketComparison } = useROICalculation();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  if (!metrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            ROI Calculator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading calculator...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Investment ROI Calculator
          </CardTitle>
          <CardDescription>
            Calculate potential returns for your investment property
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purchasePrice">Purchase Price</Label>
              <Input
                id="purchasePrice"
                type="number"
                value={inputs.purchasePrice}
                onChange={(e) => updateInput('purchasePrice', Number(e.target.value))}
                placeholder="500000"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="downPayment">Down Payment</Label>
              <Input
                id="downPayment"
                type="number"
                value={inputs.downPayment}
                onChange={(e) => updateInput('downPayment', Number(e.target.value))}
                placeholder="100000"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="monthlyRent">Monthly Rent</Label>
              <Input
                id="monthlyRent"
                type="number"
                value={inputs.monthlyRent}
                onChange={(e) => updateInput('monthlyRent', Number(e.target.value))}
                placeholder="3500"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="propertyTaxes">Monthly Property Taxes</Label>
              <Input
                id="propertyTaxes"
                type="number"
                value={inputs.propertyTaxes}
                onChange={(e) => updateInput('propertyTaxes', Number(e.target.value))}
                placeholder="500"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="insurance">Monthly Insurance</Label>
              <Input
                id="insurance"
                type="number"
                value={inputs.insurance}
                onChange={(e) => updateInput('insurance', Number(e.target.value))}
                placeholder="200"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="maintenance">Monthly Maintenance</Label>
              <Input
                id="maintenance"
                type="number"
                value={inputs.maintenance}
                onChange={(e) => updateInput('maintenance', Number(e.target.value))}
                placeholder="300"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="vacancyRate">Vacancy Rate (%)</Label>
              <Input
                id="vacancyRate"
                type="number"
                value={inputs.vacancyRate}
                onChange={(e) => updateInput('vacancyRate', Number(e.target.value))}
                placeholder="5"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="managementFee">Management Fee (%)</Label>
              <Input
                id="managementFee"
                type="number"
                value={inputs.managementFee}
                onChange={(e) => updateInput('managementFee', Number(e.target.value))}
                placeholder="8"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Monthly Cash Flow
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              {formatCurrency(metrics.monthlyCashFlow)}
              {metrics.monthlyCashFlow >= 0 ? (
                <TrendingUp className="h-4 w-4 text-role-agent" />
              ) : (
                <TrendingDown className="h-4 w-4 text-destructive" />
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Annual: {formatCurrency(metrics.annualCashFlow)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Cap Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(metrics.capRate)}</div>
            {marketComparison && (
              <Badge variant={metrics.capRate > 6 ? "default" : "secondary"}>
                {marketComparison.capRateComparison}
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Cash-on-Cash Return</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(metrics.cashOnCashReturn)}</div>
            <p className="text-sm text-muted-foreground">
              Annual return on down payment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Total ROI</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(metrics.totalROI)}</div>
            <p className="text-sm text-muted-foreground">
              Including 3% appreciation
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Investment Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Financial Breakdown</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Monthly Rent:</span>
                  <span>{formatCurrency(inputs.monthlyRent)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Monthly Expenses:</span>
                  <span>{formatCurrency(metrics.monthlyExpenses)}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Net Cash Flow:</span>
                  <span className={metrics.monthlyCashFlow >= 0 ? "text-role-agent" : "text-destructive"}>
                    {formatCurrency(metrics.monthlyCashFlow)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Break-even Rent:</span>
                  <span>{formatCurrency(metrics.breakEvenRent)}</span>
                </div>
              </div>
            </div>
            
            {marketComparison && (
              <div>
                <h4 className="font-medium mb-2">Market Comparison</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Market Average Rent:</span>
                    <span>{formatCurrency(marketComparison.averageRent)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Your Rent vs Market:</span>
                    <span className={marketComparison.rentComparison >= 0 ? "text-role-agent" : "text-destructive"}>
                      {formatPercentage(marketComparison.rentComparison)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payback Period:</span>
                    <span>{metrics.monthsToBreakEven.toFixed(1)} months</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ROICalculator;
