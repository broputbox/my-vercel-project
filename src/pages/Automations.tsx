import { useState, useEffect } from 'react';
import { Plus, Mail, MessageSquare, Zap, Power, Trash2, Clock, Edit } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Automation } from '@/types/database';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

const templateExamples = {
  'Initial Reply': `Hi {{name}}! Thanks for reaching out about our services. We received your inquiry and will get back to you within 24 hours. If urgent, call us at {{business_phone}}.`,
  'Follow-Up 24h': `Hi {{name}}, just following up on your recent inquiry. Is there anything specific you'd like to know about our {{service}} services? We're here to help!`,
  'No Response Reminder': `Hi {{name}}, we haven't heard back from you. We'd love to help with your {{service}} needs. Let us know if you're still interested or have any questions!`,
};

const Automations = () => {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState<Automation | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'Email' as 'SMS' | 'Email',
    trigger: 'lead_received' as 'lead_received' | 'status_changed',
    template: '',
    delay_minutes: 0,
    is_active: true,
  });

  useEffect(() => {
    fetchAutomations();
  }, []);

  const fetchAutomations = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('automations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error', description: 'Failed to fetch automations', variant: 'destructive' });
    } else {
      setAutomations((data as Automation[]) || []);
    }
    setIsLoading(false);
  };

  const handleCreateOrUpdate = async () => {
    if (!formData.name || !formData.template) {
      toast({ title: 'Error', description: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (editingAutomation) {
      const { error } = await supabase
        .from('automations')
        .update(formData)
        .eq('id', editingAutomation.id);

      if (error) {
        toast({ title: 'Error', description: 'Failed to update automation', variant: 'destructive' });
      } else {
        toast({ title: 'Success', description: 'Automation updated' });
        fetchAutomations();
      }
    } else {
      const { error } = await supabase
        .from('automations')
        .insert({ ...formData, user_id: user.id });

      if (error) {
        toast({ title: 'Error', description: 'Failed to create automation', variant: 'destructive' });
      } else {
        toast({ title: 'Success', description: 'Automation created' });
        fetchAutomations();
      }
    }

    setIsCreateOpen(false);
    setEditingAutomation(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'Email',
      trigger: 'lead_received',
      template: '',
      delay_minutes: 0,
      is_active: true,
    });
  };

  const openEditModal = (automation: Automation) => {
    setEditingAutomation(automation);
    setFormData({
      name: automation.name,
      type: automation.type,
      trigger: automation.trigger,
      template: automation.template,
      delay_minutes: automation.delay_minutes,
      is_active: automation.is_active,
    });
    setIsCreateOpen(true);
  };

  const toggleAutomation = async (id: string, isActive: boolean) => {
    const { error } = await supabase
      .from('automations')
      .update({ is_active: isActive })
      .eq('id', id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to update automation', variant: 'destructive' });
    } else {
      setAutomations(automations.map(a => a.id === id ? { ...a, is_active: isActive } : a));
    }
  };

  const deleteAutomation = async (id: string) => {
    const { error } = await supabase
      .from('automations')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to delete automation', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Automation deleted' });
      setAutomations(automations.filter(a => a.id !== id));
    }
  };

  const applyTemplate = (templateName: string) => {
    const template = templateExamples[templateName as keyof typeof templateExamples];
    if (template) {
      setFormData({ ...formData, name: templateName, template });
    }
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">Automations</h1>
            <p className="text-muted-foreground">Create automated follow-ups for your leads</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={(open) => {
            setIsCreateOpen(open);
            if (!open) {
              setEditingAutomation(null);
              resetForm();
            }
          }}>
            <DialogTrigger asChild>
              <button className="btn-primary flex items-center gap-2">
                <Plus className="w-5 h-5" />
                New Automation
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingAutomation ? 'Edit Automation' : 'Create Automation'}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6 mt-4">
                {/* Quick Templates */}
                <div>
                  <p className="text-sm font-medium mb-3">Quick Templates</p>
                  <div className="flex gap-2 flex-wrap">
                    {Object.keys(templateExamples).map((name) => (
                      <Button
                        key={name}
                        variant="outline"
                        size="sm"
                        onClick={() => applyTemplate(name)}
                      >
                        {name}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Automation Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                    placeholder="e.g., Welcome Email"
                  />
                </div>

                {/* Type & Trigger */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Type</label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: 'SMS' | 'Email') => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Email">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            Email
                          </div>
                        </SelectItem>
                        <SelectItem value="SMS">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" />
                            SMS
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Trigger</label>
                    <Select
                      value={formData.trigger}
                      onValueChange={(value: 'lead_received' | 'status_changed') => setFormData({ ...formData, trigger: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lead_received">Lead Received</SelectItem>
                        <SelectItem value="status_changed">Status Changed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Delay */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Delay (minutes)</label>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    <input
                      type="number"
                      min="0"
                      value={formData.delay_minutes}
                      onChange={(e) => setFormData({ ...formData, delay_minutes: parseInt(e.target.value) || 0 })}
                      className="input-field w-32"
                    />
                    <span className="text-sm text-muted-foreground">
                      {formData.delay_minutes === 0 ? 'Immediately' : `${formData.delay_minutes} minutes after trigger`}
                    </span>
                  </div>
                </div>

                {/* Template */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Message Template</label>
                  <textarea
                    value={formData.template}
                    onChange={(e) => setFormData({ ...formData, template: e.target.value })}
                    className="input-field min-h-[150px]"
                    placeholder="Use placeholders: {{name}}, {{email}}, {{phone}}, {{service}}, {{business_phone}}"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Available placeholders: {'{{name}}'}, {'{{email}}'}, {'{{phone}}'}, {'{{service}}'}, {'{{business_phone}}'}
                  </p>
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateOrUpdate}>
                    {editingAutomation ? 'Save Changes' : 'Create Automation'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Info Card */}
        <div className="glass-card p-6 mb-6 border-l-4 border-l-primary">
          <div className="flex items-start gap-4">
            <Zap className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold mb-1">How Automations Work</h3>
              <p className="text-sm text-muted-foreground">
                Set up automated messages that trigger when new leads come in or when their status changes.
                Messages are generated using templates with placeholders for personalization.
                Connect your SMS or Email provider in Settings to send real messages.
              </p>
            </div>
          </div>
        </div>

        {/* Automations List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : automations.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Automations Yet</h3>
            <p className="text-muted-foreground mb-4">Create your first automation to start sending automated follow-ups.</p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Automation
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {automations.map((automation) => (
              <div key={automation.id} className="glass-card p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      automation.type === 'Email' ? 'bg-blue-500/20' : 'bg-green-500/20'
                    }`}>
                      {automation.type === 'Email' ? (
                        <Mail className="w-6 h-6 text-blue-400" />
                      ) : (
                        <MessageSquare className="w-6 h-6 text-green-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold">{automation.name}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          automation.is_active ? 'bg-green-500/20 text-green-400' : 'bg-muted text-muted-foreground'
                        }`}>
                          {automation.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Triggers on: <span className="text-foreground">{automation.trigger === 'lead_received' ? 'New Lead' : 'Status Change'}</span>
                        {automation.delay_minutes > 0 && (
                          <span> • Delay: {automation.delay_minutes} min</span>
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground line-clamp-2">{automation.template}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={automation.is_active}
                      onCheckedChange={(checked) => toggleAutomation(automation.id, checked)}
                    />
                    <Button variant="ghost" size="icon" onClick={() => openEditModal(automation)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteAutomation(automation.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Automations;
