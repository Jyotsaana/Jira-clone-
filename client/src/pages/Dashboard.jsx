import { useState, useEffect, useCallback } from 'react';
import { useNavigate }                       from 'react-router-dom';
import { useAuth }                           from '../context/AuthContext';
import api                                   from '../api/axios';
import toast                                 from 'react-hot-toast';

// ─── sub-components ───────────────────────────────────────────────────────────
const NavItem = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm transition-all duration-150 text-left
      ${active
        ? 'bg-violet-500/15 text-violet-400 font-medium'
        : 'text-white/40 hover:bg-white/5 hover:text-white/80'}`}
  >
    <span className="text-base">{icon}</span>{label}
  </button>
);

const StatCard = ({ label, value, trend, trendUp, loading }) => (
  <div className="bg-[#141418] border border-white/[0.07] rounded-xl p-4">
    <p className="text-[10px] font-semibold tracking-widest uppercase text-white/35 mb-2">{label}</p>
    {loading
      ? <div className="h-7 w-12 bg-white/10 rounded animate-pulse mb-1" />
      : <p className="text-2xl font-bold text-white/90">{value}</p>
    }
    <p className={`text-[11px] mt-1 ${trendUp === true ? 'text-emerald-400' : trendUp === false ? 'text-red-400' : 'text-white/30'}`}>
      {trend}
    </p>
  </div>
);

const accentMap = {
  purple: { icon: 'bg-violet-500/20 text-violet-400', bar: 'bg-gradient-to-r from-violet-500 to-violet-400', hover: 'hover:border-violet-500/40', top: 'from-violet-500 to-violet-400' },
  cyan:   { icon: 'bg-cyan-500/15 text-cyan-400',     bar: 'bg-gradient-to-r from-cyan-500 to-cyan-400',     hover: 'hover:border-cyan-500/40',   top: 'from-cyan-500 to-cyan-400'   },
  amber:  { icon: 'bg-amber-500/15 text-amber-400',   bar: 'bg-gradient-to-r from-amber-500 to-amber-400',   hover: 'hover:border-amber-400/40',  top: 'from-amber-500 to-amber-400' },
};

const ProjectCard = ({ project, accent = 'purple', onClick }) => {
  const a       = accentMap[accent];
  const key     = project.key || project.name?.slice(0,4).toUpperCase() || 'PROJ';
  const issues  = project.issueCount  ?? 0;
  const members = project.memberCount ?? project.members?.length ?? 1;
  const active  = project.status !== 'planning';

  // simple progress: closed / total issues (or 0 if no issues)
  const total    = project.totalIssues  ?? issues;
  const closed   = project.closedIssues ?? 0;
  const progress = total > 0 ? Math.round((closed / total) * 100) : 0;

  return (
    <div
      onClick={onClick}
      className={`bg-[#141418] border border-white/[0.07] rounded-2xl p-5 cursor-pointer
        transition-all duration-200 hover:-translate-y-0.5 relative overflow-hidden group ${a.hover}`}
    >
      <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${a.top} opacity-0 group-hover:opacity-100 transition-opacity`} />
      <div className={`inline-flex items-center justify-center w-9 h-9 rounded-xl ${a.icon} text-xs font-bold mb-3 font-mono`}>
        {key}
      </div>
      <p className="text-sm font-semibold text-white/85 mb-1 truncate">{project.name}</p>
      <p className="text-xs text-white/35 mb-4 line-clamp-2 leading-relaxed">{project.description || 'No description provided.'}</p>
      <div className="mb-4">
        <div className="flex justify-between text-[11px] text-white/35 mb-1.5">
          <span>Progress</span><span>{progress}%</span>
        </div>
        <div className="h-[3px] bg-white/[0.07] rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${a.bar} transition-all duration-500`} style={{ width: `${progress}%` }} />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-[11px] text-white/35">
          <span>👥 {members}</span>
          <span>☑ {issues} issues</span>
        </div>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border
          ${active
            ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20'
            : 'bg-amber-400/10 text-amber-400 border-amber-400/20'}`}>
          {active ? 'Active' : 'Planning'}
        </span>
      </div>
    </div>
  );
};

const SprintRow = ({ sprint }) => {
  const isActive   = sprint.status === 'active';
  const endLabel   = sprint.endDate   ? `Ends ${new Date(sprint.endDate).toLocaleDateString('en-US',{month:'short',day:'numeric'})}` : '—';
  const startLabel = sprint.startDate ? `Starts ${new Date(sprint.startDate).toLocaleDateString('en-US',{month:'short',day:'numeric'})}` : '—';

  return (
    <div className="flex items-center justify-between py-2.5 border-b border-white/[0.04] last:border-none">
      <div>
        <p className="text-[13px] font-medium text-white/80">{sprint.name}</p>
        <p className="text-[11px] text-white/30 mt-0.5">{sprint.projectName || 'Project'}</p>
      </div>
      <div className="text-right">
        <p className="text-[11px] text-white/30">{isActive ? endLabel : startLabel}</p>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border mt-1 inline-block
          ${isActive
            ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20'
            : 'bg-violet-500/10 text-violet-400 border-violet-400/20'}`}>
          {isActive ? 'Active' : 'Upcoming'}
        </span>
      </div>
    </div>
  );
};

// ─── New Project Modal ────────────────────────────────────────────────────────
const NewProjectModal = ({ onClose, onCreated }) => {
  const [form, setForm]       = useState({ name: '', key: '', description: '' });
  const [loading, setLoading] = useState(false);

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async () => {
    if (!form.name.trim()) return toast.error('Project name is required');
    setLoading(true);
    try {
      const proj = await api.post('/projects', form).then(r => r.data);
      toast.success('Project created!');
      onCreated(proj);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-[#1a1a20] border border-white/[0.1] rounded-2xl p-6 w-[420px] shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-base font-semibold text-white/90 mb-5">Create New Project</h3>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-white/40 mb-1 block">Project Name *</label>
            <input
              name="name"
              value={form.name}
              onChange={handle}
              placeholder="e.g. e-Commerce Platform"
              className="input bg-white/5 border-white/10 text-white/80 placeholder:text-white/20"
            />
          </div>
          <div>
            <label className="text-xs text-white/40 mb-1 block">Project Key</label>
            <input
              name="key"
              value={form.key}
              onChange={handle}
              placeholder="e.g. ECOM (auto-generated if blank)"
              className="input bg-white/5 border-white/10 text-white/80 placeholder:text-white/20"
            />
          </div>
          <div>
            <label className="text-xs text-white/40 mb-1 block">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handle}
              rows={3}
              placeholder="What is this project about?"
              className="input bg-white/5 border-white/10 text-white/80 placeholder:text-white/20 resize-none"
            />
          </div>
        </div>

        <div className="flex gap-2 justify-end mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white/5 border border-white/[0.08] text-sm text-white/60 hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-violet-500 hover:bg-violet-400 disabled:opacity-50 text-sm font-semibold text-white transition-colors"
          >
            {loading ? 'Creating…' : 'Create Project'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();

  const [projects,  setProjects]  = useState([]);
  const [sprints,   setSprints]   = useState([]);
  const [issues,    setIssues]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [activeNav, setActiveNav] = useState('dashboard');
  const [showModal, setShowModal] = useState(false);

  const displayName = user?.name || user?.email?.split('@')[0] || 'there';
  const hour        = new Date().getHours();
  const greeting    = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const accents     = ['purple', 'cyan', 'amber'];

  // ── fetch all data ──────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const projs = await api.get('/projects').then(r => r.data);
      setProjects(projs);

      // fetch sprints + issues for every project in parallel
      const [sprintArrays, issueArrays] = await Promise.all([
        Promise.all(projs.map(p =>
          api.get(`/sprints/project/${p._id}`).then(r => r.data).catch(() => [])
        )),
        Promise.all(projs.map(p =>
          api.get(`/issues/project/${p._id}`).then(r => r.data).catch(() => [])
        )),
      ]);

      // flatten sprints and attach projectName
      const allSprints = sprintArrays.flatMap((arr, i) =>
        arr.map(s => ({ ...s, projectName: projs[i]?.name }))
      );
      setSprints(allSprints);

      // flatten issues
      const allIssues = issueArrays.flat();
      setIssues(allIssues);

      // patch projects with live issue counts
      setProjects(projs.map((p, i) => ({
        ...p,
        issueCount:   issueArrays[i]?.length ?? 0,
        totalIssues:  issueArrays[i]?.length ?? 0,
        closedIssues: issueArrays[i]?.filter(x => x.status === 'done' || x.status === 'closed').length ?? 0,
      })));
    } catch (err) {
      toast.error('Failed to load data: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    if (user) fetchAll(); 
  }, [fetchAll, user]);

  // ── derived stats ───────────────────────────────────────────────────────────
  const openIssues    = issues.filter(i => i.status !== 'done' && i.status !== 'closed').length;
  const activeSprints = sprints.filter(s => s.status === 'active');
  const upcomingSp    = sprints.filter(s => s.status !== 'active').slice(0, 3);
  const shownSprints  = [...activeSprints, ...upcomingSp].slice(0, 4);
  const totalMembers  = projects.reduce((acc, p) => acc + (p.members?.length ?? 1), 0);

  const navItems = [
    { id: 'dashboard', icon: '⊞', label: 'Dashboard' },
    { id: 'projects',  icon: '📁', label: 'Projects'  },
    { id: 'sprints',   icon: '📅', label: 'Sprints'   },
    { id: 'tasks',     icon: '☑',  label: 'My Tasks'  },
  ];
  const workspaceItems = [
    { id: 'team',     icon: '👥', label: 'Team'     },
    { id: 'reports',  icon: '📊', label: 'Reports'  },
    { id: 'settings', icon: '⚙',  label: 'Settings' },
  ];

  return (
    <div className="flex h-screen bg-[#0f0f12] text-white font-sans overflow-hidden">

      {/* ── Sidebar ── */}
      <aside className="w-[220px] min-w-[220px] bg-[#141418] border-r border-white/[0.06] flex flex-col">
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/[0.06]">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-violet-400 flex items-center justify-center text-sm font-bold">J</div>
          <span className="font-bold text-[15px] text-white/90 tracking-tight">JiraClone</span>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          <p className="text-[10px] font-semibold tracking-widest uppercase text-white/25 px-3 py-2">Menu</p>
          {navItems.map(item => (
            <NavItem key={item.id} {...item} active={activeNav === item.id} onClick={() => setActiveNav(item.id)} />
          ))}
          <div className="h-px bg-white/[0.06] my-2" />
          <p className="text-[10px] font-semibold tracking-widest uppercase text-white/25 px-3 py-2">Workspace</p>
          {workspaceItems.map(item => (
            <NavItem key={item.id} {...item} active={activeNav === item.id} onClick={() => setActiveNav(item.id)} />
          ))}
        </nav>
        <div className="p-3 border-t border-white/[0.06]">
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-violet-400 flex items-center justify-center text-xs font-semibold flex-shrink-0">
              {displayName[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white/85 truncate">{displayName}</p>
              <p className="text-[11px] text-white/30">Admin</p>
            </div>
            <button onClick={logout} className="ml-auto text-[11px] text-white/25 hover:text-white/60 transition-colors" title="Logout">⏻</button>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 flex flex-col overflow-hidden">

        {/* Topbar */}
        <div className="flex items-center justify-between px-7 py-4 border-b border-white/[0.06] bg-[#0f0f12] flex-shrink-0">
          <div className="flex items-center gap-2.5 bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2 w-60">
            <span className="text-white/30 text-sm">🔍</span>
            <span className="text-[13px] text-white/30">Search projects, tasks…</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchAll}
              className="w-[34px] h-[34px] rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/50 hover:text-white/80 hover:bg-white/[0.09] transition-all text-sm"
              title="Refresh"
            >🔄</button>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-violet-500 hover:bg-violet-400 transition-colors rounded-xl text-[13px] font-semibold text-white"
            >
              + New Project
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-7 py-6">

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-xl font-bold text-white/90 tracking-tight">{greeting}, {displayName} 👋</h1>
            <p className="text-[13px] text-white/38 mt-1">Here's what's happening across your workspace today.</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            <StatCard label="Total Projects" value={projects.length}  trend={projects.length > 0 ? '↑ Keep shipping' : 'Create your first'} trendUp={projects.length > 0} loading={loading} />
            <StatCard label="Open Issues"    value={openIssues}       trend={openIssues === 0 ? 'All clear 🎉' : `${openIssues} to resolve`}  trendUp={openIssues === 0} loading={loading} />
            <StatCard label="Active Sprints" value={activeSprints.length} trend={activeSprints.length > 0 ? '↑ On track' : 'No active sprints'} trendUp={activeSprints.length > 0} loading={loading} />
            <StatCard label="Team Members"   value={totalMembers || 1} trend="Across all projects" loading={loading} />
          </div>

          {/* Projects */}
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white/80">Your Projects</h2>
            <span className="text-xs text-violet-400 cursor-pointer hover:text-violet-300">View all →</span>
          </div>

          {loading ? (
            <div className="grid grid-cols-3 gap-3.5 mb-7">
              {[1,2,3].map(i => (
                <div key={i} className="bg-[#141418] border border-white/[0.07] rounded-2xl p-5 h-[190px] animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3.5 mb-7">
              {projects.map((proj, i) => (
                <ProjectCard
                  key={proj._id}
                  project={proj}
                  accent={accents[i % 3]}
                  onClick={() => navigate(`/project/${proj._id}`)}
                />
              ))}

              {/* Add card */}
              <div
                onClick={() => setShowModal(true)}
                className="bg-[#141418] border border-dashed border-white/[0.1] rounded-2xl p-5 cursor-pointer
                  flex flex-col items-center justify-center gap-2 min-h-[170px]
                  hover:border-violet-500/40 hover:bg-violet-500/[0.03] transition-all group"
              >
                <div className="w-9 h-9 rounded-full bg-violet-500/10 group-hover:bg-violet-500/20 flex items-center justify-center text-violet-400 text-lg transition-colors">+</div>
                <span className="text-[13px] text-white/30 group-hover:text-white/50 transition-colors">New Project</span>
              </div>
            </div>
          )}

          {/* Bottom row */}
          <div className="grid grid-cols-2 gap-3.5">

            {/* Issues breakdown */}
            <div className="bg-[#141418] border border-white/[0.07] rounded-2xl p-5">
              <h2 className="text-sm font-semibold text-white/80 mb-3">Issues Overview</h2>
              {loading
                ? <div className="space-y-2">{[1,2,3].map(i=><div key={i} className="h-8 bg-white/5 rounded animate-pulse"/>)}</div>
                : issues.length === 0
                  ? <p className="text-xs text-white/30 mt-2">No issues yet. Go to a project to create some.</p>
                  : (
                    <div className="space-y-2">
                      {[
                        { label: 'To Do',       status: 'todo',        color: 'bg-white/20'       },
                        { label: 'In Progress',  status: 'inprogress',  color: 'bg-violet-400'     },
                        { label: 'In Review',    status: 'inreview',    color: 'bg-cyan-400'       },
                        { label: 'Done',         status: 'done',        color: 'bg-emerald-400'    },
                      ].map(({ label, status, color }) => {
                        const count = issues.filter(i => i.status === status).length;
                        const pct   = issues.length > 0 ? Math.round((count / issues.length) * 100) : 0;
                        return (
                          <div key={status}>
                            <div className="flex justify-between text-[11px] text-white/40 mb-1">
                              <span>{label}</span><span>{count}</span>
                            </div>
                            <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )
              }
            </div>

            {/* Sprints */}
            <div className="bg-[#141418] border border-white/[0.07] rounded-2xl p-5">
              <h2 className="text-sm font-semibold text-white/80 mb-3">Sprints</h2>
              {loading
                ? <div className="space-y-2">{[1,2,3].map(i=><div key={i} className="h-10 bg-white/5 rounded animate-pulse"/>)}</div>
                : shownSprints.length === 0
                  ? <p className="text-xs text-white/30 mt-2">No sprints yet. Open a project to create one.</p>
                  : shownSprints.map(s => <SprintRow key={s._id} sprint={s} />)
              }
            </div>
          </div>

        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <NewProjectModal
          onClose={() => setShowModal(false)}
          onCreated={newProj => setProjects(prev => [...prev, newProj])}
        />
      )}
    </div>
  );
};

export default Dashboard;
