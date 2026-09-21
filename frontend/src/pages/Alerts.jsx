import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  AlertOctagon,
  Clock,
  Check,
  RotateCcw,
  Eye,
  FileCheck2,
  FolderOpen,
  X,
  RefreshCw,
} from "lucide-react";
import { api } from "../utils/api";

export default function Alerts() {
  const location = useLocation();
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const params = [];
      if (severityFilter !== "ALL") params.push(`severity=${encodeURIComponent(severityFilter)}`);
      if (statusFilter !== "ALL") params.push(`status=${encodeURIComponent(statusFilter)}`);
      const query = params.length > 0 ? `?${params.join("&")}` : "";

      const res = await api.getAlerts(query);
      if (res?.data) {
        setAlerts(res.data);
      }
    } catch (err) {
      console.error("Error loading alerts:", err);
    } finally {
      setLoading(false);
    }
  };

  const openAlertDetails = async (alertOrId) => {
    const alertId = typeof alertOrId === "string" ? alertOrId : alertOrId?.id;
    if (!alertId) return;

    if (typeof alertOrId === "object" && alertOrId !== null) {
      setSelectedAlert(alertOrId);
    }
    setModalLoading(true);

    try {
      const res = await api.getAlert(alertId);
      if (res?.data) {
        setSelectedAlert(res.data);
      }
    } catch (err) {
      console.warn("Could not fetch detailed alert record:", err);
    } finally {
      setModalLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, [severityFilter, statusFilter]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const targetId = params.get("id") || params.get("alertId");
    if (targetId) {
      openAlertDetails(targetId);
    }
  }, [location.search]);

  const updateAlertStatus = async (id, newStatus) => {
    try {
      const res = await api.updateAlert(id, { status: newStatus });
      if (res?.data) {
        setAlerts((prev) => prev.map((a) => (a.id === id ? res.data : a)));
      }
    } catch (err) {
      alert(`Could not update alert: ${err.message}`);
    }
  };

  return (
    <div className="alerts-page">
      {/* PAGE HEADING */}
      <section className="page-heading">
        <div>
          <span className="eyebrow">REAL-TIME THREAT MONITORING</span>
          <h1>Security Alerts</h1>
          <p>Active anomaly notifications, watchlist triggers, and biometric discrepancy events.</p>
        </div>
      </section>

      {/* FILTERS */}
      <div className="cases-filter-bar">
        <div className="filter-dropdowns">
          <div className="select-wrapper">
            <span>Severity:</span>
            <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)}>
              <option value="ALL">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
            </select>
          </div>

          <div className="select-wrapper">
            <span>Status:</span>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="ALL">All Statuses</option>
              <option value="New">New</option>
              <option value="Acknowledged">Acknowledged</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      {/* ALERTS LIST */}
      <div className="alerts-container">
        {loading ? (
          <div className="panel p-6 text-center">Loading security alerts...</div>
        ) : alerts.length === 0 ? (
          <div className="panel p-6 text-center muted">No alerts match the selected criteria.</div>
        ) : (
          alerts.map((alert) => {
            const sev = (alert.severity || "High").toLowerCase();
            const Icon = sev === "critical" ? AlertOctagon : AlertTriangle;

            return (
              <div
                key={alert.id}
                className={`alert-card-item ${sev}`}
                style={{ cursor: "pointer" }}
                onClick={() => openAlertDetails(alert)}
              >
                <div className={`alert-card-icon ${sev}`}>
                  <Icon size={22} />
                </div>

                <div className="alert-card-content">
                  <div className="alert-card-header">
                    <div>
                      <span className="alert-id-tag">{alert.id}</span>
                      <h3>{alert.title}</h3>
                    </div>
                    <div className="alert-badges-row">
                      <span className={`severity ${sev}`}>{alert.severity}</span>
                      <span className={`status-pill ${(alert.status || "New").toLowerCase()}`}>
                        {alert.status}
                      </span>
                    </div>
                  </div>

                  <p className="alert-desc">{alert.description}</p>

                  <div className="alert-card-footer">
                    <div className="alert-meta-tags">
                      <span>Type: {alert.type || "Document Tampering"}</span>
                      {alert.verificationId && (
                        <button
                          type="button"
                          className="text-button"
                          style={{ padding: "0 4px", fontSize: 11, textDecoration: "underline" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/history?id=${alert.verificationId}`);
                          }}
                        >
                          Verification: {alert.verificationId}
                        </button>
                      )}
                      {alert.caseId && (
                        <button
                          type="button"
                          className="text-button"
                          style={{ padding: "0 4px", fontSize: 11, textDecoration: "underline" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/cases?id=${alert.caseId}`);
                          }}
                        >
                          Case: {alert.caseId}
                        </button>
                      )}
                      <span className="alert-time">
                        <Clock size={12} /> {alert.time || "Recent"}
                      </span>
                    </div>

                    <div className="alert-action-buttons">
                      <button
                        type="button"
                        className="secondary-button btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          openAlertDetails(alert);
                        }}
                      >
                        <Eye size={13} /> View Details
                      </button>

                      {alert.status === "New" && (
                        <button
                          type="button"
                          className="secondary-button btn-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateAlertStatus(alert.id, "Acknowledged");
                          }}
                        >
                          <Check size={13} /> Acknowledge
                        </button>
                      )}

                      {alert.status !== "Resolved" && (
                        <button
                          type="button"
                          className="primary-button btn-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateAlertStatus(alert.id, "Resolved");
                          }}
                        >
                          <CheckCircle2 size={13} /> Resolve
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ALERT DETAILS MODAL */}
      {selectedAlert && (
        <div className="modal-overlay" onClick={() => setSelectedAlert(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="eyebrow">SECURITY ALERT DOSSIER</span>
                <h2>{selectedAlert.id} — {selectedAlert.title}</h2>
                <p>Status: {selectedAlert.status} · Severity: {selectedAlert.severity}</p>
              </div>
              <button className="icon-button" onClick={() => setSelectedAlert(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              {modalLoading && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", color: "#64748b", fontSize: 13 }}>
                  <RefreshCw size={14} className="spin" /> Loading alert details...
                </div>
              )}

              <div className="case-meta-grid">
                <div>
                  <span>Threat Classification:</span>
                  <strong>{selectedAlert.type || "Document Anomaly"}</strong>
                </div>
                <div>
                  <span>Severity Level:</span>
                  <strong style={{ color: selectedAlert.severity === "Critical" ? "#b91c1c" : selectedAlert.severity === "High" ? "#ea580c" : "#ca8a04" }}>
                    {selectedAlert.severity}
                  </strong>
                </div>
                <div>
                  <span>Status:</span>
                  <strong>{selectedAlert.status}</strong>
                </div>
                <div>
                  <span>Detection Time:</span>
                  <strong>{selectedAlert.timestamp ? new Date(selectedAlert.timestamp).toLocaleString() : (selectedAlert.time || "Recent")}</strong>
                </div>
              </div>

              <div className="case-section">
                <h3>Incident Description</h3>
                <p className="case-notes-box" style={{ lineHeight: 1.6, fontSize: 13 }}>
                  {selectedAlert.description}
                </p>
              </div>

              {/* ASSOCIATED VERIFICATION */}
              {selectedAlert.verificationId && (
                <div className="case-section" style={{ background: "#f8fafc", padding: "12px 14px", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 600, fontSize: 13, color: "#1e293b" }}>
                      <FileCheck2 size={16} style={{ color: "#0284c7" }} />
                      <span>Associated Screening Dossier ({selectedAlert.verificationId})</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff", padding: "8px 10px", borderRadius: 6, border: "1px solid #cbd5e1" }}>
                    <div>
                      <strong style={{ fontSize: 13, color: "#0f172a" }}>{selectedAlert.verificationId}</strong> —{" "}
                      <span style={{ fontSize: 12, color: "#475569" }}>
                        {selectedAlert.associatedScreening
                          ? `${selectedAlert.associatedScreening.documentType} (${selectedAlert.associatedScreening.personName || "N/A"}) · Risk: ${selectedAlert.associatedScreening.riskScore}/100`
                          : "Primary screening event record"}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="secondary-button"
                      style={{ padding: "4px 10px", fontSize: 12 }}
                      onClick={() => {
                        setSelectedAlert(null);
                        navigate(`/history?id=${selectedAlert.verificationId}`);
                      }}
                    >
                      View Verification
                    </button>
                  </div>
                </div>
              )}

              {/* ASSOCIATED CASE */}
              {selectedAlert.caseId && (
                <div className="case-section" style={{ background: "#f0f9ff", padding: "12px 14px", borderRadius: 8, border: "1px solid #bae6fd" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 600, fontSize: 13, color: "#0369a1" }}>
                      <FolderOpen size={16} style={{ color: "#0284c7" }} />
                      <span>Associated Case File ({selectedAlert.caseId})</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff", padding: "8px 10px", borderRadius: 6, border: "1px solid #93c5fd" }}>
                    <div>
                      <strong style={{ fontSize: 13, color: "#0f172a" }}>{selectedAlert.caseId}</strong> —{" "}
                      <span style={{ fontSize: 12, color: "#475569" }}>
                        {selectedAlert.associatedCase
                          ? `Status: ${selectedAlert.associatedCase.status} · Officer: ${selectedAlert.associatedCase.assignedOfficer}`
                          : "Case management record"}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="secondary-button"
                      style={{ padding: "4px 10px", fontSize: 12 }}
                      onClick={() => {
                        setSelectedAlert(null);
                        navigate(`/cases?id=${selectedAlert.caseId}`);
                      }}
                    >
                      Open Case
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              {selectedAlert.status === "New" && (
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => {
                    updateAlertStatus(selectedAlert.id, "Acknowledged");
                    setSelectedAlert({ ...selectedAlert, status: "Acknowledged" });
                  }}
                >
                  <Check size={14} /> Acknowledge Alert
                </button>
              )}
              {selectedAlert.status !== "Resolved" && (
                <button
                  type="button"
                  className="primary-button"
                  onClick={() => {
                    updateAlertStatus(selectedAlert.id, "Resolved");
                    setSelectedAlert({ ...selectedAlert, status: "Resolved" });
                  }}
                >
                  <CheckCircle2 size={14} /> Mark as Resolved
                </button>
              )}
              <button className="secondary-button" onClick={() => setSelectedAlert(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
