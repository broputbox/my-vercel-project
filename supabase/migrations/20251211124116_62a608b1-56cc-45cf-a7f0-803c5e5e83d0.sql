-- Create profiles table for business owner information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT,
  email TEXT,
  phone TEXT,
  webhook_url TEXT DEFAULT gen_random_uuid()::text,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create leads table
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  message TEXT,
  source TEXT DEFAULT 'Website',
  status TEXT DEFAULT 'New' CHECK (status IN ('New', 'Contacted', 'Won', 'Lost')),
  tag TEXT CHECK (tag IN ('Hot', 'Warm', 'Cold') OR tag IS NULL),
  assigned_to UUID REFERENCES auth.users(id),
  notes TEXT,
  custom_fields JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create team_members table
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create automations table
CREATE TABLE public.automations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('SMS', 'Email')),
  trigger TEXT NOT NULL CHECK (trigger IN ('lead_received', 'status_changed')),
  template TEXT NOT NULL,
  delay_minutes INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create lead_sources table for configuring sources
CREATE TABLE public.lead_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create api_keys table for integration settings
CREATE TABLE public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service TEXT NOT NULL,
  api_key TEXT,
  is_configured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for leads
CREATE POLICY "Users can view own leads" ON public.leads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own leads" ON public.leads FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own leads" ON public.leads FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own leads" ON public.leads FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for team_members
CREATE POLICY "Users can view own team" ON public.team_members FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert team members" ON public.team_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own team" ON public.team_members FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own team" ON public.team_members FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for automations
CREATE POLICY "Users can view own automations" ON public.automations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own automations" ON public.automations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own automations" ON public.automations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own automations" ON public.automations FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for lead_sources
CREATE POLICY "Users can view own sources" ON public.lead_sources FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sources" ON public.lead_sources FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sources" ON public.lead_sources FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sources" ON public.lead_sources FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for api_keys
CREATE POLICY "Users can view own api_keys" ON public.api_keys FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own api_keys" ON public.api_keys FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own api_keys" ON public.api_keys FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own api_keys" ON public.api_keys FOR DELETE USING (auth.uid() = user_id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, webhook_url)
  VALUES (NEW.id, NEW.email, gen_random_uuid()::text);
  
  -- Insert default lead sources
  INSERT INTO public.lead_sources (user_id, name) VALUES
    (NEW.id, 'Website'),
    (NEW.id, 'Ad Campaign'),
    (NEW.id, 'Landing Page'),
    (NEW.id, 'Manual Entry');
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for timestamp updates
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_automations_updated_at BEFORE UPDATE ON public.automations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_api_keys_updated_at BEFORE UPDATE ON public.api_keys FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();