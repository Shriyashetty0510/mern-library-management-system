import React from "react";

const NAV = [
  { id: "dashboard",    icon: "📊", label: "Dashboard"    },
  { id: "books",        icon: "📚", label: "Books"        },
  { id: "members",      icon: "👥", label: "Members"      },
  { id: "transactions", icon: "🔄", label: "Transactions" },
];

export default function Sidebar({ active, onNav, overdueCount }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">📖</div>
        <div>
          <div className="logo-text">Biblios</div>
          <div className="logo-sub">Library System</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV.map((n) => (
          <button
            key={n.id}
            className={`nav-item ${active === n.id ? "active" : ""}`}
            onClick={() => onNav(n.id)}
          >
            <span className="nav-icon">{n.icon}</span>
            <span>{n.label}</span>
            {n.id === "transactions" && overdueCount > 0 && (
              <span className="nav-badge">{overdueCount}</span>
            )}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <p>Biblios LMS · v1.0</p>
      </div>
    </aside>
  );
}
