import React, { useState, useCallback } from "react";
import Sidebar from "./components/Sidebar";
import Toast from "./components/Toast";
import Dashboard from "./pages/Dashboard";
import Books from "./pages/Books";
import Members from "./pages/Members";
import Transactions from "./pages/Transactions";

const PAGE_TITLES = {
  dashboard:    "Dashboard",
  books:        "Books",
  members:      "Members",
  transactions: "Transactions",
};

export default function App() {
  const [page, setPage]     = useState("dashboard");
  const [toasts, setToasts] = useState([]);
  const [overdue, setOverdue] = useState(0);

  // Toast helper passed down to all pages
  const toast = useCallback((msg, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, msg, type }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const now = new Date().toLocaleDateString("en-IN", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const renderPage = () => {
    const props = { toast };
    switch (page) {
      case "dashboard":    return <Dashboard {...props} onOverdue={setOverdue} />;
      case "books":        return <Books {...props} />;
      case "members":      return <Members {...props} />;
      case "transactions": return <Transactions {...props} />;
      default:             return <Dashboard {...props} />;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar active={page} onNav={setPage} overdueCount={overdue} />

      <div className="main-content">
        {/* Top bar */}
        <header className="topbar">
          <div>
            <div className="topbar-title">{PAGE_TITLES[page]}</div>
            <div className="topbar-date">{now}</div>
          </div>
        </header>

        {/* Page body */}
        <main className="page-body">
          {renderPage()}
        </main>
      </div>

      {/* Global toast notifications */}
      <Toast toasts={toasts} remove={removeToast} />
    </div>
  );
}
