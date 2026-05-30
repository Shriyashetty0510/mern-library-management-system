import React, { useEffect, useState } from "react";
import { transactionsAPI } from "../utils/api";

export default function Dashboard() {
  const [stats, setStats]   = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      transactionsAPI.stats(),
      transactionsAPI.getAll(),
    ]).then(([s, t]) => {
      setStats(s.data.data);
      setRecent(t.data.data.slice(0, 7));
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-wrap"><div className="spinner" /></div>;

  const CARDS = [
    { label: "Total Books",    val: stats.totalBooks,    icon: "📚", color: "#6292c4" },
    { label: "Available",      val: stats.available,     icon: "✅", color: "#4d9e73" },
    { label: "Active Members", val: stats.totalMembers,  icon: "👥", color: "#c8a96e" },
    { label: "Active Loans",   val: stats.activeLoans,   icon: "🔄", color: "#6292c4" },
    { label: "Overdue",        val: stats.overdueLoans,  icon: "⚠️", color: "#c46060" },
    { label: "Total Returned", val: stats.returnedLoans, icon: "📥", color: "#4d9e73" },
  ];

  const statusBadge = (s) => {
    const map = { active: "badge-blue", returned: "badge-green", overdue: "badge-red" };
    return <span className={`badge ${map[s] || "badge-gray"}`}>{s}</span>;
  };

  const totalForPct = stats.genreData?.reduce((a, g) => a + g.count, 0) || 1;

  return (
    <div className="page-enter">
      {/* Stat cards */}
      <div className="stats-grid">
        {CARDS.map((c) => (
          <div className="stat-card" key={c.label}>
            <div className="stat-label">
              <span className="stat-icon">{c.icon}</span>
              {c.label}
            </div>
            <div className="stat-value" style={{ color: c.color }}>{c.val}</div>
          </div>
        ))}
      </div>

      {/* Two-column section */}
      <div className="dash-grid">

        {/* Recent transactions */}
        <div className="card">
          <div className="card-body">
            <p className="section-header">Recent Transactions</p>
            {recent.length === 0 && (
              <div className="empty-state"><span className="empty-state-icon">🔄</span><p>No transactions yet</p></div>
            )}
            {recent.map((t) => (
              <div key={t._id} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "9px 0", borderBottom: "0.5px solid var(--border)",
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.2 }}>
                    {t.book?.title?.length > 26 ? t.book.title.slice(0, 26) + "…" : t.book?.title}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2 }}>
                    {t.member?.name} · {new Date(t.issueDate).toLocaleDateString("en-IN")}
                  </div>
                </div>
                {statusBadge(t.status)}
              </div>
            ))}
          </div>
        </div>

        {/* Genre distribution */}
        <div className="card">
          <div className="card-body">
            <p className="section-header">Books by Genre</p>
            {(stats.genreData || []).map((g) => {
              const pct = Math.round((g.count / totalForPct) * 100);
              return (
                <div key={g._id} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 12, color: "var(--text2)" }}>{g._id}</span>
                    <span style={{ fontSize: 11, color: "var(--text3)" }}>{g.count} copies</span>
                  </div>
                  <div style={{ height: 4, background: "var(--bg5)", borderRadius: 2 }}>
                    <div style={{
                      height: "100%", background: "var(--accent)",
                      borderRadius: 2, width: `${pct}%`, minWidth: 4,
                      transition: "width 0.6s ease",
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
