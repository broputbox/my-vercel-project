import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, TrendingUp, Calendar, DollarSign, ArrowUpRight, ChevronRight, Zap, Mail, Phone } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { Lead } from '@/types/database';
import { format, subDays, startOfDay, startOfWeek, startOfMonth, isAfter } from 'date-fns';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['hsl(var(--primary))', 'hsl(262, 83%, 58%)', 'hsl(199, 89%, 48%)', 'hsl(142, 71%, 45%)'];

const Overview = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) {
      setLeads((data as Lead[]) || []);
    }
    setIsLoading(false);
  };

  // Calculate stats
  const today = startOfDay(new Date());
  const weekStart = startOfWeek(new Date());
  const monthStart = startOfMonth(new Date());

  const leadsToday = leads.filter(l => isAfter(new Date(l.created_at), today)).length;
  const leadsThisWeek = leads.filter(l => isAfter(new Date(l.created_at), weekStart)).length;
  const leadsThisMonth = leads.filter(l => isAfter(new Date(l.created_at), monthStart)).length;
  const totalLeads = leads.length;

  // Lead source breakdown
  const sourceBreakdown = leads.reduce((acc, lead) => {
    acc[lead.source] = (acc[lead.source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(sourceBreakdown).map(([name, value]) => ({ name, value }));

  // Chart data - last 7 days
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dayStart = startOfDay(date);
    const dayEnd = startOfDay(subDays(date, -1));
    const count = leads.filter(l => {
      const created = new Date(l.created_at);
      return created >= dayStart && created < dayEnd;
    }).length;
    return {
      date: format(date, 'EEE'),
      leads: count,
    };
  });

  // Recent leads
  const recentLeads = leads.slice(0, 5);

  const stats = [
    { label: 'Leads Today', value: leadsToday, icon: Users, color: 'bg-primary/20 text-primary' },
    { label: 'This Week', value: leadsThisWeek, icon: Calendar, color: 'bg-blue-500/20 text-blue-400' },
    { label: 'This Month', value: leadsThisMonth, icon: TrendingUp, color: 'bg-purple-500/20 text-purple-400' },
    { label: 'Total Leads', value: totalLeads, icon: Users, color: 'bg-green-500/20 text-green-400' },
  ];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">Overview</h1>
            <p className="text-muted-foreground">Your lead dashboard at a glance</p>
          </div>
          <Link to="/leads" className="btn-primary flex items-center gap-2">
            View All Leads
            <ArrowUpRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="glass-card p-6 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
              <p className="text-3xl font-bold text-foreground mb-1">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Lead Trend Chart */}
          <div className="lg:col-span-2 glass-card p-6">
            <h3 className="text-lg font-semibold mb-4">Lead Volume (Last 7 Days)</h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="leads"
                    stroke="hsl(var(--primary))"
                    fillOpacity={1}
                    fill="url(#colorLeads)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Source Breakdown */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold mb-4">Lead Sources</h3>
            {pieData.length > 0 ? (
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                No data yet
              </div>
            )}
            <div className="space-y-2 mt-4">
              {pieData.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span>{item.name}</span>
                  </div>
                  <span className="font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Leads & Quick Actions */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Leads */}
          <div className="lg:col-span-2 glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Recent Leads</h3>
              <Link to="/leads" className="text-sm text-primary hover:underline flex items-center gap-1">
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            
            {recentLeads.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No leads yet. They will appear here when received via your webhook.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="flex items-center justify-between p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-semibold">{lead.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-medium">{lead.name}</p>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          {lead.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {lead.email}
                            </span>
                          )}
                          {lead.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {lead.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        lead.status === 'New' ? 'bg-blue-500/20 text-blue-400' :
                        lead.status === 'Contacted' ? 'bg-yellow-500/20 text-yellow-400' :
                        lead.status === 'Won' ? 'bg-green-500/20 text-green-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {lead.status}
                      </span>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(lead.created_at), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                to="/automations"
                className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Set Up Automations</p>
                  <p className="text-sm text-muted-foreground">Create follow-up messages</p>
                </div>
              </Link>
              
              <Link
                to="/crm"
                className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="font-medium">Manage CRM</p>
                  <p className="text-sm text-muted-foreground">Tag and assign leads</p>
                </div>
              </Link>
              
              <Link
                to="/settings"
                className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="font-medium">Connect Integrations</p>
                  <p className="text-sm text-muted-foreground">Add SMS, Email, Ads</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Overview;
