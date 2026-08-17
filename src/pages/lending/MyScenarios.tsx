import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  findProduct,
  formatCurrency,
  scenarioReference,
  type ScenarioProduct,
} from "@/features/lending/products";

interface ScenarioRow {
  id: string;
  reference: number;
  product: ScenarioProduct;
  status: string;
  loan_amount: number | null;
  created_at: string;
  submitted_at: string | null;
}

const MyScenarios = () => {
  const { user } = useAuth();
  const [scenarios, setScenarios] = useState<ScenarioRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      const { data, error } = await supabase
        .from("loan_scenarios")
        .select("id, reference, product, status, loan_amount, created_at, submitted_at")
        .eq("created_by", user.id)
        .order("created_at", { ascending: false });

      if (error) console.error("Could not load scenarios:", error);
      else setScenarios(data ?? []);
      setIsLoading(false);
    };

    void load();
  }, [user]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Your scenarios</h1>
          <p className="text-sm text-muted-foreground">
            Drafts are visible only to you until you submit and share them.
          </p>
        </div>
        <Button asChild>
          <Link to="/scenarios/new">
            <Plus className="mr-1 h-4 w-4" aria-hidden="true" />
            Start a scenario
          </Link>
        </Button>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}

      {!isLoading && scenarios.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="font-medium">No scenarios yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              A scenario collects the security, the loan structure and the guarantors in one place,
              so every lender is answering the same question.
            </p>
            <Button asChild className="mt-6">
              <Link to="/scenarios/new">Start your first scenario</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {scenarios.map((scenario) => (
          <Card key={scenario.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-4 py-4">
              <div>
                <p className="font-medium">
                  {scenarioReference(scenario.status === "draft" ? null : scenario.reference)} ·{" "}
                  {findProduct(scenario.product)?.title}
                </p>
                <p className="text-sm text-muted-foreground">
                  {scenario.submitted_at
                    ? `Submitted ${new Date(scenario.submitted_at).toLocaleDateString()}`
                    : `Started ${new Date(scenario.created_at).toLocaleDateString()}`}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-semibold">{formatCurrency(scenario.loan_amount)}</span>
                <Badge variant={scenario.status === "draft" ? "secondary" : "default"}>
                  {scenario.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MyScenarios;
