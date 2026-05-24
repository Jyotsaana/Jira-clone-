import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

const statusCols = [
  { key: 'todo',       label: 'To Do',       color: 'bg-white/20',     text: 'text-white/60'    },
  { key: 'inprogress', label: 'In Progress',  color: 'bg-violet-400',   text: 'text-violet-300'  },
  { key: 'inreview',   label: 'In Review',    color: 'bg-cyan-400',     text: 'text-cyan-300'    },
  { key: 'done',       label: 'Done',         color: 'bg-emerald-400',  text: 'text-emerald-300' },
];

const priorityStyles = {
  low:      { bg: 'bg-slate-400/10',   text: 'text-slate-400'   },
  medium:   { bg: 'bg-amber-400/10',   text: 'text-amber-400'   },
  high:     { bg: 'bg-orange-400/10',  text: 'text-orange-400'  },
  critical: { bg: 'bg-red-400/10',     text: 'text-red-400'     },
};

const MyTasks = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [issues,  setIssues]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('all'); // all | todo | inprogress | inreview | done

  const displayName = user?.name || user?.email?.split('@')[0] || 'there';

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const projs = await api.get('/projects').then(r => r.data);
      const issueArrays = await Promise.all(
        projs.map(p => api.get(`/issues/project/${p._id}`).then(r => r.data).catch(() => []))
      );
      const allIssues = issueArrays.flatMap((arr, i) =>
        arr.map(issue => ({ ...issue, projectName: projs[i]?.name, projectId: projs[i]?._id }))
      );
      // filter to issues assigned to current user
      const mine = allIssues.filter(issue =>
        issue.assignee === user?._id ||
        issue.assignee?._id === user?._id ||
        issue.assignedTo === user?._id ||
        issue.assignedTo?._id === user?._id
      );
      // If no assignee filtering matches, show all issues (solo dev mode)
      setIssues(mine.length > 0 ? mine : allIssues);
    } catch (err) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const filtered = filter === 'all' ? issues : issues.filter(i => i.status === filter);
  const counts   = statusCols.reduce((acc, s) => ({ ...acc, [s.key]: issues.filter(i => i.status === s.key).length }), {});

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
            { label: 'Dashboard', icon: '⊞', path: '/'         },
            { label: 'Projects',  icon: '📁', path: '/'         },
            { label: 'Sprints',   icon: '📅', path: '/sprints'  },
            { label: 'My Tasks',  icon: '☑',  path: '/my-tasks' },
          ].map(item => (
            <button key={item.label} onClick={() => navigate(item.path)}
              className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm transition-all text-left
                ${item.path === '/my-tasks'
                  ? 'bg-violet-500/15 text-violet-400 font-medium'
                  : 'text-white/40 hover:bg-white/5 hover:text-white/80'}`}>
              <span>{item.icon}</span>{item.label}
            </button>
          ))}
          <div className="h-px bg-white/[0.06] my-2" />
          <p className="text-[10px] font-semibold tracking-widest uppercase text-white/25 px-3 py-2">Workspace</p>
          {['Team','Reports','Settings'].map(label => (
            <button key={label}
              className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-white/25 cursor-not-allowed opacity-50 text-left">
              <span>{label === 'Team' ? '👥' : label === 'Reports' ? '📊' : '⚙'}</span>{label}
              <span className="ml-auto text-[9px] text-white/20 font-medium">SOON</span>
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
          <div>
            <h1 className="text-lg font-bold text-white/90">My Tasks</h1>
            <p className="text-[12px] text-white/35 mt-0.5">{issues.length} total tasks across all projects</p>
          </div>
          <button onClick={fetchTasks}
            className="w-[34px] h-[34px] rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/50 hover:text-white/80 transition-all text-sm"
            title="Refresh">🔄</button>
        </div>

        <div className="flex-1 overflow-y-auto px-7 py-6">

          {/* Status summary cards */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            {statusCols.map(s => (
              <div key={s.key}
                onClick={() => setFilter(filter === s.key ? 'all' : s.key)}
                className={`bg-[#141418] border rounded-xl p-4 cursor-pointer transition-all
                  ${filter === s.key ? 'border-violet-500/40 bg-violet-500/5' : 'border-white/[0.07] hover:border-white/20'}`}>
                <div className={`w-2 h-2 rounded-full ${s.color} mb-2`} />
                <p className="text-xl font-bold text-white/90">{counts[s.key] || 0}</p>
                <p className="text-[11px] text-white/35 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 mb-5">
            <button onClick={() => setFilter('all')}
              className={`px-4 py-1.5 rounded-lg text-[13px] font-medium transition-all border
                ${filter === 'all'
                  ? 'bg-violet-500/20 text-violet-400 border-violet-500/30'
                  : 'bg-white/[0.03] text-white/40 border-white/[0.07] hover:text-white/70'}`}>
              All <span className="ml-1 opacity-60 text-[11px]">({issues.length})</span>
            </button>
            {statusCols.map(s => (
              <button key={s.key} onClick={() => setFilter(s.key)}
                className={`px-4 py-1.5 rounded-lg text-[13px] font-medium transition-all border
                  ${filter === s.key
                    ? 'bg-violet-500/20 text-violet-400 border-violet-500/30'
                    : 'bg-white/[0.03] text-white/40 border-white/[0.07] hover:text-white/70'}`}>
                {s.label} <span className="ml-1 opacity-60 text-[11px]">({counts[s.key] || 0})</span>
              </button>
            ))}
          </div>

          {/* Task list */}
          {loading ? (
            <div className="space-y-2">
              {[1,2,3,4].map(i => <div key={i} className="h-16 bg-white/[0.04] rounded-xl animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-white/30">
              <p className="text-4xl mb-3">☑</p>
              <p className="text-sm">No tasks found</p>
              <p className="text-xs mt-1">Go to a project board to create issues</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map(issue => {
                const p  = priorityStyles[issue.priority] || priorityStyles.low;
                const st = statusCols.find(s => s.key === issue.status) || statusCols[0];
                return (
                  <div key={issue._id}
                    onClick={() => navigate(`/project/${issue.projectId}`)}
                    className="bg-[#141418] border border-white/[0.07] rounded-xl px-5 py-3.5 flex items-center gap-4 hover:border-violet-500/30 cursor-pointer transition-all group">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${st.color}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white/80 group-hover:text-white transition-colors truncate">{issue.title}</p>
                      <p className="text-[11px] text-white/30 mt-0.5">📁 {issue.projectName}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${p.bg} ${p.text}`}>
                        {issue.priority || 'low'}
                      </span>
                      <span className={`text-[10px] font-medium ${st.text}`}>{st.label}</span>
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

export default MyTasks;