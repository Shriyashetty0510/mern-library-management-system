import React, { useEffect, useState, useCallback } from "react";
import { membersAPI } from "../utils/api";
import Modal from "../components/Modal";

export default function Members({ toast }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [statusF, setStatusF] = useState("");
  const [modal, setModal]     = useState(false);
  const [editM, setEditM]     = useState(null);
  const [form, setForm]       = useState({});
  const [errors, setErrors]   = useState({});
  const [submitting, setSub]  = useState(false);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await membersAPI.getAll({ search, status: statusF });
      setMembers(res.data.data);
    } catch {
      toast("Failed to load members", "error");
    } finally {
      setLoading(false);
    }
  }, [search, statusF]);

  useEffect(() => {
    const delay = setTimeout(fetchMembers, 300);
    return () => clearTimeout(delay);
  }, [fetchMembers]);

  const openAdd = () => {
    setEditM(null); setForm({}); setErrors({}); setModal(true);
  };
  const openEdit = (m) => {
    setEditM(m);
    setForm({ name: m.name, email: m.email, phone: m.phone, address: m.address });
    setErrors({}); setModal(true);
  };

  const validate = () => {
    const e = {};
    if (!form.name?.trim())  e.name  = "Name is required";
    if (!form.email?.trim()) e.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Invalid email format";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSub(true);
    try {
      if (editM) {
        await membersAPI.update(editM._id, form);
        toast("Member updated");
      } else {
        await membersAPI.create(form);
        toast("Member registered");
      }
      setModal(false);
      fetchMembers();
    } catch (err) {
      toast(err.response?.data?.message || "Something went wrong", "error");
    } finally {
      setSub(false);
    }
  };

  const toggleStatus = async (m) => {
    try {
      await membersAPI.update(m._id, { status: m.status === "active" ? "inactive" : "active" });
      toast(`Member ${m.status === "active" ? "deactivated" : "activated"}`);
      fetchMembers();
    } catch {
      toast("Update failed", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this member?")) return;
    try {
      await membersAPI.delete(id);
      toast("Member deleted");
      fetchMembers();
    } catch (err) {
      toast(err.response?.data?.message || "Delete failed", "error");
    }
  };

  const initials = (name) => name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "?";
  const f = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div className="page-enter">
      <div className="filter-bar">
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, email, or phone…" />
        </div>
        <select className="filter-select" value={statusF} onChange={(e) => setStatusF(e.target.value)}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <button className="btn btn-primary" onClick={openAdd}>＋ Add Member</button>
      </div>

      {loading ? (
        <div className="loading-wrap"><div className="spinner" /></div>
      ) : members.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state-icon">👥</span>
          <p>No members found.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {["Member", "Email", "Phone", "Address", "Joined", "Status", "Actions"].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m._id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div className="avatar">{initials(m.name)}</div>
                      <span style={{ fontWeight: 500, fontSize: 13 }}>{m.name}</span>
                    </div>
                  </td>
                  <td style={{ fontSize: 12, color: "var(--text2)" }}>{m.email}</td>
                  <td style={{ fontSize: 12, color: "var(--text2)" }}>{m.phone || "—"}</td>
                  <td style={{ fontSize: 12, color: "var(--text3)", maxWidth: 140 }}>
                    <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {m.address || "—"}
                    </div>
                  </td>
                  <td style={{ fontSize: 12, color: "var(--text3)" }}>
                    {new Date(m.createdAt).toLocaleDateString("en-IN")}
                  </td>
                  <td>
                    <span className={`badge ${m.status === "active" ? "badge-green" : "badge-gray"}`}>
                      {m.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(m)}>Edit</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => toggleStatus(m)}>
                        {m.status === "active" ? "Deactivate" : "Activate"}
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(m._id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <Modal title={editM ? "Edit Member" : "Register New Member"} onClose={() => setModal(false)}>
          <div className="form-row">
            <label className="form-label">Full Name *</label>
            <input value={form.name || ""} onChange={f("name")} placeholder="e.g. Riya Kapoor" />
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>
          <div className="form-row">
            <label className="form-label">Email Address *</label>
            <input type="email" value={form.email || ""} onChange={f("email")} placeholder="riya@example.com" />
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>
          <div className="form-grid">
            <div className="form-row">
              <label className="form-label">Phone</label>
              <input value={form.phone || ""} onChange={f("phone")} placeholder="9876543210" />
            </div>
            <div className="form-row">
              <label className="form-label">Address</label>
              <input value={form.address || ""} onChange={f("address")} placeholder="City, State" />
            </div>
          </div>
          <button className="form-submit" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Saving…" : editM ? "Update Member" : "Register Member"}
          </button>
        </Modal>
      )}
    </div>
  );
}
