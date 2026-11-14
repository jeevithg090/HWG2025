import { Router } from "express";
import { currentUser, requireAuth } from "../middleware/auth";
import { DashboardService } from "../services/dashboardService";
import { IdParamSchema } from "../validations/schemas";

export const createDashboardRouter = (dashboard: DashboardService) => {
  const router = Router();
  router.use(requireAuth);

  router.get("/client/:clientId", async (req, res) => {
    const { id } = IdParamSchema.parse({ id: req.params.clientId });
    res.json({ success: true, data: await dashboard.client(currentUser(req), id) });
  });

  router.get("/freelancer/:freelancerId", async (req, res) => {
    const { id } = IdParamSchema.parse({ id: req.params.freelancerId });
    res.json({ success: true, data: await dashboard.freelancer(currentUser(req), id) });
  });

  router.get("/admin/stats", async (req, res) => {
    res.json({ success: true, data: await dashboard.admin(currentUser(req)) });
  });

  return router;
};
