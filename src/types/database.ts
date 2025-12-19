export interface Lead {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  message: string | null;
  source: string;
  status: 'New' | 'Contacted' | 'Won' | 'Lost';
  tag: 'Hot' | 'Warm' | 'Cold' | null;
  assigned_to: string | null;
  notes: string | null;
  custom_fields: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  business_name: string | null;
  email: string | null;
  phone: string | null;
  webhook_url: string;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

export interface Automation {
  id: string;
  user_id: string;
  name: string;
  type: 'SMS' | 'Email';
  trigger: 'lead_received' | 'status_changed';
  template: string;
  delay_minutes: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LeadSource {
  id: string;
  user_id: string;
  name: string;
  is_active: boolean;
  created_at: string;
}

export interface ApiKey {
  id: string;
  user_id: string;
  service: string;
  api_key: string | null;
  is_configured: boolean;
  created_at: string;
  updated_at: string;
}
