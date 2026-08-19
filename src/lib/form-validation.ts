
import * as z from "zod";

// Common validation schemas that can be reused across forms
export const validationSchemas = {
  // Basic fields
  nonEmptyString: z.string().min(1, { message: "This field is required." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  
  // Numbers
  positiveNumber: z.coerce.number().min(0, { message: "Must be a positive number." }),
  positiveInteger: z.coerce.number().int().min(0, { message: "Must be a positive whole number." }),
  
  // Date
  futureDate: z.date().refine((date) => date >= new Date(), {
    message: "Date must be in the future.",
  }),
  
  // Location fields
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, { message: "Invalid ZIP code format." }),

  // Basic schemas for different roles
  tenant: {
    base: z.object({
      move_in_date: z.date({
        required_error: "Please select your preferred move-in date.",
      }),
      household_size: z.coerce.number().min(1, {
        message: "Household size must be at least 1.",
      }),
      household_income: z.coerce.number().min(0, {
        message: "Income must be a positive number.",
      }),
      pets: z.boolean().default(false),
      preferred_locations: z.string().optional(),
      bio: z.string().optional(),
    }),
  },

  agent: {
    base: z.object({
      license_number: z.string().min(1, {
        message: "License number is required.",
      }),
      agency: z.string().min(1, {
        message: "Agency or brokerage name is required.",
      }),
      years_experience: z.coerce.number().min(0, {
        message: "Years of experience must be a positive number.",
      }),
      bio: z.string().optional(),
    }),
  },

  landlord: {
    base: z.object({
      property_count: z.coerce.number().min(1, {
        message: "Number of properties must be at least 1.",
      }),
      years_experience: z.coerce.number().min(0, {
        message: "Years of experience must be a positive number.",
      }),
      management_type: z.enum(["self", "company", "hybrid"], {
        required_error: "Please select how you manage your properties.",
      }),
      preferred_tenant_criteria: z.string().optional(),
      bio: z.string().optional(),
    }),
  },
};

// Helper function to create a schema with common fields plus role-specific ones
/*
 * Generic in the role so the caller gets the schema for the role it asked for.
 * Typed as a plain union parameter this returned the union of all three, and
 * every field access on the parsed values was an error waiting for strict mode
 * to be switched on.
 */
export type ProfileRole = "tenant" | "agent" | "landlord";

type RoleSchemas = { [K in ProfileRole]: (typeof validationSchemas)[K] };

export function createProfileSchema<R extends ProfileRole>(
  role: R,
): RoleSchemas[R]["base"] {
  return validationSchemas[role].base;
}

// Helper function for validating form fields
export function validateField(schema: z.ZodType<any>, value: any): { success: boolean; error?: string } {
  const result = schema.safeParse(value);
  if (result.success) {
    return { success: true };
  } else {
    return { 
      success: false, 
      error: result.error.errors[0]?.message || "Invalid value" 
    };
  }
}
