import { useState, useEffect } from 'react';
import '../reports/Reports.css';

const API_BASE = 'http://localhost:5001/api';

const gradeColors = { A: '#10b981', B: '#3b82f6', C: '#f59e0b', D: '#ef4444' };
const gradeLabel = { A: 'Excellent', B: 'Good', C: 'Average', D: 'Needs Attention' };

export default function CompletionReport() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/reports/completion`, { headers: { Authorization: `Bearer ${token}` } });
        const json = await res.json();
        if (json.success) setData(json);
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, []);

  const getColor = (pct) => pct >= 80 ? '#10b981' : pct >= 60 ? '#3b82f6' : pct >= 40 ? '#f59e0b' : '#ef4444';

  return (
    <div className="report-page">
      <div className="report-header">
        <h1 className="report-title">✅ % Completion</h1>
        <p className="report-subtitle">Forms and fields marked for completion — how complete is your financial profile?</p>
      </div>

      {loading ? (
        <div className="loading-state"><div className="loading-spinner"></div>Calculating completeness...</div>
      ) : !data ? (
        <div className="empty-state">Failed to load data.</div>
      ) : (
        <>
          {/* Overall Score Card */}
          <div style={{ display: 'flex', gap: 20, marginBottom: 28, flexWrap: 'wrap' }}>
            <div style={{
              background: 'white', borderRadius: 20, padding: '28px 36px', border: '1px solid #e2e8f0',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 180,
            }}>
              <div style={{
                width: 90, height: 90, borderRadius: '50%', border: `6px solid ${gradeColors[data.overall.grade] || '#10b981'}`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: 12,
              }}>
                <div style={{ fontSize: 26, fontWeight: 900, color: gradeColors[data.overall.grade] }}>{data.overall.score}%</div>
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: gradeColors[data.overall.grade] }}>Grade {data.overall.grade}</div>
              <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>{gradeLabel[data.overall.grade]}</div>
            </div>

            <div style={{ flex: 1, background: 'white', borderRadius: 20, padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <div className="chart-title" style={{ marginBottom: 20 }}>Section-wise Completion</div>
              <div className="section-completion">
                {data.sections.map((sec, i) => (
                  <div key={i} className="completion-row">
                    <div className="completion-label">{sec.label}</div>
                    <div className="progress-bar-wrap">
                      <div className="progress-bar-fill" style={{ width: `${sec.average}%`, background: getColor(sec.average) }}></div>
                    </div>
                    <div className="completion-pct" style={{ color: getColor(sec.average) }}>{sec.average}%</div>
                    <div style={{ fontSize: 12, color: '#94a3b8', width: 50 }}>{sec.count} records</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Alerts */}
          {data.sections.filter(s => s.average < 60).length > 0 && (
            <div className="report-table-card" style={{ borderLeft: '4px solid #f59e0b', marginBottom: 20 }}>
              <div className="chart-title" style={{ color: '#92400e', marginBottom: 10 }}>⚠️ Sections Needing Attention</div>
              {data.sections.filter(s => s.average < 60).map((sec, i) => (
                <div key={i} className="alert-row alert-warning">
                  <span>📋</span>
                  <span style={{ fontWeight: 600 }}>{sec.label}</span>
                  <div className="progress-bar-wrap" style={{ maxWidth: 200 }}>
                    <div className="progress-bar-fill" style={{ width: `${sec.average}%`, background: '#f59e0b' }}></div>
                  </div>
                  <span style={{ fontWeight: 700 }}>{sec.average}% complete</span>
                  <span style={{ color: '#78350f', fontSize: 12 }}>{sec.count} records • fill in missing fields</span>
                </div>
              ))}
            </div>
          )}

          {/* Section Drill-down */}
          {data.sections.map((sec, si) => (
            <div key={si} className="report-table-card" style={{ marginBottom: 14 }}>
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                onClick={() => setExpandedSection(expandedSection === si ? null : si)}
              >
                <div className="chart-title" style={{ margin: 0 }}>
                  {expandedSection === si ? '▼' : '▶'} {sec.label}
                  <span style={{ marginLeft: 12, fontSize: 13, fontWeight: 400, color: '#64748b' }}>{sec.count} records</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="progress-bar-wrap" style={{ width: 120 }}>
                    <div className="progress-bar-fill" style={{ width: `${sec.average}%`, background: getColor(sec.average) }}></div>
                  </div>
                  <span style={{ fontWeight: 800, color: getColor(sec.average), fontSize: 15, width: 40 }}>{sec.average}%</span>
                </div>
              </div>

              {expandedSection === si && (
                <div style={{ marginTop: 18 }}>
                  <table className="report-table">
                    <thead><tr><th>#</th><th>Record Name</th><th>Fields Filled</th><th>Total Fields</th><th>Completion</th></tr></thead>
                    <tbody>
                      {sec.items.map((item, ii) => (
                        <tr key={ii}>
                          <td style={{ color: '#94a3b8' }}>{item.index}</td>
                          <td style={{ fontWeight: 600 }}>{item.name}</td>
                          <td style={{ color: '#10b981', fontWeight: 600 }}>{item.filled}</td>
                          <td style={{ color: '#64748b' }}>{item.total}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div className="progress-bar-wrap" style={{ maxWidth: 160 }}>
                                <div className="progress-bar-fill" style={{ width: `${item.percentage}%`, background: getColor(item.percentage) }}></div>
                              </div>
                              <span style={{ fontWeight: 700, color: getColor(item.percentage), fontSize: 13, width: 42 }}>{item.percentage}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}

          {data.sections.length === 0 && (
            <div className="empty-state">
              <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
              <div style={{ fontWeight: 600 }}>No records found to score.</div>
              <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 6 }}>Start adding investments, loans, and other financial records to see completion scores.</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
