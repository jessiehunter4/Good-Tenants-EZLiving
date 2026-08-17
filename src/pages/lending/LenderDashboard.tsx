import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  SECURITY_TYPE_LABELS,
  TRANSACTION_TYPE_LABELS,
  findProduct,
  formatCurrency,
  scenarioReference,
  type ScenarioProduct,
  type SecurityType,
  type TransactionType,
} from "@/features/lending/products";

interface SharedScenario {
  accessId: string;
  response: string | null;
  scenario: {
    id: string;
    reference: number;
    product: ScenarioProduct;
    status: string;
    transaction_type: TransactionType | null;
    loan_amount: number | null;
    loan_term_months: number | null;
    loan_purpose: string | null;
    exit_strategy: string | null;
    submitted_at: string | null;
  };
  properties: { address: string | null; security_type: SecurityType | null }[];
}

/**
 * What a lender sees: the scenarios shared with them, and nothing else.
 *
 * There is no "browse all scenarios" view, deliberately. A scenario carries an
 * entity's assets, liabilities, tax position and credit impairments, and a
 * panel-wide feed of that is not something anyone agreed to.
 */
const LenderDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [scenarios, setScenarios] = useState<SharedScenario[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("scenario_lender_access")
      .select(
        `id, response,
         loan_scenarios!inner (
           id, reference, product, status, transaction_type, loan_amount,
           loan_term_months, loan_purpose, exit_strategy, submitted_at,
           scenario_properties ( address, security_type )
         )`,
      )
      .is("revoked_at", null)
      .eq("lender_id", user.id);

    if (error) {
      console.error("Could not load shared scenarios:", error);
      setIsLoading(false);
      return;
    }

    type Joined = {
      id: string;
      response: string | null;
      loan_scenarios: SharedScenario["scenario"] & {
        scenario_properties: SharedScenario["properties"];
      };
    };

    const rows = (data as unknown as Joined[]) ?? [];
    setScenarios(
      rows.map((row) => ({
        accessId: row.id,
        response: row.response,
        scenario: row.loan_scenarios,
        properties: row.loan_scenarios.scenario_properties ?? [],
      })),
    );
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  const respond = async (accessId: string, response: "interested" | "declined") => {
    const { error } = await supabase
      .from("scenario_lender_access")
      .update({ response, responded_at: new Date().toISOString() })
      .eq("id", accessId);

    if (error) {
      toast({ title: "Could not record that", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: response === "interested" ? "Marked as interested" : "Declined" });
    void load();
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Scenarios shared with you</h1>
          <p className="text-sm text-muted-foreground">
            Funding requests a broker has put in front of you.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to="/lender/profile">Edit lending profile</Link>
        </Button>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}

      {!isLoading && scenarios.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="font-medium">Nothing shared with you yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Scenarios appear here when a broker shares one. Keeping your lending profile current
              is what makes that likely.
            </p>
            <Button asChild className="mt-6">
              <Link to="/lender/profile">Update your profile</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {scenarios.map(({ accessId, response, scenario, properties }) => (
          <Card key={accessId}>
            <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
              <div>
                <CardTitle className="text-base">
                  {scenarioReference(scenario.reference)} · {findProduct(scenario.product)?.title}
                </CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  {scenario.transaction_type
                    ? TRANSACTION_TYPE_LABELS[scenario.transaction_type]
                    : "Transaction type not stated"}
                  {scenario.loan_term_months ? ` · ${scenario.loan_term_months} months` : ""}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold">{formatCurrency(scenario.loan_amount)}</p>
                {response && <Badge variant="secondary">{response}</Badge>}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {properties.length > 0 && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Security
                  </p>
                  <ul className="mt-1 space-y-1 text-sm">
                    {properties.map((property, index) => (
                      <li key={index}>
                        {property.address || "Address not stated"}
                        {property.security_type
                          ? ` — ${SECURITY_TYPE_LABELS[property.security_type]}`
                          : ""}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {scenario.loan_purpose && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Purpose
                  </p>
                  <p className="mt-1 whitespace-pre-line text-sm">{scenario.loan_purpose}</p>
                </div>
              )}

              {scenario.exit_strategy && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Exit strategy
                  </p>
                  <p className="mt-1 whitespace-pre-line text-sm">{scenario.exit_strategy}</p>
                </div>
              )}

              {!response && (
                <div className="flex gap-2 border-t pt-4">
                  <Button size="sm" onClick={() => void respond(accessId, "interested")}>
                    Interested
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => void respond(accessId, "declined")}>
                    Not for us
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default LenderDashboard;
