import { useEffect, useMemo, useRef, useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiBarChart2, FiPieChart, FiDollarSign, FiTrendingUp, FiActivity, FiFolder } from 'react-icons/fi';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, AreaChart, Area, CartesianGrid, XAxis, YAxis } from 'recharts';
import { investmentAPI } from '../../utils/investmentAPI';
import projectAPI from '../../utils/projectAPI';
import ProjectModal from '../../components/ProjectModal';
import './Investment.css';

const ProjectIncomeExpense = () => {
  const [entries, setEntries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState('all');
  const [projects, setProjects] = useState([]);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [expandedProject, setExpandedProject] = useState(null);
  const formRef = useRef(null);
  const [formData, setFormData] = useState({
    category: 'project-wise',
    type: 'Income', // Income or Expense
    name: '', // Project name
    source: '', // Source of income/expense
    amount: '',
    startDate: '',
    frequency: 'one-time',
    notes: '',
  });

  const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];

  useEffect(() => {
    fetchEntries();
    fetchProjects();
  }, []);

  useEffect(() => {
    if (showForm && formRef.current) {
      setTimeout(() => {
        formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [showForm]);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const response = await investmentAPI.getAll('project-wise');
      setEntries(response.data.investments || []);
    } catch (error) {
      console.error('Error fetching project entries:', error);
      setEntries([
        {
          _id: 'demo-1',
          category: 'project-wise',
          type: 'Income',
          name: 'Project Alpha',
          provider: 'Dev A',
          amount: 120000,
          startDate: '2025-01-10',
          frequency: 'monthly',
          notes: 'Retainer payment'
        },
        {
          _id: 'demo-2',
          category: 'project-wise',
          type: 'Expense',
          name: 'Project Alpha',
          provider: 'Dev X',
          amount: 45000,
          startDate: '2025-01-15',
          frequency: 'one-time',
          notes: 'Equipment purchase'
        },
        {
          _id: 'demo-3',
          category: 'project-wise',
          type: 'Expense',
          name: 'Project Beta',
          provider: 'Dev Y',
          amount: 30000,
          startDate: '2025-01-20',
          frequency: 'monthly',
          notes: 'Subcontracting'
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await projectAPI.getProjects();
      setProjects(response.projects || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        category: 'project-wise',
        type: formData.type,
        name: formData.name,
        source: formData.source,
        amount: parseFloat(formData.amount) || 0,
        startDate: formData.startDate,
        frequency: formData.frequency,
        notes: formData.notes || '',
      };
      if (editingId) {
        await investmentAPI.update(editingId, dataToSend);
      } else {
        await investmentAPI.create(dataToSend);
      }
      resetForm();
      fetchEntries();
    } catch (error) {
      console.error('Error saving entry:', error);
      alert(error.response?.data?.message || 'Error saving entry');
    }
  };

  const handleEdit = (entry) => {
    setFormData({
      category: entry.category,
      type: entry.type,
      name: entry.name,
      source: entry.source || entry.provider || '',
      amount: entry.amount || '',
      startDate: entry.startDate?.split('T')[0] || '',
      frequency: entry.frequency || 'one-time',
      notes: entry.notes || '',
    });
    setEditingId(entry._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await investmentAPI.delete(id);
        fetchEntries();
      } catch (error) {
        console.error('Error deleting entry:', error);
        alert('Error deleting entry');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      category: 'project-wise',
      type: 'Income',
      name: '',
      source: '',
      amount: '',
      startDate: '',
      frequency: 'one-time',
      notes: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  // Project handling functions
  const handleAddProject = () => {
    setEditingProject(null);
    setShowProjectModal(true);
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setShowProjectModal(true);
  };

  const handleSaveProject = async (projectData, projectId) => {
    try {
      if (projectId) {
        await projectAPI.updateProject(projectId, projectData);
      } else {
        await projectAPI.createProject(projectData);
      }
      await fetchProjects();
      setShowProjectModal(false);
      setEditingProject(null);
    } catch (error) {
      console.error('Error saving project:', error);
      throw error;
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await projectAPI.deleteProject(projectId);
        await fetchProjects();
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
  };

  const totals = useMemo(() => {
    const income = entries.filter(e => e.type === 'Income').reduce((s, e) => s + (e.amount || 0), 0);
    const expense = entries.filter(e => e.type === 'Expense').reduce((s, e) => s + (e.amount || 0), 0);
    const net = income - expense;
    const expensePercent = income > 0 ? ((expense / income) * 100).toFixed(2) : 0;
    return { income, expense, net, expensePercent };
  }, [entries]);

  const projectAgg = useMemo(() => {
    const map = new Map();
    for (const e of entries) {
      const key = e.name || 'Unnamed Project';
      const prev = map.get(key) || { name: key, income: 0, expense: 0, net: 0, count: 0 };
      if (e.type === 'Income') prev.income += e.amount || 0; else prev.expense += e.amount || 0;
      prev.net = prev.income - prev.expense;
      prev.count += 1;
      map.set(key, prev);
    }
    return Array.from(map.values());
  }, [entries]);

  const uniqueProjects = useMemo(() => {
    // Combine both database projects and entry projects
    const entryProjects = [...new Set(entries.map(e => e.name).filter(Boolean))];
    const dbProjectNames = projects.map(p => p.name);
    const allProjects = [...new Set([...dbProjectNames, ...entryProjects])];
    return allProjects.sort();
  }, [entries, projects]);

  const filteredEntries = useMemo(() => {
    if (selectedProject === 'all') return entries;
    return entries.filter(e => e.name === selectedProject);
  }, [entries, selectedProject]);

  const filteredTotals = useMemo(() => {
    const income = filteredEntries.filter(e => e.type === 'Income').reduce((s, e) => s + (e.amount || 0), 0);
    const expense = filteredEntries.filter(e => e.type === 'Expense').reduce((s, e) => s + (e.amount || 0), 0);
    const net = income - expense;
    const expensePercent = income > 0 ? ((expense / income) * 100).toFixed(2) : 0;
    return { income, expense, net, expensePercent };
  }, [filteredEntries]);

  const filteredProjectAgg = useMemo(() => {
    const map = new Map();
    for (const e of filteredEntries) {
      const key = e.name || 'Unnamed Project';
      const prev = map.get(key) || { name: key, income: 0, expense: 0, net: 0, count: 0 };
      if (e.type === 'Income') prev.income += e.amount || 0; else prev.expense += e.amount || 0;
      prev.net = prev.income - prev.expense;
      prev.count += 1;
      map.set(key, prev);
    }
    return Array.from(map.values());
  }, [filteredEntries]);

  const filteredProviderAgg = useMemo(() => {
    const map = new Map();
    for (const e of filteredEntries) {
      const key = e.source || e.provider || 'Unknown';
      const prev = map.get(key) || { name: key, value: 0 };
      prev.value += e.amount || 0;
      map.set(key, prev);
    }
    return Array.from(map.values());
  }, [filteredEntries]);

  const filteredPieData = useMemo(() => ([
    { name: 'Income', value: filteredTotals.income },
    { name: 'Expense', value: filteredTotals.expense },
  ]), [filteredTotals]);

  const providerAgg = useMemo(() => {
    const map = new Map();
    for (const e of entries) {
      const key = e.source || e.provider || 'Unknown';
      const prev = map.get(key) || { name: key, value: 0 };
      prev.value += e.amount || 0;
      map.set(key, prev);
    }
    return Array.from(map.values());
  }, [entries]);

  const pieData = useMemo(() => ([
    { name: 'Income', value: totals.income },
    { name: 'Expense', value: totals.expense },
  ]), [totals]);

  const handleProjectFilterChange = (project) => {
    setSelectedProject(project);
  };

  return (
    <div className="investment-container">
      <div className="investment-header">
        <h1>Project Wise Income / Expense</h1>
        <div className="header-actions">
          <button className="btn-add-investment" onClick={() => setShowForm(!showForm)}>
            <FiPlus /> {showForm ? 'Cancel' : 'Add Record'}
          </button>
        </div>
      </div>

      {/* Project Management Section */}
      {projects.length > 0 && (
        <div className="project-management-section">
          <div className="section-header">
            <h2>Manage Projects</h2>
            <button className="btn-add-investment" onClick={handleAddProject}>
              <FiPlus /> Add New Project
            </button>
          </div>
          <div className="projects-grid">
            {projects.map(project => (
              <div key={project._id} className="project-card">
                <div className="project-info">
                  <div className="project-header-info">
                    <div className="project-color" style={{ backgroundColor: project.color }}></div>
                    <h3>{project.name}</h3>
                    <span className={`project-status ${project.status}`}>{project.status}</span>
                  </div>
                  {project.description && (
                    <p className="project-description">{project.description}</p>
                  )}
                  <div className="project-details">
                    {project.budget > 0 && (
                      <span className="project-budget">
                        Budget: {project.currency} {project.budget.toLocaleString('en-IN')}
                      </span>
                    )}
                    {project.tags.length > 0 && (
                      <div className="project-tags">
                        {project.tags.map((tag, idx) => (
                          <span key={idx} className="project-tag">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="project-actions">
                  <button
                    className="btn-icon btn-edit"
                    onClick={() => handleEditProject(project)}
                    title="Edit Project"
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    className="btn-icon btn-danger"
                    onClick={() => handleDeleteProject(project._id)}
                    title="Delete Project"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon icon-black">
            <FiDollarSign />
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Income</p>
            <h3 className="stat-value">₹{totals.income.toLocaleString('en-IN')}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon icon-dark-gray">
            <FiActivity />
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Expense</p>
            <h3 className="stat-value">₹{totals.expense.toLocaleString('en-IN')}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon icon-green-gradient">
            <FiTrendingUp />
          </div>
          <div className="stat-content">
            <p className="stat-label">Net</p>
            <h3 className="stat-value" style={{ color: totals.net >= 0 ? '#10B981' : '#EF4444' }}>₹{totals.net.toLocaleString('en-IN')}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon icon-gray">
            <FiFolder />
          </div>
          <div className="stat-content">
            <p className="stat-label">Projects</p>
            <h3 className="stat-value">{projectAgg.length}</h3>
          </div>
        </div>
      </div>

      {entries.length > 0 && (
        <div className="charts-section">
          <div className="charts-header">
            <h2>Project Analytics</h2>
            <p>Income vs Expense and project-wise distribution</p>
          </div>

          <div className="charts-grid">
            <div className="chart-card premium">
              <div className="chart-header">
                <div className="chart-title">
                  <FiPieChart className="chart-icon" />
                  <h3>Income vs Expense</h3>
                </div>
                <div className="chart-subtitle">Share of totals</div>
              </div>
              <div className="chart-content">
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
                      {pieData.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} stroke="#fff" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Value']} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="chart-card premium">
              <div className="chart-header">
                <div className="chart-title">
                  <FiBarChart2 className="chart-icon" />
                  <h3>Project Performance</h3>
                </div>
                <div className="chart-subtitle">Income vs Expense by project</div>
              </div>
              <div className="chart-content">
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={projectAgg} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.3} />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: '500', fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 12, fontWeight: '500', fill: '#64748b' }} tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`} />
                    <Tooltip formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, '']} />
                    <Legend />
                    <Bar dataKey="income" fill="#2563EB" name="Income" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="expense" fill="#EF4444" name="Expense" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="chart-card premium full-width">
              <div className="chart-header">
                <div className="chart-title">
                  <FiActivity className="chart-icon" />
                  <h3>Source Distribution</h3>
                </div>
                <div className="chart-subtitle">Totals by source</div>
              </div>
              <div className="chart-content">
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={providerAgg} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <defs>
                      <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#6D28D9" stopOpacity={0.2} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.3} />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: '500', fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 12, fontWeight: '500', fill: '#64748b' }} tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`} />
                    <Tooltip formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Total']} />
                    <Area type="monotone" dataKey="value" stroke="#8B5CF6" strokeWidth={3} fill="url(#areaGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {projectAgg.length > 0 && (
        <div className="projects-summary-section">
          <h2>Projects Overview</h2>
          <p style={{ color: '#64748b', marginBottom: '20px' }}>Click on a project to view detailed entries</p>
          <div className="projects-summary-grid">
            {projectAgg.map((proj) => {
              const projectEntries = entries.filter(e => e.name === proj.name);
              const isExpanded = expandedProject === proj.name;

              return (
                <div key={proj.name} className="project-summary-card">
                  <div
                    className="project-summary-header"
                    onClick={() => setExpandedProject(isExpanded ? null : proj.name)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="project-summary-title">
                      <FiFolder style={{ marginRight: '10px', color: '#8B5CF6' }} />
                      <h3>{proj.name}</h3>
                      <span style={{ marginLeft: 'auto', fontSize: '14px', color: '#64748b' }}>
                        {isExpanded ? '▼' : '▶'}
                      </span>
                    </div>
                    <div className="project-summary-stats">
                      <div className="project-stat income">
                        <span className="stat-label">Income</span>
                        <span className="stat-amount">₹{proj.income.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="project-stat expense">
                        <span className="stat-label">Expense</span>
                        <span className="stat-amount">₹{proj.expense.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="project-stat net">
                        <span className="stat-label">Net</span>
                        <span className="stat-amount" style={{
                          color: proj.net >= 0 ? '#10B981' : '#EF4444'
                        }}>
                          ₹{proj.net.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="project-stat count">
                        <span className="stat-label">Entries</span>
                        <span className="stat-amount">{proj.count}</span>
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="project-entries-detail">
                      <table className="investments-table">
                        <thead>
                          <tr>
                            <th>Type</th>
                            <th>Source</th>
                            <th>Amount</th>
                            <th>Frequency</th>
                            <th>Date</th>
                            <th>Notes</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {projectEntries.map((e) => (
                            <tr key={e._id}>
                              <td>
                                <span className="investment-type-badge" style={{
                                  background: e.type === 'Income' ? 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)' : 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)'
                                }}>
                                  {e.type}
                                </span>
                              </td>
                              <td>{e.source || e.provider || '—'}</td>
                              <td>₹{(e.amount || 0).toLocaleString('en-IN')}</td>
                              <td>{e.frequency || 'one-time'}</td>
                              <td>{new Date(e.startDate).toLocaleDateString('en-IN')}</td>
                              <td>{e.notes || '—'}</td>
                              <td>
                                <div className="investment-actions">
                                  <button onClick={() => handleEdit(e)} className="btn-icon">
                                    <FiEdit2 />
                                  </button>
                                  <button onClick={() => handleDelete(e._id)} className="btn-icon btn-danger">
                                    <FiTrash2 />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {entries.length === 0 && !loading && (
        <div className="empty-state">
          <p>No project records found. Add your first entry to get started!</p>
        </div>
      )}

      {showForm && (
        <div ref={formRef} className="investment-form-card">
          <h2>{editingId ? 'Edit Record' : 'Add New Record'}</h2>
          <form onSubmit={handleSubmit} className="investment-form">
            <div className="form-row">
              <div className="form-field">
                <label>Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  required
                >
                  <option value="Income">Income</option>
                  <option value="Expense">Expense</option>
                </select>
              </div>

              <div className="form-field">
                <label>Project Name *</label>
                <div className="project-input-group">
                  <select
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  >
                    <option value="">Select Project...</option>
                    {projects.map(project => (
                      <option key={project._id} value={project.name}>
                        {project.name}
                      </option>
                    ))}
                    <option value="custom">+ Add Custom Project</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleAddProject}
                    className="btn-add-project"
                    title="Add New Project"
                  >
                    <FiPlus />
                  </button>
                </div>
                {formData.name === 'custom' && (
                  <input
                    type="text"
                    placeholder="Enter custom project name"
                    value={formData.customName || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value, customName: e.target.value })}
                    required
                  />
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>Source</label>
                <input
                  type="text"
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  placeholder="e.g., Client Payment, Equipment Purchase"
                />
              </div>

              <div className="form-field">
                <label>Amount *</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="₹"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>Date *</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>

              <div className="form-field">
                <label>Frequency *</label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                  required
                >
                  <option value="one-time">One-time</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-field full-width">
                <label>Notes</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional details"
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">{editingId ? 'Update' : 'Save'}</button>
              <button type="button" className="btn-secondary" onClick={resetForm}>Reset</button>
            </div>
          </form>
        </div>
      )}

      {/* Project Modal */}
      <ProjectModal
        isOpen={showProjectModal}
        onClose={() => {
          setShowProjectModal(false);
          setEditingProject(null);
        }}
        onSave={handleSaveProject}
        project={editingProject}
      />
    </div>
  );
};

export default ProjectIncomeExpense;
