import { Router, Request, Response, NextFunction } from "express";
import { authenticate } from "../middleware/auth";
import { getUserNotifications, markNotificationAsRead } from "../services/notificationService";

const router = Router();

/**
 * GET /api/notifications
 * Get notifications for current user
 */
router.get("/", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const list = await getUserNotifications(req.user!.uid);
    return res.json({ success: true, data: list });
  } catch (err) {
    next(err);
  }
});

const handleMarkRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await markNotificationAsRead(id, req.user!.uid);
    if (!result.success) {
      if (result.error === "FORBIDDEN") {
        return res.status(403).json({
          success: false,
          error: "Unauthorized. You cannot modify notifications belonging to another user.",
          code: "FORBIDDEN",
        });
      }
      return res.status(404).json({
        success: false,
        error: `Notification ${id} not found.`,
        code: "NOT_FOUND",
      });
    }
    return res.json({ success: true, message: "Marked as read." });
  } catch (err) {
    next(err);
  }
};

router.put("/:id/read", authenticate, handleMarkRead);
router.patch("/:id/read", authenticate, handleMarkRead);

export default router;
