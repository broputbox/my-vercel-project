import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Zap as AutomationIcon,
  Contact,
  Settings, 
  LogOut,
  Zap,
  Globe
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { icon: LayoutDashboard, label: 'Overview', path: '/' },
  { icon: Users, label: 'Leads', path: '/leads' },
  { icon: AutomationIcon, label: 'Automations', path: '/automations' },
  { icon: Contact, label: 'CRM', path: '/crm' },
  { icon: Globe, label: 'Website Builder', path: '/website-builder' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const displayName = user?.user_metadata?.business_name || user?.email?.split('@')[0] || 'User';
  const displayEmail = user?.email || 'user@email.com';

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center glow-effect">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg text-sidebar-foreground">AdSwift</h1>
            <p className="text-xs text-muted-foreground">Lead & Automation</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path === '/website-builder' && location.pathname.startsWith('/website-builder'));
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-primary font-semibold">
              {displayName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {displayName}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {displayEmail}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className="sidebar-link w-full text-destructive hover:bg-destructive/10"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
