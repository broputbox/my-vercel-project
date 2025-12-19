import { useState, useEffect } from 'react';
import { Users, Tag, UserPlus, Download, Filter, Search, Flame, Thermometer, Snowflake } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Lead, TeamMember } from '@/types/database';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

const tagConfig = {
  Hot: { icon: Flame, color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  Warm: { icon: Thermometer, color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  Cold: { icon: Snowflake, color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
};

const CRM = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [tagFilter, setTagFilter] = useState('all');
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', email: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    
    const [leadsResponse, teamResponse] = await Promise.all([
      supabase.from('leads').select('*').order('created_at', { ascending: false }),
      supabase.from('team_members').select('*').order('created_at', { ascending: false }),
    ]);

    if (leadsResponse.error) {
      toast({ title: 'Error', description: 'Failed to fetch leads', variant: 'destructive' });
    } else {
      setLeads((leadsResponse.data as Lead[]) || []);
    }

    if (!teamResponse.error) {
      setTeamMembers((teamResponse.data as TeamMember[]) || []);
    }

    setIsLoading(false);
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesTag = tagFilter === 'all' || lead.tag === tagFilter;
    return matchesSearch && matchesTag;
  });

  const updateLeadTag = async (leadId: string, tag: string | null) => {
    const { error } = await supabase
      .from('leads')
      .update({ tag })
      .eq('id', leadId);

    if (error) {
      toast({ title: 'Error', description: 'Failed to update tag', variant: 'destructive' });
    } else {
      setLeads(leads.map(l => l.id === leadId ? { ...l, tag: tag as Lead['tag'] } : l));
      toast({ title: 'Success', description: 'Tag updated' });
    }
  };

  const assignLead = async (leadId: string, assignedTo: string | null) => {
    const { error } = await supabase
      .from('leads')
      .update({ assigned_to: assignedTo })
      .eq('id', leadId);

    if (error) {
      toast({ title: 'Error', description: 'Failed to assign lead', variant: 'destructive' });
    } else {
      setLeads(leads.map(l => l.id === leadId ? { ...l, assigned_to: assignedTo } : l));
      toast({ title: 'Success', description: 'Lead assigned' });
    }
  };

  const addTeamMember = async () => {
    if (!newMember.name || !newMember.email) {
      toast({ title: 'Error', description: 'Please fill in all fields', variant: 'destructive' });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('team_members')
      .insert({ ...newMember, user_id: user.id });

    if (error) {
      toast({ title: 'Error', description: 'Failed to add team member', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Team member added' });
      setIsAddMemberOpen(false);
      setNewMember({ name: '', email: '' });
      fetchData();
    }
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Tag', 'Status', 'Source', 'Date'];
    const csvContent = [
      headers.join(','),
      ...filteredLeads.map(lead => [
        `"${lead.name}"`,
        `"${lead.email || ''}"`,
        `"${lead.phone || ''}"`,
        `"${lead.tag || ''}"`,
        `"${lead.status}"`,
        `"${lead.source}"`,
        `"${format(new Date(lead.created_at), 'yyyy-MM-dd HH:mm')}"`,
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crm-leads-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast({ title: 'Success', description: 'Leads exported to CSV' });
  };

  // Stats
  const hotLeads = leads.filter(l => l.tag === 'Hot').length;
  const warmLeads = leads.filter(l => l.tag === 'Warm').length;
  const coldLeads = leads.filter(l => l.tag === 'Cold').length;

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">CRM</h1>
            <p className="text-muted-foreground">Tag, assign, and manage your leads</p>
          </div>
          <div className="flex items-center gap-3">
            <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Team Member
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Team Member</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Name</label>
                    <input
                      type="text"
                      value={newMember.name}
                      onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                      className="input-field"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Email</label>
                    <input
                      type="email"
                      value={newMember.email}
                      onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                      className="input-field"
                      placeholder="john@company.com"
                    />
                  </div>
                  <Button onClick={addTeamMember} className="w-full">
                    Add Member
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button onClick={exportToCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="glass-card p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                <Flame className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{hotLeads}</p>
                <p className="text-sm text-muted-foreground">Hot Leads</p>
              </div>
            </div>
          </div>
          <div className="glass-card p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                <Thermometer className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{warmLeads}</p>
                <p className="text-sm text-muted-foreground">Warm Leads</p>
              </div>
            </div>
          </div>
          <div className="glass-card p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                <Snowflake className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{coldLeads}</p>
                <p className="text-sm text-muted-foreground">Cold Leads</p>
              </div>
            </div>
          </div>
        </div>

        {/* Team Members */}
        {teamMembers.length > 0 && (
          <div className="glass-card p-6 mb-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Team Members ({teamMembers.length})
            </h3>
            <div className="flex flex-wrap gap-3">
              {teamMembers.map((member) => (
                <div key={member.id} className="flex items-center gap-2 bg-muted/50 rounded-full px-4 py-2">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-primary font-semibold text-sm">{member.name.charAt(0)}</span>
                  </div>
                  <span className="text-sm font-medium">{member.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-12"
            />
          </div>
          <Select value={tagFilter} onValueChange={setTagFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Tags" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tags</SelectItem>
              <SelectItem value="Hot">Hot</SelectItem>
              <SelectItem value="Warm">Warm</SelectItem>
              <SelectItem value="Cold">Cold</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Leads Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Tag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Leads Found</h3>
            <p className="text-muted-foreground">Leads will appear here once they come in via your webhook.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredLeads.map((lead) => {
              const TagIcon = lead.tag ? tagConfig[lead.tag].icon : null;
              return (
                <div key={lead.id} className="glass-card p-6 hover:border-primary/30 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-bold text-lg">{lead.name.charAt(0)}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold">{lead.name}</h3>
                        <p className="text-sm text-muted-foreground">{lead.email || 'No email'}</p>
                      </div>
                    </div>
                    {TagIcon && (
                      <div className={`px-2 py-1 rounded-full text-xs font-medium border ${tagConfig[lead.tag!].color}`}>
                        <TagIcon className="w-3 h-3 inline mr-1" />
                        {lead.tag}
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    {/* Tag Selector */}
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Tag</label>
                      <Select
                        value={lead.tag || 'none'}
                        onValueChange={(value) => updateLeadTag(lead.id, value === 'none' ? null : value)}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Set tag" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No Tag</SelectItem>
                          <SelectItem value="Hot">🔥 Hot</SelectItem>
                          <SelectItem value="Warm">🌡️ Warm</SelectItem>
                          <SelectItem value="Cold">❄️ Cold</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Assign Selector */}
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Assign To</label>
                      <Select
                        value={lead.assigned_to || 'unassigned'}
                        onValueChange={(value) => assignLead(lead.id, value === 'unassigned' ? null : value)}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Assign to..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unassigned">Unassigned</SelectItem>
                          {teamMembers.map((member) => (
                            <SelectItem key={member.id} value={member.id}>
                              {member.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Notes Preview */}
                    {lead.notes && (
                      <div className="bg-muted/50 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground mb-1">Notes</p>
                        <p className="text-sm line-clamp-2">{lead.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CRM;
