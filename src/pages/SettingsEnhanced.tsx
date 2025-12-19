import { useState, useEffect } from 'react';
import { User, Bell, Key, CreditCard, Copy, Check, Globe, Webhook, Power, Save, RefreshCw } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Profile, LeadSource, ApiKey } from '@/types/database';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const integrationServices = [
  { id: 'twilio', name: 'Twilio (SMS)', description: 'Send SMS messages to leads' },
  { id: 'sendgrid', name: 'SendGrid (Email)', description: 'Send automated emails' },
  { id: 'meta_ads', name: 'Meta Ads API', description: 'Track leads from Facebook/Instagram ads' },
  { id: 'mailgun', name: 'Mailgun', description: 'Alternative email provider' },
];

const SettingsEnhanced = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [leadSources, setLeadSources] = useState<LeadSource[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [newSourceName, setNewSourceName] = useState('');

  const [formData, setFormData] = useState({
    business_name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [profileRes, sourcesRes, keysRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('user_id', user.id).single(),
      supabase.from('lead_sources').select('*').eq('user_id', user.id).order('created_at'),
      supabase.from('api_keys').select('*').eq('user_id', user.id),
    ]);

    if (profileRes.data) {
      const p = profileRes.data as Profile;
      setProfile(p);
      setFormData({
        business_name: p.business_name || '',
        email: p.email || '',
        phone: p.phone || '',
      });
    }

    setLeadSources((sourcesRes.data as LeadSource[]) || []);
    setApiKeys((keysRes.data as ApiKey[]) || []);
    setIsLoading(false);
  };

  const saveProfile = async () => {
    if (!profile) return;
    setIsSaving(true);

    const { error } = await supabase
      .from('profiles')
      .update(formData)
      .eq('id', profile.id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to save profile', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Profile updated' });
      setProfile({ ...profile, ...formData });
    }
    setIsSaving(false);
  };

  const regenerateWebhook = async () => {
    if (!profile) return;

    const newWebhookUrl = crypto.randomUUID();
    const { error } = await supabase
      .from('profiles')
      .update({ webhook_url: newWebhookUrl })
      .eq('id', profile.id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to regenerate webhook', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Webhook URL regenerated' });
      setProfile({ ...profile, webhook_url: newWebhookUrl });
    }
  };

  const copyWebhook = () => {
    if (!profile) return;
    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || 'dsgdvirakfmplmyktakz';
    const fullUrl = `https://${projectId}.supabase.co/functions/v1/webhook-leads/${profile.webhook_url}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedWebhook(true);
    toast({ title: 'Copied!', description: 'Webhook URL copied to clipboard' });
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  const addLeadSource = async () => {
    if (!newSourceName.trim()) return;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('lead_sources')
      .insert({ user_id: user.id, name: newSourceName.trim() });

    if (error) {
      toast({ title: 'Error', description: 'Failed to add source', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Lead source added' });
      setNewSourceName('');
      fetchData();
    }
  };

  const toggleSource = async (sourceId: string, isActive: boolean) => {
    const { error } = await supabase
      .from('lead_sources')
      .update({ is_active: isActive })
      .eq('id', sourceId);

    if (error) {
      toast({ title: 'Error', description: 'Failed to update source', variant: 'destructive' });
    } else {
      setLeadSources(leadSources.map(s => s.id === sourceId ? { ...s, is_active: isActive } : s));
    }
  };

  const saveApiKey = async (service: string, apiKey: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const existing = apiKeys.find(k => k.service === service);

    if (existing) {
      const { error } = await supabase
        .from('api_keys')
        .update({ api_key: apiKey, is_configured: !!apiKey })
        .eq('id', existing.id);

      if (error) {
        toast({ title: 'Error', description: 'Failed to save API key', variant: 'destructive' });
      } else {
        toast({ title: 'Success', description: 'API key saved' });
        fetchData();
      }
    } else {
      const { error } = await supabase
        .from('api_keys')
        .insert({ user_id: user.id, service, api_key: apiKey, is_configured: !!apiKey });

      if (error) {
        toast({ title: 'Error', description: 'Failed to save API key', variant: 'destructive' });
      } else {
        toast({ title: 'Success', description: 'API key saved' });
        fetchData();
      }
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || 'dsgdvirakfmplmyktakz';
  const webhookUrl = profile ? `https://${projectId}.supabase.co/functions/v1/webhook-leads/${profile.webhook_url}` : '';

  return (
    <DashboardLayout>
      <div className="animate-fade-in max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your account and integration settings</p>
        </div>

        {/* Profile Section */}
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold">Business Profile</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium mb-2 block">Business Name</label>
              <input
                type="text"
                value={formData.business_name}
                onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                className="input-field"
                placeholder="Your Business Name"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-field"
                placeholder="contact@business.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input-field"
                placeholder="(555) 123-4567"
              />
            </div>
          </div>

          <Button onClick={saveProfile} disabled={isSaving} className="mt-4">
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>

        {/* Webhook Section */}
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Webhook className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-lg font-semibold">Webhook URL</h2>
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            Use this URL to receive leads from your website forms, call tracking, or booking systems.
          </p>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 bg-muted rounded-lg px-4 py-3 font-mono text-sm overflow-x-auto">
              {webhookUrl}
            </div>
            <Button variant="outline" onClick={copyWebhook}>
              {copiedWebhook ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>

          <Button variant="outline" onClick={regenerateWebhook}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Regenerate URL
          </Button>
        </div>

        {/* Lead Sources Section */}
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Globe className="w-5 h-5 text-purple-400" />
            </div>
            <h2 className="text-lg font-semibold">Lead Sources</h2>
          </div>

          <div className="space-y-3 mb-4">
            {leadSources.map((source) => (
              <div key={source.id} className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
                <span className="font-medium">{source.name}</span>
                <Switch
                  checked={source.is_active}
                  onCheckedChange={(checked) => toggleSource(source.id, checked)}
                />
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <input
              type="text"
              value={newSourceName}
              onChange={(e) => setNewSourceName(e.target.value)}
              className="input-field flex-1"
              placeholder="Add new source..."
            />
            <Button onClick={addLeadSource}>Add</Button>
          </div>
        </div>

        {/* API Keys Section */}
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
              <Key className="w-5 h-5 text-green-400" />
            </div>
            <h2 className="text-lg font-semibold">Integrations</h2>
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            Connect external services to enable SMS, email, and ads tracking functionality.
          </p>

          <div className="space-y-4">
            {integrationServices.map((service) => {
              const existingKey = apiKeys.find(k => k.service === service.id);
              return (
                <div key={service.id} className="flex items-center justify-between bg-muted/50 rounded-lg p-4">
                  <div>
                    <p className="font-medium">{service.name}</p>
                    <p className="text-sm text-muted-foreground">{service.description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      existingKey?.is_configured 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {existingKey?.is_configured ? 'Connected' : 'Not configured'}
                    </span>
                    <ApiKeyDialog
                      service={service}
                      currentKey={existingKey?.api_key || ''}
                      onSave={(key) => saveApiKey(service.id, key)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

// API Key Dialog Component
const ApiKeyDialog = ({ 
  service, 
  currentKey, 
  onSave 
}: { 
  service: { id: string; name: string; description: string };
  currentKey: string;
  onSave: (key: string) => void;
}) => {
  const [apiKey, setApiKey] = useState(currentKey);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Configure</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configure {service.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <p className="text-sm text-muted-foreground">{service.description}</p>
          <div>
            <label className="text-sm font-medium mb-2 block">API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="input-field"
              placeholder="Enter your API key"
            />
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={() => {
                onSave(apiKey);
                setIsOpen(false);
              }} 
              className="flex-1"
            >
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsEnhanced;
