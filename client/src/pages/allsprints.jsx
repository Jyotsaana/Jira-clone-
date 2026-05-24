import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

const AllSprints = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects]   = useState([]);
  const [sprints,  setSprints]    = useState([]);
  const [loading,  setLoading]    = useState(true);
  const [filter,   setFilter]     = useState('all'); // all | active | planned | completed

  const displayName = user?.name || user?.email?.split('@')[0] || 'there';

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const projs = await api.get('/projects').then(r => r.data);
      setProjects(projs);
      const sprintArrays = await Promise.all(
        projs.map(p => api.get(`/sprints/project/${p._id}`).then(r => r.data).catch(() => []))
      );
      const all = sprintArrays.flatMap((arr, i) =>
        arr.map(s => ({ ...s, projectName: projs[i]?.name, projectId: projs[i]?._id }))
      ).filter(s => s.projectId); // skip any with missing project ref
      setSprints(all);
    } catch (err) {
      toast.error('Failed to load sprints');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filtered = filter === 'all' ? sprints : sprints.filter(s => s.status === filter);

  const statusStyles = {
    planned:   { bg: 'bg-amber-400/10',   text: 'text-amber-400',   border: 'border-amber-400/20'   },
    active:    { bg: 'bg-emerald-400/10', text: 'text-emerald-400', border: 'border-emerald-400/20' },
    completed: { bg: 'bg-violet-500/10',  text: 'text-violet-400',  border: 'border-violet-400/20'  },
  };

  const counts = {
    all:       sprints.length,
    active:    sprints.filter(s => s.status === 'active').length,
    planned:   sprints.filter(s => s.status === 'planned').length,
    completed: sprints.filter(s => s.status === 'completed').length,
  };

  return (
    <div className="flex h-screen bg-[#0f0f12] text-white font-sans overflow-hidden">

      {/* Sidebar */}
      <aside className="w-[220px] min-w-[220px] bg-[#141418] border-r border-white/[0.06] flex flex-col">
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/[0.06]">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-violet-400 flex items-center justify-center text-sm font-bold cursor-pointer"
            onClick={() => navigate('/')}>J</div>
          <span className="font-bold text-[15px] text-white/90 tracking-tight cursor-pointer" onClick={() => navigate('/')}>JiraClone</span>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          <p className="text-[10px] font-semibold tracking-widest uppercase text-white/25 px-3 py-2">Menu</p>
          {[
            { label: 'Dashboard', icon: '⊞', path: '/'           },
            { label: 'Projects',  icon: '📁', path: '/'           },
            { label: 'Sprints',   icon: '📅', path: '/sprints'    },
            { label: 'My Tasks',  icon: '☑',  path: '/my-tasks'   },
          ].map(item => (
            <button key={item.label} onClick={() => navigate(item.path)}
              className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm transition-all text-left
                ${item.path === '/sprints'
                  ? 'bg-violet-500/15 text-violet-400 font-medium'
                  : 'text-white/40 hover:bg-white/5 hover:text-white/80'}`}>
              <span>{item.icon}</span>{item.label}
            </button>
          ))}
          <div className="h-px bg-white/[0.06] my-2" />
          <p className="text-[10px] font-semibold tracking-widest uppercase text-white/25 px-3 py-2">Workspace</p>
          {[
            { label: 'Team',     icon: '👥' },
            { label: 'Reports',  icon: '📊' },
            { label: 'Settings', icon: '⚙'  },
          ].map(item => (
            <button key={item.label}
              className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-white/25 cursor-not-allowed opacity-50 text-left">
              <span>{item.icon}</span>{item.label}
              <span className="ml-auto text-[9px] text-white/20 font-medium tracking-wide">SOON</span>
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-white/[0.06]">
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/5 cursor-pointer">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-violet-400 flex items-center justify-center text-xs font-semibold">
              {displayName[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white/85 truncate">{displayName}</p>
              <p className="text-[11px] text-white/30">Admin</p>
            </div>
            <button onClick={logout} className="ml-auto text-[11px] text-white/25 hover:text-white/60" title="Logout">⏻</button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-7 py-4 border-b border-white/[0.06] bg-[#0f0f12] flex-shrink-0">
          <h1 className="text-lg font-bold text-white/90">All Sprints</h1>
          <button onClick={fetchAll}
            className="w-[34px] h-[34px] rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/50 hover:text-white/80 transition-all text-sm"
            title="Refresh">🔄</button>
        </div>

        <div className="flex-1 overflow-y-auto px-7 py-6">

          {/* Filter tabs */}
          <div className="flex gap-2 mb-6">
            {['all','active','planned','completed'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-[13px] font-medium transition-all border
                  ${filter === f
                    ? 'bg-violet-500/20 text-violet-400 border-violet-500/30'
                    : 'bg-white/[0.03] text-white/40 border-white/[0.07] hover:text-white/70'}`}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
                <span className="ml-1.5 text-[11px] opacity-60">({counts[f]})</span>
              </button>
            ))}
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-24 bg-white/[0.04] rounded-2xl animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-white/30">
              <p className="text-4xl mb-3">📅</p>
              <p className="text-sm">No sprints found</p>
              <p className="text-xs mt-1">Go to a project to create sprints</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(sprint => {
                const st = statusStyles[sprint.status] || statusStyles.planned;
                const start = sprint.startDate ? new Date(sprint.startDate).toLocaleDateString('en-US',{month:'short',day:'numeric'}) : '—';
                const end   = sprint.endDate   ? new Date(sprint.endDate).toLocaleDateString('en-US',{month:'short',day:'numeric'}) : '—';
                return (
                  <div key={sprint._id}
                    className="bg-[#141418] border border-white/[0.07] rounded-2xl p-5 hover:border-violet-500/30 transition-all cursor-pointer group"
                    onClick={() => sprint.projectId && navigate(`/project/${sprint.projectId}/sprints`)}>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-semibold text-white/85 group-hover:text-white transition-colors">{sprint.name}</p>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${st.bg} ${st.text} ${st.border}`}>
                            {sprint.status}
                          </span>
                        </div>
                        {sprint.goal && <p className="text-xs text-white/40 mb-2">{sprint.goal}</p>}
                        <p className="text-[11px] text-white/30">📁 {sprint.projectName}</p>
                      </div>
                      <div className="text-right text-[11px] text-white/30">
                        <p>{start} → {end}</p>
                        <p className="mt-1 text-violet-400/60 group-hover:text-violet-400 transition-colors">View →</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AllSprints;