import type { LucideIcon } from "lucide-react";
import { Building2, Home, Users } from "lucide-react";

import agentScene from "@/assets/roles/scene-agent.svg";
import landlordScene from "@/assets/roles/scene-landlord.svg";
import tenantScene from "@/assets/roles/scene-tenant.svg";

// Administrator is deliberately absent. Admin is granted server-side only; it
// was previously self-assignable behind a registration code that could never
// validate. See AuthContext.SELF_ASSIGNABLE_ROLES and the platform baseline
// migration, where the database stops trusting this value entirely.
export const SIGNUP_ROLES = ["tenant", "landlord", "agent"] as const;
export type SignupRole = (typeof SIGNUP_ROLES)[number];

export interface RoleOption {
  value: SignupRole;
  /** Card heading. */
  title: string;
  /** One line on what this account is for. */
  blurb: string;
  /** Button label. Names the role, so the choice is legible out of context. */
  cta: string;
  /** What the next step asks for, shown once the role is chosen. */
  next: string;
  scene: string;
  icon: LucideIcon;
  /** Circular badge overlapping the artwork. */
  badgeClass: string;
  buttonClass: string;
  ringClass: string;
}

export const ROLE_OPTIONS: readonly RoleOption[] = [
  {
    value: "tenant",
    title: "Renting a home",
    blurb:
      "Build one profile, prove you qualify once, and reuse it for every property you look at.",
    cta: "Continue as a tenant",
    next: "Tell us your budget, your timing, and where you want to live.",
    scene: tenantScene,
    icon: Home,
    badgeClass: "border-role-tenant bg-canvas-elevated text-role-tenant",
    buttonClass: "bg-role-tenant text-role-tenant-foreground hover:bg-role-tenant/90",
    ringClass: "hover:ring-role-tenant/60",
  },
  {
    value: "landlord",
    title: "Letting property",
    blurb:
      "List what you own and meet renters who already meet your criteria before the first viewing.",
    cta: "Continue as a landlord",
    next: "Tell us how many properties you have and how you manage them.",
    scene: landlordScene,
    icon: Building2,
    badgeClass: "border-role-landlord bg-canvas-elevated text-role-landlord",
    buttonClass: "bg-role-landlord text-role-landlord-foreground hover:bg-role-landlord/90",
    ringClass: "hover:ring-role-landlord/60",
  },
  {
    value: "agent",
    title: "Representing clients",
    blurb:
      "Work both sides of a lease with verified tenant profiles and your listings in one place.",
    cta: "Continue as an agent",
    next: "Tell us your agency and licence details.",
    scene: agentScene,
    icon: Users,
    badgeClass: "border-role-agent bg-canvas-elevated text-role-agent",
    buttonClass: "bg-role-agent text-role-agent-foreground hover:bg-role-agent/90",
    ringClass: "hover:ring-role-agent/60",
  },
] as const;

export function isSignupRole(value: string | null | undefined): value is SignupRole {
  return typeof value === "string" && (SIGNUP_ROLES as readonly string[]).includes(value);
}

export function findRole(value: SignupRole | undefined): RoleOption | undefined {
  return ROLE_OPTIONS.find((option) => option.value === value);
}
