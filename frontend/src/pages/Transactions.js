import React, { useEffect, useState, useCallback } from "react";
import { transactionsAPI, booksAPI, membersAPI } from "../utils/api";
import Modal from "../components/Modal";

export default function Transactions({ toast }) {
  const [txns, setTxns]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusF, setStatusF] = useState("");
  const [modal, setModal]     = useState(false);
  const [books, setBooks]     = useState([]);
  const [members, setMembers] = useState([]);
  const [form, setForm]       = useState({});
  const [errors, setErrors]   = useState({});
  const [submitting, setSub]  = useState(false);

  const fetchTxns = useCallback(async () => {
    setLoading(true);
    try {
      const res = await transactionsAPI.getAll({ status: statusF });
      setTxns(res.data.data);
    } catch {
      toast("Failed to load transactions", "error");
    } finally {
      setLoading(false);
    }
  }, [statusF]);

  useEffect(() => { fetchTxns(); }, [fetchTxns]);

  const openIssue = async () => {
    try {
      const [b, m] = await Promise.all([
        booksAPI.getAll({ genre: "" }),
        membersAPI.getAll({ status: "active" }),
      ]);
      setBooks(b.data.data.filter((bk) => bk.available > 0));
      setMembers(m.data.data);
    } catch {
      toast("Could not load data", "error");
      return;
    }
    setForm({}); setErrors({}); setModal(true);
  };

  const handleIssue = async () => {
    const e = {};
    if (!form.bookId)   e.bookId   = "Please select a book";
    if (!form.memberId) e.memberId = "Please select a member";
    setErrors(e);
    if (Object.keys(e).length) return;

    setSub(true);
    try {
      await transactionsAPI.issue({ bookId: form.bookId, memberId: form.memberId });
      toast("Book issued successfully — due in 14 days");
      setModal(false);
      fetchTxns();
    } catch (err) {
      toast(err.response?.data?.message || "Issue failed", "error");
    } finally {
      setSub(false);
    }
  };

  const handleReturn = async (id) => {
    if (!window.confirm("Mark this book as returned?")) return;
    try {
      const res = await transactionsAPI.return(id);
      const fine = res.data.fine;
      toast(fine > 0 ? `Book returned. Fine collected: ₹${fine}` : "Book returned successfully");
      fetchTxns();
    } catch (err) {
      toast(err.response?.data?.message || "Return failed", "error");
    }
  };

  const statusBadge = (s) => {
    const map = { active: "badge-blue", returned: "badge-green", overdue: "badge-red" };
    return <span className={`badge ${map[s] || "badge-gray"}`}>{s}</span>;
  };

  const dueIn = (dueDate) => {
    const diff = Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return <span style={{ color: "var(--red)", fontSize: 11 }}>{Math.abs(diff)}d overdue</span>;
    if (diff === 0) return <span style={{ color: "var(--accent)", fontSize: 11 }}>Due today</span>;
    return <span style={{ color: "var(--text3)", fontSize: 11 }}>Due in {diff}d</span>;
  };

  return (
    <div className="page-enter">
      <div className="filter-bar">
        <select style={{ width: 180 }} value={statusF} onChange={(e) => setStatusF(e.target.value)}>
          <option value="">All Transactions</option>
          <option value="active">Active</option>
          <option value="returned">Returned</option>
          <option value="overdue">Overdue</option>
        </select>
        <div style={{ flex: 1 }} />
        <button className="btn btn-primary" onClick={openIssue}>📤 Issue Book</button>
      </div>

      {loading ? (
        <div className="loading-wrap"><div className="spinner" /></div>
      ) : txns.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state-icon">🔄</span>
          <p>No transactions found.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {["Book", "Member", "Issued On", "Due Date", "Returned On", "Fine (₹)", "Status", "Action"].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {txns.map((t) => (
                <tr key={t._id}>
                  <td>
                    <div style={{ fontWeight: 500, fontSize: 13, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {t.book?.title || "Unknown"}
                    </div>
                    <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 1 }}>{t.book?.author}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: 13 }}>{t.member?.name || "Unknown"}</div>
                    <div style={{ fontSize: 10, color: "var(--text3)" }}>{t.member?.email}</div>
                  </td>
                  <td style={{ fontSize: 12, color: "var(--text3)" }}>
                    {new Date(t.issueDate).toLocaleDateString("en-IN")}
                  </td>
                  <td>
                    <div style={{ fontSize: 12, color: t.status === "overdue" ? "var(--red)" : "var(--text2)" }}>
                      {new Date(t.dueDate).toLocaleDateString("en-IN")}
                    </div>
                    {t.status !== "returned" && dueIn(t.dueDate)}
                  </td>
                  <td style={{ fontSize: 12, color: "var(--text3)" }}>
                    {t.returnDate ? new Date(t.returnDate).toLocaleDateString("en-IN") : "—"}
                  </td>
                  <td style={{ fontSize: 12, color: t.fine > 0 ? "var(--red)" : "var(--text3)", fontWeight: t.fine > 0 ? 600 : 400 }}>
                    {t.fine > 0 ? `₹${t.fine}` : "—"}
                  </td>
                  <td>{statusBadge(t.status)}</td>
                  <td>
                    {t.status !== "returned" && (
                      <button className="btn btn-success btn-sm" onClick={() => handleReturn(t._id)}>
                        Return
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <Modal title="Issue a Book" onClose={() => setModal(false)}>
          <div className="form-row">
            <label className="form-label">Select Book *</label>
            <select value={form.bookId || ""} onChange={(e) => setForm((p) => ({ ...p, bookId: e.target.value }))}>
              <option value="">— Choose an available book —</option>
              {books.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.title} · {b.author} ({b.available} available)
                </option>
              ))}
            </select>
            {errors.bookId && <span className="form-error">{errors.bookId}</span>}
          </div>
          <div className="form-row">
            <label className="form-label">Select Member *</label>
            <select value={form.memberId || ""} onChange={(e) => setForm((p) => ({ ...p, memberId: e.target.value }))}>
              <option value="">— Choose an active member —</option>
              {members.map((m) => (
                <option key={m._id} value={m._id}>{m.name} · {m.email}</option>
              ))}
            </select>
            {errors.memberId && <span className="form-error">{errors.memberId}</span>}
          </div>
          <div className="info-box">
            📅 Due date will be set to <strong style={{ color: "var(--text)", marginLeft: 4 }}>14 days</strong> from today.
            Late returns incur a fine of ₹5/day.
          </div>
          <button className="form-submit" onClick={handleIssue} disabled={submitting}>
            {submitting ? "Issuing…" : "Issue Book"}
          </button>
        </Modal>
      )}
    </div>
  );
}
