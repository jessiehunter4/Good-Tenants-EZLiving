import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Plus, Trash2, Upload } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  BORROWING_ENTITY_TYPES,
  BROKER_FEES,
  EMPLOYMENT_TYPES,
  INTEREST_METHODS,
  LOAN_TERMS,
  PROPERTY_USES,
  SECURITY_TYPE_LABELS,
  TRANSACTION_TYPE_LABELS,
  TURNAROUND_OPTIONS,
  findProduct,
  formatCurrency,
  type ScenarioProduct,
} from "@/features/lending/products";
import {
  EMPTY_GUARANTOR,
  EMPTY_PROPERTY,
  countComplete,
  guarantorTotals,
  scenarioSchema,
  toNumber,
  type ScenarioFormValues,
} from "@/features/lending/scenarioSchema";

const STEPS = [
  "Security property",
  "Loan structure",
  "Borrowing entity",
  "Guarantors",
  "Documents",
  "Review",
] as const;

const MAX_FILE_BYTES = 32 * 1024 * 1024;

interface ScenarioStepperProps {
  product: ScenarioProduct;
  onChangeProduct: () => void;
}

export const ScenarioStepper = ({ product, onChangeProduct }: ScenarioStepperProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [files, setFiles] = useState<File[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const option = findProduct(product);

  const form = useForm<ScenarioFormValues>({
    resolver: zodResolver(scenarioSchema),
    defaultValues: {
      product,
      transactionType: undefined,
      properties: [{ ...EMPTY_PROPERTY }],
      loanAmount: "",
      loanTermMonths: "",
      interestPaymentMethod: "",
      brokerFeePercent: "",
      loanPurpose: "",
      exitStrategy: "",
      borrowingEntityType: "",
      borrowingEntityName: "",
      borrowingEntityAcn: "",
      turnaroundToSettlement: "",
      preferredValuer: "",
      guarantors: [],
      additionalComments: "",
    },
  });

  const properties = useFieldArray({ control: form.control, name: "properties" });
  const guarantors = useFieldArray({ control: form.control, name: "guarantors" });
  const values = form.watch();

  /* Per-section counters, as the reference does. A field counts when it holds
     something, not when it has been visited. */
  const completion = [
    countComplete([
      values.transactionType,
      values.properties?.[0]?.address,
      values.properties?.[0]?.description,
      values.properties?.[0]?.securityType,
      values.properties?.[0]?.propertyUse,
      values.properties?.[0]?.estimatedValue,
    ]),
    countComplete([
      values.loanAmount,
      values.loanTermMonths,
      values.interestPaymentMethod,
      values.brokerFeePercent,
      values.loanPurpose,
      values.exitStrategy,
    ]),
    countComplete([
      values.borrowingEntityType,
      values.borrowingEntityName,
      values.borrowingEntityAcn,
      values.turnaroundToSettlement,
      values.preferredValuer,
    ]),
    countComplete(values.guarantors?.map((g) => g.fullName) ?? []),
    countComplete([values.additionalComments, files.length > 0 ? "files" : undefined]),
    { done: 0, total: 0 },
  ];

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const accepted: File[] = [];
    for (const file of Array.from(incoming)) {
      if (file.size > MAX_FILE_BYTES) {
        toast({
          title: "File too large",
          description: `${file.name} is over 32MB and was not attached.`,
          variant: "destructive",
        });
        continue;
      }
      accepted.push(file);
    }
    setFiles((current) => [...current, ...accepted]);
  };

  const persist = async (submit: boolean) => {
    if (!user) {
      toast({ title: "Please sign in first", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      const { data: scenario, error } = await supabase
        .from("loan_scenarios")
        .insert({
          created_by: user.id,
          product: values.product,
          status: submit ? "submitted" : "draft",
          submitted_at: submit ? new Date().toISOString() : null,
          transaction_type: values.transactionType ?? null,
          loan_amount: toNumber(values.loanAmount),
          loan_term_months: toNumber(values.loanTermMonths),
          interest_payment_method: values.interestPaymentMethod || null,
          broker_fee_percent: toNumber(values.brokerFeePercent),
          loan_purpose: values.loanPurpose || null,
          exit_strategy: values.exitStrategy || null,
          borrowing_entity_type: values.borrowingEntityType || null,
          borrowing_entity_name: values.borrowingEntityName || null,
          borrowing_entity_acn: values.borrowingEntityAcn || null,
          turnaround_to_settlement: values.turnaroundToSettlement || null,
          preferred_valuer: values.preferredValuer || null,
          additional_comments: values.additionalComments || null,
        })
        .select("id, reference")
        .single();

      if (error) throw error;

      const scenarioId = scenario.id;

      if (values.properties.length) {
        const { error: propertyError } = await supabase.from("scenario_properties").insert(
          values.properties.map((property, index) => ({
            scenario_id: scenarioId,
            position: index + 1,
            address: property.address || null,
            description: property.description || null,
            security_type: property.securityType ?? null,
            property_use: property.propertyUse || null,
            land_size_sqm: toNumber(property.landSizeSqm),
            estimated_value: toNumber(property.estimatedValue),
            current_debt: toNumber(property.currentDebt),
            comments: property.comments || null,
          })),
        );
        if (propertyError) throw propertyError;
      }

      if (values.guarantors.length) {
        const { error: guarantorError } = await supabase.from("scenario_guarantors").insert(
          values.guarantors.map((guarantor, index) => ({
            scenario_id: scenarioId,
            position: index + 1,
            full_name: guarantor.fullName || null,
            employment_type: guarantor.employmentType || null,
            property_assets: toNumber(guarantor.propertyAssets) ?? 0,
            property_liabilities: toNumber(guarantor.propertyLiabilities) ?? 0,
            other_assets: toNumber(guarantor.otherAssets) ?? 0,
            other_liabilities: toNumber(guarantor.otherLiabilities) ?? 0,
            outstanding_tax: guarantor.outstandingTax ?? null,
            credit_impairments: guarantor.creditImpairments ?? null,
            comments: guarantor.comments || null,
          })),
        );
        if (guarantorError) throw guarantorError;
      }

      /* Files upload after the row exists: storage paths are namespaced by
         scenario id, and that is also what the storage policy checks. */
      for (const file of files) {
        const path = `${scenarioId}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("scenario-documents")
          .upload(path, file);

        if (uploadError) {
          toast({
            title: "A document did not upload",
            description: `${file.name}: ${uploadError.message}`,
            variant: "destructive",
          });
          continue;
        }

        await supabase.from("scenario_documents").insert({
          scenario_id: scenarioId,
          storage_path: path,
          file_name: file.name,
          file_size: file.size,
          content_type: file.type || null,
          uploaded_by: user.id,
        });
      }

      toast({
        title: submit ? "Scenario submitted" : "Draft saved",
        description: submit
          ? "It is ready to share with lenders on the panel."
          : "You can pick this up where you left off.",
      });
      navigate("/scenarios");
    } catch (error) {
      console.error("Scenario save failed:", error);
      toast({
        title: submit ? "Could not submit the scenario" : "Could not save the draft",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="dark mx-auto w-full max-w-3xl text-canvas-foreground">
      {/* Progress rail */}
      <ol className="mb-8 flex flex-wrap items-center gap-x-2 gap-y-3">
        {STEPS.map((label, index) => {
          const isDone = index < step;
          const isCurrent = index === step;
          return (
            <li key={label} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStep(index)}
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-medium transition-colors",
                  isDone && "border-primary bg-primary text-primary-foreground",
                  isCurrent && "border-primary text-primary",
                  !isDone && !isCurrent && "border-muted-foreground/30 text-muted-foreground",
                )}
                aria-label={`Go to ${label}`}
                aria-current={isCurrent ? "step" : undefined}
              >
                {isDone ? <Check className="h-3.5 w-3.5" /> : index + 1}
              </button>
              <span
                className={cn(
                  "text-xs font-medium",
                  isCurrent || isDone ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {label}
              </span>
              {index < STEPS.length - 1 && (
                <span className="ml-1 hidden h-px w-6 bg-border sm:block" aria-hidden="true" />
              )}
            </li>
          );
        })}
      </ol>

      {/* Same treatment as registration: dark scoped to the card so the
          controls adapt, on an elevated surface rather than a white slab. */}
      <div className="dark rounded-2xl bg-canvas-elevated p-6 text-canvas-foreground shadow-lg ring-1 ring-canvas-border sm:p-8">
        <div className="mb-6 flex items-start justify-between gap-4 border-b pb-4">
          <div>
            <h2 className="text-lg font-semibold">{STEPS[step]}</h2>
            {completion[step].total > 0 && (
              <p className="text-sm text-muted-foreground">
                {completion[step].done} of {completion[step].total} complete
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">{option?.title}</p>
            <Button type="button" variant="ghost" size="sm" onClick={onChangeProduct}>
              Change product
            </Button>
          </div>
        </div>

        {/* ---------------- 1. Security property ---------------- */}
        {step === 0 && (
          <div className="space-y-6 duration-200 animate-in fade-in">
            <div className="space-y-2">
              <Label>Transaction type</Label>
              <Select
                value={values.transactionType ?? ""}
                onValueChange={(value) =>
                  form.setValue("transactionType", value as ScenarioFormValues["transactionType"])
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose one" />
                </SelectTrigger>
                <SelectContent>
                  {option?.transactions.map((transaction) => (
                    <SelectItem key={transaction} value={transaction}>
                      {TRANSACTION_TYPE_LABELS[transaction]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {properties.fields.map((field, index) => (
              <div key={field.id} className="space-y-4 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Security property {index + 1}</h3>
                  {properties.fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => properties.remove(index)}
                    >
                      <Trash2 className="mr-1 h-4 w-4" aria-hidden="true" />
                      Remove
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`address-${index}`}>Address</Label>
                  <Input
                    id={`address-${index}`}
                    placeholder="Start here — search for an address"
                    {...form.register(`properties.${index}.address`)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`description-${index}`}>Property description</Label>
                  <Input id={`description-${index}`} {...form.register(`properties.${index}.description`)} />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Security type</Label>
                    <Select
                      value={values.properties?.[index]?.securityType ?? ""}
                      onValueChange={(value) =>
                        form.setValue(
                          `properties.${index}.securityType`,
                          value as NonNullable<ScenarioFormValues["properties"][number]["securityType"]>,
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose one" />
                      </SelectTrigger>
                      <SelectContent>
                        {option?.securities.map((security) => (
                          <SelectItem key={security} value={security}>
                            {SECURITY_TYPE_LABELS[security]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Property use</Label>
                    <Select
                      value={values.properties?.[index]?.propertyUse ?? ""}
                      onValueChange={(value) => form.setValue(`properties.${index}.propertyUse`, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose one" />
                      </SelectTrigger>
                      <SelectContent>
                        {PROPERTY_USES.map((use) => (
                          <SelectItem key={use} value={use}>
                            {use}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`value-${index}`}>Estimated value</Label>
                    <Input
                      id={`value-${index}`}
                      inputMode="numeric"
                      placeholder="$"
                      {...form.register(`properties.${index}.estimatedValue`)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`debt-${index}`}>Current debt</Label>
                    <Input
                      id={`debt-${index}`}
                      inputMode="numeric"
                      placeholder="$"
                      {...form.register(`properties.${index}.currentDebt`)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`land-${index}`}>
                      Land size (m²){" "}
                      <span className="font-normal text-muted-foreground">(optional)</span>
                    </Label>
                    <Input
                      id={`land-${index}`}
                      inputMode="numeric"
                      {...form.register(`properties.${index}.landSizeSqm`)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`comments-${index}`}>Additional comments</Label>
                  <Textarea id={`comments-${index}`} {...form.register(`properties.${index}.comments`)} />
                </div>
              </div>
            ))}

            {properties.fields.length < 6 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => properties.append({ ...EMPTY_PROPERTY })}
              >
                <Plus className="mr-1 h-4 w-4" aria-hidden="true" />
                Add property {properties.fields.length + 1}
              </Button>
            )}
          </div>
        )}

        {/* ---------------- 2. Loan structure ---------------- */}
        {step === 1 && (
          <div className="space-y-6 duration-200 animate-in fade-in">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="loanAmount">Funding required</Label>
                <Input id="loanAmount" inputMode="numeric" placeholder="$" {...form.register("loanAmount")} />
              </div>

              <div className="space-y-2">
                <Label>Loan term</Label>
                <Select
                  value={values.loanTermMonths ?? ""}
                  onValueChange={(value) => form.setValue("loanTermMonths", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose one" />
                  </SelectTrigger>
                  <SelectContent>
                    {LOAN_TERMS.map((term) => (
                      <SelectItem key={term} value={String(term)}>
                        {term} months
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Interest payment method</Label>
                <Select
                  value={values.interestPaymentMethod ?? ""}
                  onValueChange={(value) => form.setValue("interestPaymentMethod", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose one" />
                  </SelectTrigger>
                  <SelectContent>
                    {INTEREST_METHODS.map((method) => (
                      <SelectItem key={method} value={method}>
                        {method}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Broker fee</Label>
                <Select
                  value={values.brokerFeePercent ?? ""}
                  onValueChange={(value) => form.setValue("brokerFeePercent", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose one" />
                  </SelectTrigger>
                  <SelectContent>
                    {BROKER_FEES.map((fee) => (
                      <SelectItem key={fee} value={String(fee)}>
                        {fee.toFixed(2)}% + GST
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="loanPurpose">Loan purpose overview</Label>
              <Textarea id="loanPurpose" rows={4} maxLength={10_000} {...form.register("loanPurpose")} />
              <p className="text-xs text-muted-foreground">
                {values.loanPurpose?.length ?? 0}/10,000
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="exitStrategy">Exit strategy</Label>
              <Textarea id="exitStrategy" rows={4} maxLength={10_000} {...form.register("exitStrategy")} />
              <p className="text-xs text-muted-foreground">
                {values.exitStrategy?.length ?? 0}/10,000
              </p>
            </div>
          </div>
        )}

        {/* ---------------- 3. Borrowing entity ---------------- */}
        {step === 2 && (
          <div className="space-y-6 duration-200 animate-in fade-in">
            <div className="space-y-2">
              <Label>Borrowing entity type</Label>
              <Select
                value={values.borrowingEntityType ?? ""}
                onValueChange={(value) => form.setValue("borrowingEntityType", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose one" />
                </SelectTrigger>
                <SelectContent>
                  {BORROWING_ENTITY_TYPES.map((entity) => (
                    <SelectItem key={entity} value={entity}>
                      {entity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="entityName">Entity name</Label>
                <Input id="entityName" {...form.register("borrowingEntityName")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="entityAcn">ACN</Label>
                <Input id="entityAcn" {...form.register("borrowingEntityAcn")} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Turnaround time to settlement</Label>
                <Select
                  value={values.turnaroundToSettlement ?? ""}
                  onValueChange={(value) => form.setValue("turnaroundToSettlement", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose one" />
                  </SelectTrigger>
                  <SelectContent>
                    {TURNAROUND_OPTIONS.map((turnaround) => (
                      <SelectItem key={turnaround} value={turnaround}>
                        {turnaround}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="valuer">
                  Preferred valuer{" "}
                  <span className="font-normal text-muted-foreground">(optional)</span>
                </Label>
                <Input id="valuer" {...form.register("preferredValuer")} />
              </div>
            </div>
          </div>
        )}

        {/* ---------------- 4. Guarantors ---------------- */}
        {step === 3 && (
          <div className="space-y-6 duration-200 animate-in fade-in">
            {guarantors.fields.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No guarantors yet. Most scenarios have at least one.
              </p>
            )}

            {guarantors.fields.map((field, index) => {
              const totals = guarantorTotals(values.guarantors?.[index] ?? EMPTY_GUARANTOR);
              return (
                <div key={field.id} className="space-y-4 rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">Guarantor {index + 1}</h3>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => guarantors.remove(index)}
                    >
                      <Trash2 className="mr-1 h-4 w-4" aria-hidden="true" />
                      Remove
                    </Button>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor={`guarantor-name-${index}`}>Full name</Label>
                      <Input
                        id={`guarantor-name-${index}`}
                        {...form.register(`guarantors.${index}.fullName`)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Employment type</Label>
                      <Select
                        value={values.guarantors?.[index]?.employmentType ?? ""}
                        onValueChange={(value) =>
                          form.setValue(`guarantors.${index}.employmentType`, value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose one" />
                        </SelectTrigger>
                        <SelectContent>
                          {EMPLOYMENT_TYPES.map((employment) => (
                            <SelectItem key={employment} value={employment}>
                              {employment}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {(
                      [
                        ["propertyAssets", "Property assets"],
                        ["propertyLiabilities", "Property liabilities"],
                        ["otherAssets", "Other assets"],
                        ["otherLiabilities", "Other liabilities"],
                      ] as const
                    ).map(([name, label]) => (
                      <div key={name} className="space-y-2">
                        <Label htmlFor={`${name}-${index}`}>{label}</Label>
                        <Input
                          id={`${name}-${index}`}
                          inputMode="numeric"
                          placeholder="$0"
                          {...form.register(`guarantors.${index}.${name}`)}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Derived, never typed: the database computes these columns the
                      same way, so a hand-entered total could only disagree. */}
                  <div className="grid gap-3 rounded-lg bg-muted/40 p-3 sm:grid-cols-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Total assets</p>
                      <p className="font-medium">{formatCurrency(totals.totalAssets)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total liabilities</p>
                      <p className="font-medium">{formatCurrency(totals.totalLiabilities)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Net asset position</p>
                      <p
                        className={cn(
                          "font-semibold",
                          totals.netPosition < 0 && "text-destructive",
                        )}
                      >
                        {formatCurrency(totals.netPosition)}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Outstanding tax?</Label>
                      <Select
                        value={
                          values.guarantors?.[index]?.outstandingTax === undefined
                            ? ""
                            : String(values.guarantors[index].outstandingTax)
                        }
                        onValueChange={(value) =>
                          form.setValue(`guarantors.${index}.outstandingTax`, value === "true")
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose one" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="false">No</SelectItem>
                          <SelectItem value="true">Yes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Any credit impairments?</Label>
                      <Select
                        value={
                          values.guarantors?.[index]?.creditImpairments === undefined
                            ? ""
                            : String(values.guarantors[index].creditImpairments)
                        }
                        onValueChange={(value) =>
                          form.setValue(`guarantors.${index}.creditImpairments`, value === "true")
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose one" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="false">No</SelectItem>
                          <SelectItem value="true">Yes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              );
            })}

            {guarantors.fields.length < 6 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => guarantors.append({ ...EMPTY_GUARANTOR })}
              >
                <Plus className="mr-1 h-4 w-4" aria-hidden="true" />
                Add guarantor
              </Button>
            )}
          </div>
        )}

        {/* ---------------- 5. Documents ---------------- */}
        {step === 4 && (
          <div className="space-y-6 duration-200 animate-in fade-in">
            <div className="space-y-2">
              <Label htmlFor="additionalComments">Additional comments</Label>
              <p className="text-sm text-muted-foreground">
                Context that helps lenders understand the scenario. Included in the summary they
                receive.
              </p>
              <Textarea
                id="additionalComments"
                rows={5}
                maxLength={10_000}
                {...form.register("additionalComments")}
              />
              <p className="text-xs text-muted-foreground">
                {values.additionalComments?.length ?? 0}/10,000
              </p>
            </div>

            <div className="space-y-3">
              <Label htmlFor="documents">Supporting documents</Label>
              <label
                htmlFor="documents"
                className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition-colors hover:border-primary/60"
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  addFiles(event.dataTransfer.files);
                }}
              >
                <Upload className="mb-2 h-6 w-6 text-muted-foreground" aria-hidden="true" />
                <span className="text-sm font-medium">Choose files or drag and drop</span>
                <span className="mt-1 text-xs text-muted-foreground">
                  Valuations, asset and liability schedules, loan statements, developer CVs
                </span>
                <span className="mt-1 text-xs text-muted-foreground">
                  PDF, images, spreadsheets — 32MB each
                </span>
                <input
                  id="documents"
                  type="file"
                  multiple
                  className="sr-only"
                  onChange={(event) => addFiles(event.target.files)}
                />
              </label>

              {files.length > 0 && (
                <ul className="space-y-2">
                  {files.map((file, index) => (
                    <li
                      key={`${file.name}-${index}`}
                      className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                    >
                      <span className="truncate">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setFiles((current) => current.filter((_, i) => i !== index))}
                      >
                        Remove
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* ---------------- 6. Review ---------------- */}
        {step === 5 && (
          <div className="space-y-4 duration-200 animate-in fade-in">
            <p className="text-sm text-muted-foreground">
              Check this over. Once submitted it can be shared with lenders on the panel; until you
              share it, nobody but you and an administrator can see it.
            </p>

            <dl className="divide-y rounded-lg border">
              {[
                ["Product", option?.title],
                [
                  "Transaction",
                  values.transactionType ? TRANSACTION_TYPE_LABELS[values.transactionType] : "—",
                ],
                ["Security properties", String(values.properties?.length ?? 0)],
                ["Funding required", formatCurrency(toNumber(values.loanAmount))],
                [
                  "Term",
                  values.loanTermMonths ? `${values.loanTermMonths} months` : "—",
                ],
                ["Interest", values.interestPaymentMethod || "—"],
                ["Borrowing entity", values.borrowingEntityType || "—"],
                ["Guarantors", String(values.guarantors?.length ?? 0)],
                ["Documents", String(files.length)],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 px-4 py-3 text-sm">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="text-right font-medium">{value || "—"}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {/* ---------------- navigation ---------------- */}
        <div className="mt-8 flex flex-wrap items-center gap-2 border-t pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => (step === 0 ? onChangeProduct() : setStep(step - 1))}
            disabled={isSaving}
          >
            <ArrowLeft className="mr-1 h-4 w-4" aria-hidden="true" />
            Back
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={() => void persist(false)}
            disabled={isSaving}
          >
            Save draft
          </Button>

          <div className="flex-1" />

          {step < STEPS.length - 1 ? (
            <Button type="button" onClick={() => setStep(step + 1)} disabled={isSaving}>
              Continue
            </Button>
          ) : (
            <Button type="button" onClick={() => void persist(true)} disabled={isSaving}>
              {isSaving ? "Submitting..." : "Submit scenario"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScenarioStepper;
