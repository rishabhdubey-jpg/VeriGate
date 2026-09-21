// alert.controller.js
import { db } from "../config/db.js";
import { AuditService } from "../services/auditService.js";

export const getAlerts = async (req, res, next) => {
  try {
    const { severity, status } = req.query;
    let list = db.get("alerts");

    if (severity && severity !== "ALL") {
      list = list.filter((a) => a.severity?.toLowerCase() === severity.toLowerCase());
    }

    if (status && status !== "ALL") {
      list = list.filter((a) => a.status?.toLowerCase() === status.toLowerCase());
    }

    res.status(200).json({ success: true, count: list.length, data: list });
  } catch (error) {
    next(error);
  }
};

export const updateAlert = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = db.findById("alerts", id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Alert not found" });
    }

    const updated = db.update("alerts", id, req.body);

    AuditService.log({
      officer: "Alex Singh",
      action: `Alert ${req.body.status || "Updated"}`,
      entity: "Alert",
      entityId: id,
      result: `Status set to '${updated.status}'`,
    });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

export const getAlertById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = db.findById("alerts", id);
    if (!item) {
      return res.status(404).json({ success: false, message: "Alert not found" });
    }

    const associatedCase = item.caseId ? db.findById("cases", item.caseId) : null;
    const associatedScreening = item.verificationId ? db.findById("screenings", item.verificationId) : null;

    res.status(200).json({
      success: true,
      data: {
        ...item,
        associatedCase,
        associatedScreening,
      },
    });
  } catch (error) {
    next(error);
  }
};

