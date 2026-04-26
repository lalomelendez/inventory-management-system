import { cookies } from 'next/headers';
import Link from 'next/link';
import { CommandCenterResponse } from '@repo/validation';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  let data: CommandCenterResponse | null = null;
  let errorMsg = null;

  try {
    const res = await fetch('http://127.0.0.1:3001/analytics/command-center', {
      headers: {
        Authorization: `Bearer ${token}`
      },
      cache: 'no-store'
    });

    if (!res.ok) {
      errorMsg = `Error loading Command Center. Permissions or network issue... (${res.status})`;
    } else {
      data = await res.json();
    }
  } catch (err) {
    errorMsg = `Fetch failed: ${err instanceof Error ? err.message : String(err)}`;
  }

  if (errorMsg) {
    return (
      <div className="p-8 text-red-500 h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Command Center Access Error</h1>
        <p className="bg-red-500/10 p-4 border border-red-500/20 rounded font-mono">{errorMsg}</p>
      </div>
    );
  }

  const { lowStockItems = [], pendingPOs = [], recentActivity = [] } = data || {};

  return (
    <div className="p-8 max-w-[1400px] mx-auto min-h-screen text-slate-100">
      <div className="mb-10 animate-fade-in-down">
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent inline-block">System Command Center</h1>
        <p className="text-slate-400 mt-2">Real-time enterprise intelligence & proactive crisis management.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Widget 1: The Crisis Board */}
        <div className="bg-slate-900 border border-rose-500/40 p-6 rounded-xl shadow-[0_0_20px_rgba(244,63,94,0.05)] hover:border-rose-500/60 transition-colors animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-rose-500/20">
            <div className="bg-rose-500/20 p-2 rounded-lg text-rose-500">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h2 className="text-xl font-semibold text-rose-100 tracking-wide uppercase">Crisis Board</h2>
            <span className="ml-auto bg-rose-500 text-white text-xs px-2 py-1 rounded-full font-bold">{lowStockItems.length}</span>
          </div>
          <div className="space-y-4">
            {lowStockItems.length === 0 ? (
              <p className="text-slate-500 text-sm italic">All products are healthy. No active crises.</p>
            ) : (
              lowStockItems.map((item: any) => (
                <div key={item.id} className="bg-rose-950/30 p-4 rounded-lg border border-rose-500/20 flex flex-col hover:bg-rose-900/40 transition-colors group">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-rose-200">{item.title}</h3>
                    <span className="text-xs tracking-wider bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded-sm">DEFICIT</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 mb-2 overflow-hidden">
                    <div className="bg-rose-500 h-1.5 rounded-full" style={{ width: `${Math.max(10, Math.min(100, (item.currentStock / item.minimumStockLevel) * 100))}%` }}></div>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs font-mono text-rose-400">Stock: <span className="text-rose-300 font-bold">{item.currentStock}</span> / <span className="text-slate-400">{item.minimumStockLevel} min</span></p>
                    <Link href={`/purchase-orders/create?product=${item.id}`} className="bg-rose-600 hover:bg-rose-500 text-white px-3 py-1.5 text-xs font-medium rounded opacity-80 group-hover:opacity-100 transition-all shadow-[0_0_10px_rgba(225,29,72,0.3)] hover:shadow-[0_0_15px_rgba(225,29,72,0.5)]">
                      DRAFT P.O.
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Widget 2: The Bottleneck Board */}
        <div className="bg-slate-900 border border-amber-500/40 p-6 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.05)] hover:border-amber-500/60 transition-colors animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-amber-500/20">
            <div className="bg-amber-500/20 p-2 rounded-lg text-amber-500">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h2 className="text-xl font-semibold text-amber-100 tracking-wide uppercase">Bottlenecks</h2>
            <span className="ml-auto bg-amber-500 text-slate-900 text-xs px-2 py-1 rounded-full font-bold">{pendingPOs.length}</span>
          </div>
          <div className="space-y-4">
            {pendingPOs.length === 0 ? (
              <p className="text-slate-500 text-sm italic">Operations flowing smoothly. No pending approvals.</p>
            ) : (
              pendingPOs.map((po: any) => (
                <div key={po.id} className="bg-amber-950/30 p-4 rounded-lg border border-amber-500/20 hover:bg-amber-900/40 transition-colors">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-mono text-sm tracking-widest text-amber-200">#{po.id.slice(0,8).toUpperCase()}</h3>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-amber-500 border border-amber-500/30 px-1.5 py-0.5 rounded bg-amber-500/10">Awaiting Auth</span>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-slate-300">Supplier: <span className="font-medium">{po.supplier?.name || "Unknown Vendor"}</span></p>
                    <p className="text-xs text-slate-500 mt-1">Creator: {po.creator?.email || "System"}</p>
                  </div>
                  <Link href={`/purchase-orders/${po.id}`} className="flex items-center justify-center gap-2 bg-amber-600/90 hover:bg-amber-500 text-amber-50 px-3 py-2 text-sm font-medium rounded-md transition-colors w-full border border-amber-400/20 shadow-inner">
                    <span>Review Documentation</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Widget 3: The Activity Feed */}
        <div className="bg-slate-900 border border-indigo-500/30 p-6 rounded-xl flex flex-col h-[600px] shadow-[0_0_20px_rgba(99,102,241,0.05)] hover:border-indigo-500/50 transition-colors animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-indigo-500/20 shrink-0">
             <div className="bg-indigo-500/20 p-2 rounded-lg text-indigo-400">
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
             </div>
             <h2 className="text-xl font-semibold text-indigo-100 tracking-wide uppercase">Live Ledger</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-4 pr-3 overflow-x-hidden custom-scrollbar">
            {recentActivity.length === 0 ? (
              <p className="text-slate-500 text-sm italic">Ledger is silent.</p>
            ) : (
              recentActivity.map((activity: any) => (
                <div key={activity.id} className="relative pl-6 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-[-24px] before:w-px before:bg-slate-800 last:before:hidden group">
                  <div className={`absolute left-0 top-1.5 w-6 h-6 rounded-full border-4 border-slate-900 flex items-center justify-center shrink-0 z-10 ${
                      activity.type === 'IN' ? 'bg-emerald-500' :
                      activity.type === 'OUT' ? 'bg-rose-500' :
                      'bg-indigo-500'
                    }`}>
                  </div>
                  
                  <div className="bg-slate-800/40 hover:bg-slate-800/80 p-3 rounded-lg border border-slate-700/50 transition-colors">
                    <div className="flex justify-between items-start mb-1.5">
                      <span className={`text-[10px] tracking-widest font-bold uppercase ${
                        activity.type === 'IN' ? 'text-emerald-400' :
                        activity.type === 'OUT' ? 'text-rose-400' :
                        'text-indigo-400'
                      }`}>
                        {activity.type === 'IN' ? 'RECEIPT' : activity.type === 'OUT' ? 'DISPATCH' : 'ADJUST'}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {new Date(activity.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300 leading-snug">
                      <span className="text-white font-semibold">{activity.type === 'OUT' ? '-' : '+'}{activity.quantity}</span> units of <span className="text-indigo-200">{activity.product?.title || 'Unknown Asset'}</span>
                    </p>
                    <p className="text-[10px] text-slate-500 mt-2 font-mono">Agent: {activity.user?.email || 'SYS'}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
