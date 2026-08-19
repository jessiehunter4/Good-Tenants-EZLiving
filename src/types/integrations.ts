import type { Json } from "@/integrations/supabase/types";

/*
 * These mirror the integration tables. A column the database declares nullable
 * is `| null` here rather than optional: `?` says "this key may be missing",
 * which is a different claim from "this value may be absent", and only the
 * second is true of a row that came back from a query.
 */


export interface Integration {
  id: string;
  name: string;
  description: string | null;
  provider: string;
  integration_type: 'api' | 'webhook' | 'service';
  status: 'active' | 'inactive' | 'maintenance' | 'deprecated';
  config: Json;
  api_endpoint: string | null;
  requires_api_key: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  last_tested_at: string | null;
  test_result: 'success' | 'failed' | 'pending' | null;
}

export interface IntegrationRequest {
  id: string;
  requested_by: string;
  integration_name: string;
  provider_name: string;
  business_justification: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'approved' | 'in_development' | 'completed' | 'rejected';
  admin_notes: string | null;
  estimated_completion: string | null;
  created_at: string;
  updated_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  /*
   * Filled from an embed of `profiles`, which is what the requested_by foreign
   * key points at. It used to embed the `users` view and read a role off it;
   * the view has no foreign key, so PostgREST could not resolve the join and
   * the role was never rendered anyway.
   */
  user?: {
    email: string | null;
  };
}

export interface IntegrationUsage {
  id: string;
  integration_id: string;
  user_id: string | null;
  endpoint: string | null;
  request_count: number;
  success_count: number;
  error_count: number;
  avg_response_time: number | null;
  date: string;
  created_at: string;
}

export interface IntegrationAuditLog {
  id: string;
  integration_id: string;
  action: string;
  performed_by: string;
  details: Json;
  created_at: string;
  user?: {
    email: string | null;
  };
}
