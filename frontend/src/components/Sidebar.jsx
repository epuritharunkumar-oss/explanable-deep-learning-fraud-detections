import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  SearchCheck, 
  FileSpreadsheet, 
  Receipt, 
  AlertTriangle, 
  BrainCircuit, 
  BarChart3, 
  FileText, 
  Cpu, 
  User, 
  Settings, 
  LogOut,
  Shield
} from 'lucide-react';

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Analyze Transaction', path: '/analyze', icon: SearchCheck },
    { name: 'Batch Analysis', path: '/batch', icon: FileSpreadsheet },
    { name: 'Transactions', path: '/transactions', icon: Receipt },
    { name: 'Fraud Alerts', path: '/alerts', icon: AlertTriangle, badge: '3' },
    { name: 'Explainable AI', path: '/explainable-ai', icon: BrainCircuit },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Reports', path: '/reports', icon: FileText },
    { name: 'Model Details', path: '/model-info', icon: Cpu },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-navy-900 border-r border-slate-800/80 min-h-[calc(100vh-61px)] flex flex-col justify-between p-4 hidden md:flex">
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-blue to-brand-cyan flex items-center justify-center shadow-lg shadow-brand-blue/20">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-tight text-white">
              FraudShield<span className="text-brand-cyan">.AI</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-medium">Banking Fraud Guard v2.4</p>
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-brand-blue text-white shadow-md shadow-brand-blue/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-navy-800/60'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 rounded-md bg-brand-rose/20 text-brand-rose text-[10px] font-bold">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="pt-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-brand-rose hover:bg-brand-rose/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
