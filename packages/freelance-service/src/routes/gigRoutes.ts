import { Router } from "express";
import { currentUser, requireAuth } from "../middleware/auth";
import { GigService } from "../services/gigService";
import {
  CreateGigSchema,
  GigListQuerySchema,
  GigSearchQuerySchema,
  IdParamSchema,
  UpdateGigSchema,
} from "../validations/schemas";

export const createGigRouter = (gigs: GigService) => {
  const router = Router();

  router.get("/", async (req, res) => {
    const { status, ...pagination } = GigListQuerySchema.parse(req.query);
    const { items, pagination: meta } = await gigs.list({ status }, pagination);
    res.json({ success: true, data: items, pagination: meta });
  });

  // Must be registered before "/:id" so "search" is not treated as an id.
  router.get("/search", async (req, res) => {
    const { query, skills, status, ...pagination } = GigSearchQuerySchema.parse(req.query);
    const { items, pagination: meta } = await gigs.list({ query, skills, status }, pagination);
    res.json({ success: true, data: items, pagination: meta });
  });

  router.get("/client/:clientId", async (req, res) => {
    const { id } = IdParamSchema.parse({ id: req.params.clientId });
    res.json({ success: true, data: await gigs.listByClient(id) });
  });

  router.get("/:id", async (req, res) => {
    const { id } = IdParamSchema.parse(req.params);
    res.json({ success: true, data: await gigs.get(id) });
  });

  router.post("/", requireAuth, async (req, res) => {
    const gig = await gigs.create(currentUser(req), CreateGigSchema.parse(req.body));
    res.status(201).json({ success: true, data: gig });
  });

  router.put("/:id", requireAuth, async (req, res) => {
    const { id } = IdParamSchema.parse(req.params);
    const gig = await gigs.update(currentUser(req), id, UpdateGigSchema.parse(req.body));
    res.json({ success: true, data: gig });
  });

  router.delete("/:id", requireAuth, async (req, res) => {
    const { id } = IdParamSchema.parse(req.params);
    await gigs.remove(currentUser(req), id);
    res.json({ success: true, message: "GIG_DELETED" });
  });

  return router;
};
