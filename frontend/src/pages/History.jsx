import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  History as HistoryIcon,
  Search,
  Filter,
  Eye,
  FileCheck2,
  Calendar,
  X,
  ShieldCheck,
  AlertTriangle,
  ShieldAlert,
  FolderOpen,
  Bell,
  RefreshCw,
} from "lucide-react";
import { api } from "../utils/api";

function RiskBadge({ risk }) {
  const r = (risk || "LOW").toLowerCase();
  return <span className={`risk-badge ${r}`}>{risk}</span>;
}

function StatusBadge({ status }) {
  const s = (status || "Verified").toLowerCase();
  return <span className={`status-badge ${s}`}>{status}</span>;
}

export default function History() {
  const location = useLocation();
  const navigate = useNavigate();
  const [screenings, setScreenings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState("ALL");
  const [docTypeFilter, setDocTypeFilter] = useState("ALL");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const params = [];
      if (searchTerm) params.push(`search=${encodeURIComponent(searchTerm)}`);
      if (riskFilter !== "ALL") params.push(`risk=${encodeURIComponent(riskFilter)}`);
      if (docTypeFilter !== "ALL") params.push(`documentType=${encodeURIComponent(docTypeFilter)}`);
      const query = params.length > 0 ? `?${params.join("&")}` : "";

      const res = await api.getScreenings(query);
      if (res?.data) {
        setScreenings(res.data);
      }
    } catch (err) {
      console.error("Error loading verification history:", err);
    } finally {
      setLoading(false);
    }
  };

  const openRecordDetails = async (itemOrId) => {
    const recId = typeof itemOrId === "string" ? itemOrId : (itemOrId?.verificationId || itemOrId?.id);
    if (!recId) return;

    if (typeof itemOrId === "object" && itemOrId !== null) {
      setSelectedRecord(itemOrId);
    }
    setModalLoading(true);

    try {
      const res = await api.getScreening(recId);
      if (res?.data) {
        setSelectedRecord(res.data);
      }
    } catch (err) {
      console.warn("Could not fetch detailed verification dossier:", err);
    } finally {
      setModalLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [riskFilter, docTypeFilter]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const targetId = params.get("id") || params.get("verificationId");
    if (targetId) {
      openRecordDetails(targetId);
    }
  }, [location.search]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadHistory();
  };

  return (
    <div className="history-page">
      {/* PAGE HEADING */}
      <section className="page-heading">
        <div>
          <span className="eyebrow">SCREENING LOGS & AUDIT</span>
          <h1>Verification History</h1>
          <p>Complete historical ledger of all document screenings performed at checkpoints.</p>
        </div>
      </section>

      {/* FILTERS */}
      <div className="cases-filter-bar">
        <form onSubmit={handleSearchSubmit} className="cases-search-form">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search Verification ID, Person Name, Document Number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="secondary-button filter-btn">
            Search
          </button>
        </form>

        <div className="filter-dropdowns">
          <div className="select-wrapper">
            <span>Risk Level:</span>
            <select value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)}>
              <option value="ALL">All Risks</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>

          <div className="select-wrapper">
            <span>Doc Type:</span>
            <select value={docTypeFilter} onChange={(e) => setDocTypeFilter(e.target.value)}>
              <option value="ALL">All Types</option>
              <option value="Passport">Passport</option>
              <option value="Visa">Visa</option>
              <option value="National ID">National ID</option>
              <option value="Driving License">Driving License</option>
              <option value="Permit">Permit</option>
            </select>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="panel cases-table-panel">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Verification ID</th>
                <th>Person</th>
                <th>Document Type</th>
                <th>Document No.</th>
                <th>Risk Score</th>
                <th>Recommendation</th>
                <th>Status</th>
                <th>Timestamp</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="text-center py-6">
                    Loading verification history...
                  </td>
                </tr>
              ) : screenings.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-6 muted">
                    No verification records found.
                  </td>
                </tr>
              ) : (
                screenings.map((item) => (
                  <tr
                    key={item.id || item.verificationId}
                    style={{ cursor: "pointer" }}
                    onClick={() => openRecordDetails(item)}
                  >
                    <td className="screening-id">{item.verificationId || item.id}</td>
                    <td>
                      <strong>{item.personName || item.fullName || "N/A"}</strong>
                    </td>
                    <td>{item.documentType}</td>
                    <td>{item.documentNumber || item.docNum || "N/A"}</td>
                    <td>
                      <RiskBadge risk={item.riskLevel} />{" "}
                      <span className="small-score">({item.riskScore ?? 0}/100)</span>
                    </td>
                    <td>{item.recommendation || "N/A"}</td>
                    <td>
                      <StatusBadge status={item.status || "Verified"} />
                    </td>
                    <td className="muted">
                      {item.timestamp ? new Date(item.timestamp).toLocaleString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }) : "Recent"}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="text-button flex-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          openRecordDetails(item);
                        }}
                        title="View Full Verification Dossier"
                      >
                        <Eye size={14} /> View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selectedRecord && (
        <div className="modal-overlay" onClick={() => setSelectedRecord(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="eyebrow">VERIFICATION DOSSIER</span>
                <h2>{selectedRecord.verificationId || selectedRecord.id}</h2>
                <p>
                  Subject: {selectedRecord.personName || selectedRecord.fullName || "Unextracted Subject"}{" "}
                  ({selectedRecord.nationality || selectedRecord.ocr?.nationality || "N/A"})
                </p>
              </div>
              <button className="icon-button" onClick={() => setSelectedRecord(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              {modalLoading && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", color: "#64748b", fontSize: 13 }}>
                  <RefreshCw size={14} className="spin" /> Loading full dossier details...
                </div>
              )}

              <div className="case-meta-grid">
                <div>
                  <span>Document Type:</span>
                  <strong>{selectedRecord.documentType} ({selectedRecord.documentNumber || selectedRecord.ocr?.documentNumber || "N/A"})</strong>
                </div>
                <div>
                  <span>Risk Score:</span>
                  <strong>{selectedRecord.riskScore ?? 0}/100 ({selectedRecord.riskLevel || "LOW"})</strong>
                </div>
                <div>
                  <span>Decision:</span>
                  <strong>{selectedRecord.recommendation || "PROCEED"}</strong>
                </div>
                <div>
                  <span>Timestamp:</span>
                  <strong>{selectedRecord.timestamp ? new Date(selectedRecord.timestamp).toLocaleString() : "N/A"}</strong>
                </div>
              </div>

              {/* ASSOCIATED CASES */}
              {selectedRecord.relatedCases && selectedRecord.relatedCases.length > 0 && (
                <div className="case-section" style={{ background: "#f8fafc", padding: "12px 14px", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 600, fontSize: 13, color: "#1e293b" }}>
                      <FolderOpen size={16} style={{ color: "#3b82f6" }} />
                      <span>Associated Case Files ({selectedRecord.relatedCases.length})</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {selectedRecord.relatedCases.map((rc) => (
                      <div key={rc.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff", padding: "8px 10px", borderRadius: 6, border: "1px solid #cbd5e1" }}>
                        <div>
                          <strong style={{ fontSize: 13, color: "#0f172a" }}>{rc.id}</strong> — <span style={{ fontSize: 12, color: "#475569" }}>Status: {rc.status}</span>
                        </div>
                        <button
                          type="button"
                          className="secondary-button"
                          style={{ padding: "3px 8px", fontSize: 12 }}
                          onClick={() => {
                            setSelectedRecord(null);
                            navigate(`/cases?id=${rc.id}`);
                          }}
                        >
                          Open Case File
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ASSOCIATED ALERTS */}
              {selectedRecord.relatedAlerts && selectedRecord.relatedAlerts.length > 0 && (
                <div className="case-section" style={{ background: "#fef2f2", padding: "12px 14px", borderRadius: 8, border: "1px solid #fecaca" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 600, fontSize: 13, color: "#991b1b" }}>
                      <Bell size={16} style={{ color: "#ef4444" }} />
                      <span>Associated Security Alerts ({selectedRecord.relatedAlerts.length})</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {selectedRecord.relatedAlerts.map((ra) => (
                      <div key={ra.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff", padding: "8px 10px", borderRadius: 6, border: "1px solid #fca5a5" }}>
                        <div>
                          <strong style={{ fontSize: 13, color: "#7f1d1d" }}>{ra.id}</strong> — <span style={{ fontSize: 12, color: "#374151" }}>{ra.title}</span>
                        </div>
                        <button
                          type="button"
                          className="secondary-button"
                          style={{ padding: "3px 8px", fontSize: 12 }}
                          onClick={() => {
                            setSelectedRecord(null);
                            navigate(`/alerts?id=${ra.id}`);
                          }}
                        >
                          Open Alert
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="case-section">
                <h3>Decision Justification</h3>
                <ul className="modal-reasons-list">
                  {(selectedRecord.reasons || ["Document processed through screening pipeline."]).map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>

              {selectedRecord.ocr && (
                <div className="case-section">
                  <h3>Extracted OCR Fields</h3>
                  <div className="ocr-grid">
                    {Object.entries(selectedRecord.ocr)
                      .filter(([k, v]) => !["confidence", "fieldsDetected", "extractionTimeMs", "mrz", "sourceFile", "ocrStatus"].includes(k) && v !== null && v !== undefined && typeof v !== "object")
                      .map(([k, v]) => (
                        <div className="ocr-field" key={k}>
                          <span>{k.replace(/([A-Z])/g, " $1").trim()}</span>
                          <strong>{String(v)}</strong>
                        </div>
                      ))}
                  </div>
                  {selectedRecord.ocr.mrz && (
                    <div style={{ marginTop: 10, background: "#f1f5f9", padding: "8px 10px", borderRadius: 6, fontFamily: "monospace", fontSize: 11 }}>
                      <strong>MRZ:</strong>
                      <pre style={{ margin: "4px 0 0", whiteSpace: "pre-wrap" }}>{selectedRecord.ocr.mrz}</pre>
                    </div>
                  )}
                </div>
              )}

              {/* CHECKS SUMMARY */}
              {selectedRecord.checks && selectedRecord.checks.length > 0 && (
                <div className="case-section">
                  <h3>Verification Checks</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 8 }}>
                    {selectedRecord.checks.map((chk, i) => (
                      <div key={i} style={{ padding: "8px 10px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 6 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <strong style={{ fontSize: 12 }}>{chk.title}</strong>
                          <span style={{ fontSize: 10, padding: "2px 5px", borderRadius: 4, background: chk.status === "pass" ? "#dcfce7" : chk.status === "fail" ? "#fee2e2" : "#fef3c7", color: chk.status === "pass" ? "#15803d" : chk.status === "fail" ? "#b91c1c" : "#b45309" }}>
                            {chk.score || chk.status}
                          </span>
                        </div>
                        <small style={{ color: "#64748b", display: "block", marginTop: 3 }}>{chk.description}</small>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="case-section">
                <h3>Officer Directive</h3>
                <p className="case-notes-box">{selectedRecord.recommendedAction || "Proceed with standard processing."}</p>
              </div>
            </div>

            <div className="modal-footer">
              <button className="secondary-button" onClick={() => setSelectedRecord(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
