
export interface Integration {
  id: string;
  name: string;
  description?: string;
  provider: string;
  integration_type: 'api' | 'webhook' | 'service';
  status: 'active' | 'inactive' | 'maintenance' | 'deprecated';
  config: Record<string, any>;
  api_endpoint?: string;
  requires_api_key: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  last_tested_at?: string;
  test_result?: 'success' | 'failed' | 'pending';
}

export interface IntegrationRequest {
  id: string;
  requested_by: string;
  integration_name: string;
  provider_name: string;
  business_justification: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'approved' | 'in_development' | 'completed' | 'rejected';
  admin_notes?: string;
  estimated_completion?: string;
  created_at: string;
  updated_at: string;
  reviewed_by?: string;
  reviewed_at?: string;
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
  user_id?: string;
  endpoint?: string;
  request_count: number;
  success_count: number;
  error_count: number;
  avg_response_time?: number;
  date: string;
  created_at: string;
}

export interface IntegrationAuditLog {
  id: string;
  integration_id: string;
  action: string;
  performed_by: string;
  details: Record<string, any>;
  created_at: string;
  user?: {
    email: string;
  };
}
