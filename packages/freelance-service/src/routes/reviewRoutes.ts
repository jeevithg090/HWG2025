import { Router } from "express";
import { currentUser, requireAuth } from "../middleware/auth";
import { ReviewService } from "../services/reviewService";
import { CreateReviewSchema, IdParamSchema, PaginationSchema } from "../validations/schemas";

export const createReviewRouter = (reviews: ReviewService) => {
  const router = Router();

  router.get("/", async (req, res) => {
    const pagination = PaginationSchema.parse(req.query);
    const { items, pagination: meta } = await reviews.list({}, pagination);
    res.json({ success: true, data: items, pagination: meta });
  });

  router.get("/gig/:gigId", async (req, res) => {
    const { id } = IdParamSchema.parse({ id: req.params.gigId });
    res.json({ success: true, data: await reviews.listBy({ gigId: id }) });
  });

  router.get("/reviewer/:reviewerId", async (req, res) => {
    const { id } = IdParamSchema.parse({ id: req.params.reviewerId });
    res.json({ success: true, data: await reviews.listBy({ reviewerId: id }) });
  });

  router.get("/reviewee/:revieweeId", async (req, res) => {
    const { id } = IdParamSchema.parse({ id: req.params.revieweeId });
    const [data, averageRating] = await Promise.all([
      reviews.listBy({ revieweeId: id }),
      reviews.averageRating(id),
    ]);
    res.json({ success: true, data, averageRating });
  });

  router.get("/:id", async (req, res) => {
    const { id } = IdParamSchema.parse(req.params);
    res.json({ success: true, data: await reviews.get(id) });
  });

  router.post("/", requireAuth, async (req, res) => {
    const review = await reviews.create(currentUser(req), CreateReviewSchema.parse(req.body));
    res.status(201).json({ success: true, data: review });
  });

  router.delete("/:id", requireAuth, async (req, res) => {
    const { id } = IdParamSchema.parse(req.params);
    await reviews.remove(currentUser(req), id);
    res.json({ success: true, message: "REVIEW_DELETED" });
  });

  return router;
};
