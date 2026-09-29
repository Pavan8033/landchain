import { Router, Request, Response, NextFunction } from "express";
import { authenticate, requireRole } from "../middleware/auth";
import { getAuditLogs } from "../services/auditService";

const router = Router();

/**
 * GET /api/audit
 * Retrieve immutable audit logs (Restricted to Government Authorities)
 */
router.get(
  "/",
  authenticate,
  requireRole(["government"]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const logs = await getAuditLogs(limit);
      return res.json({ success: true, data: logs });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
