/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./authContext";
import { DisasterReport, SOSAlert, UserRole, ResourceItem } from "./types";
import { 
  AlertTriangle, 
  MapPin, 
  Shield, 
  Users, 
  Bell, 
  LogOut, 
  Send, 
  Heart, 
  Search, 
  Clock,
  Package,
  Activity,
  User as UserIcon,
  PhoneCall
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { predictDisasterRisk } from "./services/geminiService";

// --- Components ---

function Navbar() {
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <header className="h-16 bg-slate-900 text-white flex items-center justify-between px-6 shadow-md shrink-0 sticky top-0 z-50 font-sans">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-xl font-semibold tracking-tight uppercase">VANGUARD <span className="text-slate-400 font-normal normal-case ml-2 text-sm italic">Disaster Response & Recovery</span></h1>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 px-3 py-1 bg-slate-800 rounded-full border border-slate-700">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
          <span className="text-[10px] font-mono font-medium uppercase tracking-wider">System Live: {user.role}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold">{user.name}</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-tighter">Emergency Operations Center</p>
          </div>
          <button 
            onClick={logout}
            className="w-10 h-10 rounded-full bg-slate-700 border-2 border-slate-600 flex items-center justify-center hover:bg-slate-600 transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5 text-white/70" />
          </button>
        </div>
      </div>
    </header>
  );
}

function AuthScreen() {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>("USER");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password, name, role);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-xl"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-100">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-2 uppercase">VANGUARD</h1>
          <p className="text-slate-500 font-medium tracking-tight">
            {isLogin ? "Global Operations Login" : "Initialize New Command Profile"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-widest pl-1">Full Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none transition-all text-sm font-medium"
                  placeholder="Commander Name"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-widest pl-1">Operational Domain</label>
                <select 
                  value={role} 
                  onChange={e => setRole(e.target.value as UserRole)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none text-sm font-bold"
                >
                  <option value="USER">Civic User Interface</option>
                  <option value="RESCUE_TEAM">Rescue Ops Console</option>
                  <option value="ADMIN">Global Command Center</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-widest pl-1">Command Identity</label>
            <input 
              type="text" 
              value={email} 
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none transition-all text-sm font-medium"
              placeholder="e.g. user@test.com or admin123"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-widest pl-1">Access Key</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none transition-all text-sm font-medium"
              placeholder="••••••••"
              required
            />
          </div>

          {error && <p className="text-xs font-bold text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-slate-900 text-white font-black uppercase text-xs tracking-widest rounded-xl hover:bg-slate-800 disabled:bg-slate-300 transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            {loading ? "Processing..." : isLogin ? "Authorize Access" : "Create Profile"}
          </button>
        </form>

        <p className="mt-8 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          {isLogin ? "New to the Vanguard network?" : "Profile already exists?"}
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="ml-2 text-blue-600 hover:underline"
          >
            {isLogin ? "Initialize Registration" : "Return to Login"}
          </button>
        </p>
      </motion.div>
    </div>
  );
}

const getCurrentLocation = (): Promise<{ lat: number; lng: number }> => {
  return new Promise((resolve) => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve({ lat: 0, lng: 0 }),
        { timeout: 5000 }
      );
    } else {
      resolve({ lat: 0, lng: 0 });
    }
  });
};

// --- Views ---

function UserDashboard() {
  const { user, socket } = useAuth();
  const [reports, setReports] = useState<DisasterReport[]>([]);
  const [sosActive, setSosActive] = useState(false);
  const [form, setForm] = useState({
    location: "",
    type: "Flood",
    description: ""
  });
  const [prediction, setPrediction] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/disasters")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setReports(data.filter((r: any) => r.userId === user?.id));
        } else {
          setReports([]);
        }
      })
      .catch(() => setReports([]));

    if (socket) {
      socket.on("disaster-update", (updatedReport: DisasterReport) => {
        setReports(prev => prev.map(r => r.id === updatedReport.id ? updatedReport : r));
      });
    }
  }, [user, socket]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // AI Risk Prediction
    const aiRisk = await predictDisasterRisk(form.location, form.type);
    setPrediction(aiRisk);

    const coords = await getCurrentLocation();

    const reportData = {
      userId: user?.id,
      location: { address: form.location, ...coords },
      disasterType: form.type,
      description: form.description,
      riskLevel: aiRisk?.riskLevel || 'MEDIUM',
      resourcesReq: aiRisk?.suggestedResources || [],
      status: 'REPORTED'
    };

    const res = await fetch("/api/disasters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reportData)
    });

    if (res.ok) {
      const newReport = await res.json();
      setReports([newReport, ...reports]);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    }
    setLoading(false);
  };

  const handleSOS = async () => {
    setSosActive(true);
    const coords = await getCurrentLocation();
    await fetch("/api/sos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user?.id,
        location: coords,
        missingPersonName: user?.name,
        status: 'ACTIVE'
      })
    });
    setTimeout(() => setSosActive(false), 30000); // UI visual timeout
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 font-sans">
      <AnimatePresence>
        {success && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-emerald-600 text-white p-4 rounded-xl shadow-xl flex items-center justify-center gap-3 font-black uppercase text-xs tracking-widest fixed top-20 left-1/2 -translate-x-1/2 z-[60]"
          >
            <Shield className="w-4 h-4" /> Signal Successfully Committed
          </motion.div>
        )}
      </AnimatePresence>

      {/* Risk Assessment Prediction Panel */}
      {prediction && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`p-6 rounded-2xl border overflow-hidden shadow-sm ${
            prediction.riskLevel === 'CRITICAL' ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'
          }`}
        >
          <div className="flex items-start gap-5">
            <div className={`p-4 rounded-xl ${prediction.riskLevel === 'CRITICAL' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'}`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">AI Predictive Insight: {prediction.riskLevel}</h2>
                <p className="text-slate-600 font-medium leading-relaxed">{prediction.primarySafetyAdvice}</p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white/80 backdrop-blur p-4 rounded-xl shadow-sm border border-slate-100">
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Autonomous Safety Plan</span>
                  <p className="text-xs font-semibold text-slate-700 leading-relaxed mt-2 italic">"{prediction.escapePlan}"</p>
                </div>
                <div className="bg-white/80 backdrop-blur p-4 rounded-xl shadow-sm border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recommended Inventory</span>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {prediction.suggestedResources.map((res: string) => (
                      <span key={res} className="px-2 py-0.5 bg-slate-100 text-[9px] font-bold text-slate-600 rounded uppercase tracking-tighter border border-slate-200">{res}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-12 gap-8 items-start">
        {/* Report Form */}
        <section className="col-span-12 lg:col-span-7 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Incident Dispatch</p>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight lowercase">New Disaster Report</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-wider">Incident Path</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    value={form.location}
                    onChange={e => setForm({...form, location: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none transition-all text-sm font-medium"
                    placeholder="Sector / Zone / Landmark"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-wider">Anomaly Category</label>
                <select 
                  value={form.type}
                  onChange={e => setForm({...form, type: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none text-sm font-bold"
                >
                  <option>Flood</option>
                  <option>Earthquake</option>
                  <option>Fire</option>
                  <option>Storm</option>
                  <option>Landslide</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-wider">Observation Intel</label>
              <textarea 
                value={form.description}
                onChange={e => setForm({...form, description: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none h-32 text-sm font-medium leading-relaxed"
                placeholder="Specify population at risk, blockage status, environment shifts..."
                required
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 bg-slate-900 text-white font-black uppercase text-xs tracking-widest rounded-xl hover:bg-slate-800 disabled:bg-slate-300 transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              {loading ? <Clock className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {loading ? "Neural Assessment in Progress..." : "Commit Signal to Vanguard"}
            </button>
          </form>
        </section>

        {/* Status & SOS */}
        <div className="col-span-12 lg:col-span-5 space-y-8">
          <section className="bg-red-600 p-8 rounded-2xl shadow-xl shadow-red-100 space-y-5 text-white overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12 group-hover:rotate-45 transition-transform duration-700">
              <Shield className="w-32 h-32" />
            </div>
            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="bg-white/20 p-2 rounded-lg">
                  <PhoneCall className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black bg-white text-red-600 px-2 py-1 rounded-full uppercase tracking-widest">Protocol SOS</span>
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight leading-tight uppercase">Emergency Beacon</h2>
                <p className="text-red-100 text-xs font-semibold leading-relaxed mt-1">Life-critical situation tracking. Broadcasts biometric location data to all available rescue assets.</p>
              </div>
              <button 
                onClick={handleSOS}
                className={`w-full py-5 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
                  sosActive ? 'bg-white text-red-600 scale-95 shadow-inner' : 'bg-red-500 text-white hover:bg-red-400 shadow-md active:bg-red-700'
                }`}
              >
                <div className={`w-3 h-3 rounded-full ${sosActive ? 'bg-red-600 animate-ping' : 'bg-white'}`}></div>
                <span className="text-xl font-black uppercase tracking-tighter">{sosActive ? 'BEACON ACTIVE' : 'TRANSMIT SOS'}</span>
                <span className="text-[10px] opacity-70 font-bold uppercase tracking-widest">Sector 4 Sat-Link</span>
              </button>
            </div>
          </section>

          <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-sm font-black text-slate-900 border-b border-slate-50 pb-4 flex items-center gap-2 uppercase tracking-tight">
              <Clock className="w-4 h-4 text-slate-400" />
              Incident Registry
            </h3>
            <div className="space-y-3">
              {reports.length === 0 ? (
                <div className="text-center py-10 opacity-30">
                  <Search className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-xs font-bold uppercase">No Active Signals</p>
                </div>
              ) : (
                reports.map(report => (
                  <div key={report.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center group cursor-pointer hover:bg-white hover:shadow-md transition-all">
                    <div>
                      <div className="flex items-center gap-2">
                         <span className="text-xs font-black text-slate-900 uppercase">{report.disasterType}</span>
                         <span className={`text-[8px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest ${
                           report.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-700' :
                           report.status === 'ASSIGNED' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                         }`}>
                           {report.status}
                         </span>
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">{report.location.address}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Clock className="w-4 h-4 text-slate-300" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function RescueDashboard() {
  const { user, socket } = useAuth();
  const [disasters, setDisasters] = useState<DisasterReport[]>([]);
  const [sosAlerts, setSosAlerts] = useState<SOSAlert[]>([]);
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [activeNotification, setActiveNotification] = useState<any>(null);

  useEffect(() => {
    fetch("/api/disasters").then(res => res.json()).then(data => Array.isArray(data) ? setDisasters(data) : setDisasters([]));
    fetch("/api/sos").then(res => res.json()).then(data => Array.isArray(data) ? setSosAlerts(data) : setSosAlerts([]));
    fetch("/api/resources").then(res => res.json()).then(data => Array.isArray(data) ? setResources(data) : setResources([]));

    if (socket) {
      socket.on("new-disaster", (report: DisasterReport) => {
        setDisasters(prev => [report, ...prev]);
        setActiveNotification({ type: 'DISASTER', data: report });
      });

      socket.on("new-sos", (sos: SOSAlert) => {
        setSosAlerts(prev => [sos, ...prev]);
        setActiveNotification({ type: 'SOS', data: sos });
      });
    }
  }, [socket]);

  const handleUpdateStatus = async (id: string, status: string) => {
    await fetch(`/api/disasters/${id}`, {
      method: "PATCH",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("vanguard_token")}`
      },
      body: JSON.stringify({ status, assignedTeamId: user?.id })
    });
    setDisasters(prev => prev.map(d => d.id === id ? { ...d, status: status as any, assignedTeamId: user?.id } : d));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 font-sans">
      {/* Alert Pop-up */}
      <AnimatePresence>
        {activeNotification && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md p-6 rounded-2xl shadow-2xl border-b-4 ${
              activeNotification.type === 'SOS' ? 'bg-red-600 border-red-800' : 'bg-amber-500 border-amber-700'
            }`}
          >
            <div className="flex items-center gap-5 text-white">
              <div className="p-3 bg-white/20 rounded-xl animate-pulse">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-black uppercase tracking-tight">Priority Incident</h3>
                <p className="text-xs font-bold opacity-80 mt-1">
                  {activeNotification.type === 'SOS' ? 'URGENT RESCUE BEACON RECEIVED' : `NEW ${activeNotification.data.disasterType.toUpperCase()} DETECTED`}
                </p>
                <div className="mt-3 bg-white/10 p-2 rounded border border-white/10 text-[10px] font-mono tracking-tighter">
                  LOC: {activeNotification.data.location.address}
                </div>
              </div>
              <button 
                onClick={() => setActiveNotification(null)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <LogOut className="w-5 h-5 rotate-90 opacity-60" />
              </button>
            </div>
            <button 
              onClick={() => {
                if (activeNotification.type === 'DISASTER') handleUpdateStatus(activeNotification.data.id, 'ASSIGNED');
                setActiveNotification(null);
              }}
              className="w-full mt-5 py-4 bg-white text-slate-900 font-black uppercase text-xs tracking-widest rounded-xl shadow-lg border-b-2 border-slate-200 active:translate-y-0.5 active:border-0 transition-all"
            >
              Commit to Rescue Operations
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 pb-8 border-b border-slate-200">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Operational Area</p>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 lowercase">Rescue Mission Board</h1>
          <div className="flex items-center gap-3 mt-4">
             <div className="flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
               <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
               <span className="text-[10px] font-bold uppercase tracking-wider">Unit {user?.id} Active</span>
             </div>
             <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Network: Sat-Link 01</span>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="px-8 py-5 bg-white border border-slate-200 rounded-2xl shadow-sm text-center min-w-[140px]">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Priority SOS</span>
            <span className="text-3xl font-black text-red-600 leading-none">{sosAlerts.filter(s => s.status === 'ACTIVE').length}</span>
          </div>
          <div className="px-8 py-5 bg-white border border-slate-200 rounded-2xl shadow-sm text-center min-w-[140px]">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">In-Field Inventory</span>
             <span className="text-3xl font-black text-blue-600 leading-none">{resources.filter(r => r.quantity > 0).length}</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Disaster Mission Log */}
        <div className="lg:col-span-8 space-y-6">
           <div className="flex items-center justify-between">
              <h3 className="font-black text-slate-900 uppercase text-[11px] tracking-widest flex items-center gap-2">
                <Bell className="w-4 h-4 text-slate-400" />
                Active Missions
              </h3>
           </div>
           <div className="grid gap-5">
             {disasters.map(d => (
               <motion.div 
                 key={d.id}
                 layout
                 className={`p-6 bg-white border rounded-2xl transition-all relative overflow-hidden group ${
                   d.assignedTeamId === user?.id ? 'border-blue-500 shadow-xl ring-2 ring-blue-50 ring-offset-0' : 'border-slate-200 shadow-sm'
                 }`}
               >
                 <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
                   <div className="flex items-start gap-4">
                     <div className={`p-4 rounded-xl shadow-sm ${
                       d.riskLevel === 'CRITICAL' ? 'bg-red-600 text-white' : 'bg-slate-900 text-white'
                     }`}>
                        <AlertTriangle className="w-6 h-6" />
                     </div>
                     <div>
                       <h4 className="text-lg font-black text-slate-900 tracking-tight leading-tight uppercase">{d.disasterType}</h4>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Location: {d.location.address}</p>
                     </div>
                   </div>
                   <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest border ${
                        d.riskLevel === 'CRITICAL' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-slate-50 text-slate-600 border-slate-100'
                      }`}>
                        {d.riskLevel}
                      </span>
                   </div>
                 </div>
                 
                 <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6 group-hover:bg-blue-50 transition-colors">
                    <p className="text-sm text-slate-600 font-medium leading-relaxed italic">"{d.description}"</p>
                 </div>

                 <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                   <div className="flex flex-wrap gap-1.5 w-full">
                     {d.resourcesReq.map(r => (
                       <span key={r} className="px-2 py-1 bg-white border border-slate-200 text-[10px] font-bold rounded uppercase text-slate-400 tracking-tight">{r}</span>
                     ))}
                   </div>
                   <div className="flex gap-2 w-full sm:w-auto">
                     {d.status === 'REPORTED' && (
                       <button 
                         onClick={() => handleUpdateStatus(d.id, 'ASSIGNED')}
                         className="flex-1 sm:flex-none px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95"
                       >
                         Accept Dispatch
                       </button>
                     )}
                     {d.status === 'ASSIGNED' && (
                       <button 
                         onClick={() => handleUpdateStatus(d.id, 'RESOLVED')}
                         className="flex-1 sm:flex-none px-6 py-3 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-lg active:scale-95"
                       >
                         Complete Rescue
                       </button>
                     )}
                   </div>
                 </div>
               </motion.div>
             ))}
           </div>
        </div>

        {/* SOS Sideboard */}
        <div className="lg:col-span-4 space-y-8">
          <section className="space-y-6">
            <h3 className="font-black text-red-600 uppercase text-[11px] tracking-widest flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Live SOS Channel
            </h3>
            <div className="space-y-4">
              {sosAlerts.map(s => (
                <div key={s.id} className={`p-6 rounded-2xl border-t-4 shadow-sm transition-all relative overflow-hidden backdrop-blur-sm ${
                  s.status === 'ACTIVE' ? 'bg-red-50 border-red-600 animate-pulse' : 'bg-slate-50 border-slate-300 grayscale opacity-60'
                }`}>
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-white rounded-xl shadow-sm border border-red-100 flex items-center justify-center font-black text-red-600 text-sm">SOS</div>
                    <div className="flex-1">
                      <h5 className="font-black text-slate-900 tracking-tight lowercase text-lg">{s.missingPersonName}</h5>
                      <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest mt-1">Status: {s.status}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="font-black text-slate-900 uppercase text-[11px] tracking-widest flex items-center gap-2">
              <Package className="w-4 h-4 text-slate-400" />
              Depot Status
            </h3>
            <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
              {resources.map(r => (
                <div key={r.id} className="p-4 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-black text-slate-900 uppercase">{r.name}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{r.location}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-900">{r.quantity}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{r.unit}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function AdminDashboard() {
  const { socket } = useAuth();
  const [disasters, setDisasters] = useState<DisasterReport[]>([]);
  const [sosAlerts, setSosAlerts] = useState<SOSAlert[]>([]);
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [activeTab, setActiveTab] = useState<'INCIDENTS' | 'RESOURCES' | 'SYSTEM'>('INCIDENTS');
  const [systemInfo, setSystemInfo] = useState<any>(null);

  useEffect(() => {
    fetch("/api/disasters").then(res => res.json()).then(data => Array.isArray(data) ? setDisasters(data) : setDisasters([]));
    fetch("/api/sos").then(res => res.json()).then(data => Array.isArray(data) ? setSosAlerts(data) : setSosAlerts([]));
    fetch("/api/resources").then(res => res.json()).then(data => Array.isArray(data) ? setResources(data) : setResources([]));
    
    fetch("/api/admin/system-info", {
      headers: { "Authorization": `Bearer ${localStorage.getItem("vanguard_token")}` }
    })
    .then(res => res.json())
    .then(data => setSystemInfo(data))
    .catch(() => setSystemInfo(null));
  }, []);

  const handleAddResource = async () => {
    const name = prompt("Resource Name (e.g., Medical Kit):");
    const quantity = Number(prompt("Quantity:"));
    const unit = prompt("Unit (e.g., units, kg, liters):");
    if (!name || isNaN(quantity) || !unit) return;

    const res = await fetch("/api/resources", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("vanguard_token")}`
      },
      body: JSON.stringify({ name, quantity, unit, location: "Main Hub" })
    });
    if (res.ok) {
      const newRes = await res.json();
      setResources([...resources, newRes]);
    }
  };

  const handleUpdateResource = async (id: string, newQty: number) => {
    const res = await fetch(`/api/resources/${id}`, {
      method: "PATCH",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("vanguard_token")}`
      },
      body: JSON.stringify({ quantity: newQty })
    });
    if (res.ok) {
      const updated = await res.json();
      setResources(prev => prev.map(r => r.id === updated.id ? updated : r));
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-12 font-sans">
      <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 pb-2 border-b border-slate-200">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Central Console</p>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 lowercase uppercase leading-none">Global Operations Oversight</h1>
          <p className="text-slate-400 font-mono text-[10px] tracking-widest mt-4 uppercase">
             VANGUARD_COMMAND // {systemInfo?.isMock ? "MOCK_NODE_EMULATED" : "LIVE_CLUSTER_CONNECTED"}
          </p>
        </div>
        <div className="flex gap-2">
            <button 
              onClick={() => setActiveTab('INCIDENTS')}
              className={`px-5 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                activeTab === 'INCIDENTS' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-400'
              }`}
            >
              Incident Monitor
            </button>
            <button 
              onClick={() => setActiveTab('RESOURCES')}
              className={`px-5 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                activeTab === 'RESOURCES' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-400'
              }`}
            >
              Asset Inventory
            </button>
            <button 
              onClick={() => setActiveTab('SYSTEM')}
              className={`px-5 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                activeTab === 'SYSTEM' ? 'bg-red-600 text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-400'
              }`}
            >
              Network Diagnostics
            </button>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Active Incidents', value: disasters.length, color: 'text-blue-600', icon: Bell, bg: 'bg-blue-50' },
          { label: 'SOS Beacons', value: sosAlerts.filter(s => s.status === 'ACTIVE').length, color: 'text-red-600', icon: AlertTriangle, bg: 'bg-red-50' },
          { label: 'Deployed Units', value: new Set(disasters.map(d => d.assignedTeamId)).size - (new Set(disasters.map(d => d.assignedTeamId)).has(undefined) ? 1 : 0), color: 'text-emerald-600', icon: Users, bg: 'bg-emerald-50' },
          { label: 'Network Bridge', value: systemInfo?.isMock ? 'Demo' : 'Linked', color: systemInfo?.isMock ? 'text-slate-400' : 'text-emerald-500', icon: Activity, bg: 'bg-slate-50' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5 group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className={`p-4 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-70 mb-1 block">{stat.label}</span>
              <p className={`text-3xl font-black ${stat.color} leading-none truncate`}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {activeTab === 'INCIDENTS' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
          <div className="bg-slate-50 grid grid-cols-12 p-5 border-b border-slate-100 font-sans text-[10px] text-slate-400 uppercase tracking-widest font-black">
             <div className="col-span-1">UID</div>
             <div className="col-span-5">Incident / Vector</div>
             <div className="col-span-2">Classification</div>
             <div className="col-span-2 text-center">Vulnerability</div>
             <div className="col-span-2 text-right">Status</div>
          </div>
          <div className="divide-y divide-slate-50">
            {disasters.length === 0 ? (
              <div className="text-center py-20 text-slate-300 font-black uppercase text-xs">Waiting for incoming telemetry...</div>
            ) : disasters.map(d => (
              <div key={d.id} className="grid grid-cols-12 px-5 py-6 hover:bg-slate-50 transition-colors cursor-pointer group items-center">
                 <div className="col-span-1 font-mono text-[10px] text-slate-300 font-bold">
                   {d.id.slice(-6)}
                 </div>
                 <div className="col-span-5">
                   <h4 className="font-black text-slate-900 tracking-tight lowercase group-hover:text-blue-600 transition-colors uppercase leading-tight">{d.location.address}</h4>
                   <p className="text-[10px] text-slate-400 italic mt-0.5">Reported: {new Date(d.createdAt).toLocaleDateString()}</p>
                 </div>
                 <div className="col-span-2">
                   <span className="px-2 py-1 bg-white border border-slate-200 rounded text-[9px] font-black text-slate-900 uppercase tracking-tighter">{d.disasterType}</span>
                 </div>
                 <div className="col-span-2 text-center">
                   <div className="flex items-center justify-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      d.riskLevel === 'CRITICAL' ? 'bg-red-500' :
                      d.riskLevel === 'HIGH' ? 'bg-amber-500' : 'bg-blue-500'
                    } animate-pulse`}></span>
                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{d.riskLevel}</span>
                   </div>
                 </div>
                 <div className="col-span-2 flex flex-col items-end gap-1">
                   <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border ${
                     d.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                     d.status === 'ASSIGNED' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                   }`}>
                     {d.status}
                   </span>
                 </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'RESOURCES' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Master Asset Registry</h3>
            <button 
              onClick={handleAddResource}
              className="px-4 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-slate-800 transition-all flex items-center gap-2"
            >
              <Package className="w-3 h-3" /> Register New Asset
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {resources.map(r => (
              <div key={r.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 group hover:bg-white hover:shadow-lg transition-all">
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-white rounded-xl shadow-sm">
                    <Package className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <div className="text-right">
                    <span className="text-[24px] font-black text-slate-900 leading-none">{r.quantity}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-tighter">{r.unit} Available</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-black text-slate-900 uppercase tracking-tight leading-tight">{r.name}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic">Location: {r.location}</p>
                </div>
                <div className="flex gap-2 font-black">
                  <button 
                    onClick={() => handleUpdateResource(r.id, r.quantity + 10)}
                    className="flex-1 py-2 bg-white border border-slate-200 rounded-lg text-[9px] uppercase tracking-widest hover:border-slate-400 transition-all"
                  >
                    +10 Units
                  </button>
                  <button 
                    onClick={() => handleUpdateResource(r.id, Math.max(0, r.quantity - 10))}
                    className="flex-1 py-2 bg-white border border-slate-200 rounded-lg text-[9px] uppercase tracking-widest hover:border-slate-400 transition-all"
                  >
                    -10 Units
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'SYSTEM' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="grid md:grid-cols-2 gap-8">
            <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-2xl ${systemInfo?.isMock ? 'bg-slate-100' : 'bg-emerald-100 text-emerald-600'}`}>
                   <Activity className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase leading-none">Database Status</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Active Persistence Profile</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Engine</span>
                  <span className="text-xs font-black text-slate-900 uppercase">{systemInfo?.databaseType}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">State</span>
                  <span className={`text-xs font-black uppercase ${systemInfo?.isMock ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {systemInfo?.connectionStatus}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">API Sync</span>
                  <span className="text-xs font-black text-blue-600 uppercase font-mono tracking-tighter">{systemInfo?.apiDomain}</span>
                </div>
              </div>
              
              {systemInfo?.isMock && (
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
                  <div className="flex gap-3">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-[10px] font-bold text-amber-800 leading-normal uppercase">
                      Warning: Data is temporary. Add MONGODB_URI in secrets to enable cloud persistence.
                    </p>
                  </div>
                </div>
              )}
            </section>

            <section className="bg-slate-900 p-8 rounded-3xl shadow-2xl text-white space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-slate-800 rounded-2xl text-white shadow-inner">
                   <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white tracking-tight uppercase leading-none">Compass Bridge</h3>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">External Management Protocol</p>
                </div>
              </div>

              <div className="space-y-6">
                <p className="text-xs text-slate-400 font-medium leading-relaxed">
                  To view and manage your VANGUARD telemetry via <span className="text-emerald-400 font-bold uppercase tracking-tighter">MongoDB Compass</span>, follow these steps:
                </p>
                
                <div className="space-y-4">
                  {[
                    "Get your 'SRV' connection string from MongoDB Atlas.",
                    "Paste the string into 'AI Studio > Secrets' as MONGODB_URI.",
                    "Restart the application to initialize the cloud bridge.",
                    "Paste that same URI into MongoDB Compass and click 'Connect'."
                  ].map((step, i) => (
                    <div key={i} className="flex gap-4 items-start">
                      <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center shrink-0 text-[10px] font-black border border-slate-700">
                        {i + 1}
                      </div>
                      <p className="text-[11px] font-medium text-slate-300 leading-tight">{step}</p>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-800">
                  <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl font-mono text-[9px] text-slate-400 break-all leading-relaxed relative group overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <span className="bg-slate-700 px-2 py-1 rounded text-white font-bold uppercase tracking-widest">URI Format</span>
                    </div>
                    mongodb+srv://&lt;user&gt;:&lt;pass&gt;@cluster0.abcde.mongodb.net/test
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Main App ---

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100 flex flex-col">
      <Navbar />
      <main className="flex-1">
        {user.role === 'USER' && <UserDashboard />}
        {user.role === 'RESCUE_TEAM' && <RescueDashboard />}
        {user.role === 'ADMIN' && <AdminDashboard />}
      </main>
      <footer className="h-12 bg-white border-t border-slate-200 flex items-center justify-between px-6 shrink-0 font-sans">
        <div className="flex gap-6">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Status:</span>
            <span className="text-[10px] font-black text-emerald-600 uppercase">Operational</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 border-l border-slate-100 pl-6">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Signal Integrity:</span>
            <span className="text-[10px] font-black text-blue-600 font-mono tracking-tighter uppercase whitespace-nowrap overflow-hidden">VANGUARD_CLUSTER_04_SYNCHED</span>
          </div>
        </div>
        <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest hidden lg:block">
          Security Clearance Level 4 — Operational Incident Command Access Only
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
