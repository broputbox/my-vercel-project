import { useState, useEffect } from 'react';
import { formatDistanceToNow, format, subDays, isAfter } from 'date-fns';
import { Search, Filter, Download, Mail, Phone, Globe, Megaphone, FileText, HelpCircle, Copy, Check, ChevronDown, X, Plus, Pencil } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Lead } from '@/types/database';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const sourceIcons: Record<string, any> = {
  Website: Globe,
  'Ad Campaign': Megaphone,
  'Landing Page': FileText,
  'Manual Entry': Plus,
  Other: HelpCircle,
};

const sourceColors: Record<string, string> = {
  Website: 'bg-blue-500/20 text-blue-400',
  'Ad Campaign': 'bg-primary/20 text-primary',
  'Landing Page': 'bg-purple-500/20 text-purple-400',
  'Manual Entry': 'bg-green-500/20 text-green-400',
  Other: 'bg-muted text-muted-foreground',
};

const statusColors: Record<string, string> = {
  New: 'bg-blue-500/20 text-blue-400',
  Contacted: 'bg-yellow-500/20 text-yellow-400',
  Won: 'bg-green-500/20 text-green-400',
  Lost: 'bg-red-500/20 text-red-400',
};

const tagColors: Record<string, string> = {
  Hot: 'bg-red-500/20 text-red-400',
  Warm: 'bg-orange-500/20 text-orange-400',
  Cold: 'bg-cyan-500/20 text-cyan-400',
};

const LeadsEnhanced = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editNotes, setEditNotes] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  useEffect(() => {
    fetchLeads();
    fetchWebhookUrl()
    ;
  }, []);
  useEffect(() => {
    const channel = supabase
      .channel('leads-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'leads'
        },
        (payload) => {
          console.log('New lead live:', payload.new);
          setLeads((currentLeads) => [payload.new as Lead, ...currentLeads]);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Realtime subscribed successfully');
        } else if (status === 'CLOSED') {
          console.log('Realtime closed');
        } else if (status === 'CHANNEL_ERROR') {
          console.log('Realtime error');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  const fetchWebhookUrl = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('webhook_url')
      .eq('user_id', user.id)
      .single();

    if (profile?.webhook_url) {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || 'dsgdvirakfmplmyktakz';
      setWebhookUrl(`https://${projectId}.supabase.co/functions/v1/webhook-leads/${profile.webhook_url}`);
    }
  };

  const fetchLeads = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error', description: 'Failed to fetch leads', variant: 'destructive' });
    } else {
      setLeads((data as Lead[]) || []);
    }
    setIsLoading(false);
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (lead.message?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesSource = sourceFilter === 'all' || lead.source === sourceFilter;
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    
    let matchesDate = true;
    if (dateRange.from) {
      matchesDate = isAfter(new Date(lead.created_at), dateRange.from);
    }
    if (dateRange.to && matchesDate) {
      matchesDate = new Date(lead.created_at) <= dateRange.to;
    }
    
    return matchesSearch && matchesSource && matchesStatus && matchesDate;
  });

  const copyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedWebhook(true);
    toast({ title: 'Webhook URL copied!', description: 'Use this URL to send leads to your dashboard.' });
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  const updateLeadStatus = async (leadId: string, status: string) => {
    const { error } = await supabase
      .from('leads')
      .update({ status })
      .eq('id', leadId);

    if (error) {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    } else {
      setLeads(leads.map(l => l.id === leadId ? { ...l, status: status as Lead['status'] } : l));
      if (selectedLead?.id === leadId) {
        setSelectedLead({ ...selectedLead, status: status as Lead['status'] });
      }
      toast({ title: 'Success', description: 'Lead status updated' });
    }
  };

  const updateLeadNotes = async () => {
    if (!selectedLead) return;

    const { error } = await supabase
      .from('leads')
      .update({ notes: editNotes })
      .eq('id', selectedLead.id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to update notes', variant: 'destructive' });
    } else {
      setLeads(leads.map(l => l.id === selectedLead.id ? { ...l, notes: editNotes } : l));
      setSelectedLead({ ...selectedLead, notes: editNotes });
      toast({ title: 'Success', description: 'Notes updated' });
    }
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Message', 'Source', 'Status', 'Date'];
    const csvContent = [
      headers.join(','),
      ...filteredLeads.map(lead => [
        `"${lead.name}"`,
        `"${lead.email || ''}"`,
        `"${lead.phone || ''}"`,
        `"${lead.message?.replace(/"/g, '""') || ''}"`,
        `"${lead.source}"`,
        `"${lead.status}"`,
        `"${format(new Date(lead.created_at), 'yyyy-MM-dd HH:mm')}"`,
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast({ title: 'Success', description: 'Leads exported to CSV' });
  };

  const openLeadDetail = (lead: Lead) => {
    setSelectedLead(lead);
    setEditNotes(lead.notes || '');
    setIsDetailOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">Leads</h1>
            <p className="text-muted-foreground">Manage and track all your incoming leads</p>
          </div>
          <button onClick={exportToCSV} className="btn-secondary flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export CSV
          </button>
        </div>

        {/* Webhook URL Card */}
        <div className="glass-card p-6 mb-6">
          <h3 className="font-display font-semibold mb-2">Your Webhook URL</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Send form submissions, call tracking events, or booking requests to this URL to automatically capture leads.
          </p>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-muted rounded-lg px-4 py-3 font-mono text-sm text-foreground overflow-x-auto">
              {webhookUrl || 'Loading...'}
            </div>
            <button
              onClick={copyWebhook}
              disabled={!webhookUrl}
              className="btn-secondary flex items-center gap-2 whitespace-nowrap"
            >
              {copiedWebhook ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              {copiedWebhook ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

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
          
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Sources" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="Website">Website</SelectItem>
              <SelectItem value="Ad Campaign">Ad Campaign</SelectItem>
              <SelectItem value="Landing Page">Landing Page</SelectItem>
              <SelectItem value="Manual Entry">Manual Entry</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="New">New</SelectItem>
              <SelectItem value="Contacted">Contacted</SelectItem>
              <SelectItem value="Won">Won</SelectItem>
              <SelectItem value="Lost">Lost</SelectItem>
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[200px] justify-start text-left font-normal">
                <Filter className="mr-2 h-4 w-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    `${format(dateRange.from, 'LLL dd')} - ${format(dateRange.to, 'LLL dd')}`
                  ) : (
                    format(dateRange.from, 'LLL dd, y')
                  )
                ) : (
                  'Date Range'
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                selected={dateRange}
                onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                numberOfMonths={2}
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>

          {(dateRange.from || dateRange.to) && (
            <Button variant="ghost" size="icon" onClick={() => setDateRange({ from: undefined, to: undefined })}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Leads Table */}
        <div className="glass-card overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No leads found. They will appear here when received via your webhook.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Name</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Contact</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Message</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Source</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredLeads.map((lead, index) => {
                    const SourceIcon = sourceIcons[lead.source] || sourceIcons.Other;
                    return (
                      <tr
                        key={lead.id}
                        onClick={() => openLeadDetail(lead)}
                        className="hover:bg-muted/30 transition-colors cursor-pointer animate-fade-in"
                        style={{ animationDelay: `${index * 0.03}s` }}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-primary font-semibold">{lead.name.charAt(0)}</span>
                            </div>
                            <div>
                              <span className="font-medium text-foreground">{lead.name}</span>
                              {lead.tag && (
                                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${tagColors[lead.tag]}`}>
                                  {lead.tag}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            {lead.email && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Mail className="w-4 h-4" />
                                {lead.email}
                              </div>
                            )}
                            {lead.phone && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Phone className="w-4 h-4" />
                                {lead.phone}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-muted-foreground max-w-xs truncate">
                            {lead.message || '-'}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${sourceColors[lead.source] || sourceColors.Other}`}>
                            <SourceIcon className="w-3 h-3" />
                            {lead.source}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[lead.status]}`}>
                            {lead.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <p className="text-foreground">{formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}</p>
                            <p className="text-muted-foreground text-xs">{format(new Date(lead.created_at), 'MMM d, h:mm a')}</p>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Lead Detail Modal */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-bold text-xl">{selectedLead?.name.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-xl font-semibold">{selectedLead?.name}</p>
                  <p className="text-sm text-muted-foreground font-normal">
                    Lead from {selectedLead?.source}
                  </p>
                </div>
              </DialogTitle>
            </DialogHeader>

            {selectedLead && (
              <div className="space-y-6 mt-4">
                {/* Contact Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedLead.email || 'Not provided'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{selectedLead.phone || 'Not provided'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Received</p>
                    <p className="font-medium">{format(new Date(selectedLead.created_at), 'PPpp')}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Select
                      value={selectedLead.status}
                      onValueChange={(value) => updateLeadStatus(selectedLead.id, value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="New">New</SelectItem>
                        <SelectItem value="Contacted">Contacted</SelectItem>
                        <SelectItem value="Won">Won</SelectItem>
                        <SelectItem value="Lost">Lost</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Message */}
                {selectedLead.message && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Message</p>
                    <p className="bg-muted/50 rounded-lg p-4">{selectedLead.message}</p>
                  </div>
                )}

                {/* Notes */}
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Internal Notes</p>
                  <textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    className="input-field min-h-[100px]"
                    placeholder="Add notes about this lead..."
                  />
                  <Button onClick={updateLeadNotes} size="sm">
                    <Pencil className="w-4 h-4 mr-2" />
                    Save Notes
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default LeadsEnhanced;
