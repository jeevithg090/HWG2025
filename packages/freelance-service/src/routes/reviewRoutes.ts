import express, { Request, Response } from "express";
import { ReviewService } from "../services/reviewService";
import { CreateReviewSchema } from "../validations/reviewValidation";
import { responseMapping } from "../constants/responseMapping";
import logger from "../common/logger";

const router = express.Router();
const reviewService = new ReviewService();

// Get all reviews with pagination
router.get("/", async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const reviews = await reviewService.getAllReviews({}, page, limit);
    res.status(responseMapping.SUCCESS.code).json({ success: true, data: reviews });
  } catch (error: any) {
    logger.error(`Error fetching reviews: ${error.message}`);
    res.status(responseMapping.SERVER_ERROR.code).json({ 
      success: false, 
      message: responseMapping.SERVER_ERROR.message 
    });
  }
});

// Get a specific review by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const review = await reviewService.getReviewById(req.params.id);
    if (!review) {
      return res.status(responseMapping.NOT_FOUND.code).json({ 
        success: false, 
        message: "Review not found" 
      });
    }
    res.status(responseMapping.SUCCESS.code).json({ success: true, data: review });
  } catch (error: any) {
    logger.error(`Error fetching review: ${error.message}`);
    res.status(responseMapping.SERVER_ERROR.code).json({ 
      success: false, 
      message: responseMapping.SERVER_ERROR.message 
    });
  }
});

// Create a new review
router.post("/", async (req: Request, res: Response) => {
  try {
    const validatedData = CreateReviewSchema.parse(req.body);
    const review = await reviewService.createReview(validatedData);
    res.status(responseMapping.CREATED.code).json({ success: true, data: review });
  } catch (error: any) {
    logger.error(`Error creating review: ${error.message}`);
    if (error.name === "ZodError") {
      return res.status(responseMapping.VALIDATION_ERROR.code).json({
        success: false,
        message: "Validation error",
        errors: error.errors
      });
    }
    res.status(responseMapping.SERVER_ERROR.code).json({ 
      success: false, 
      message: responseMapping.SERVER_ERROR.message 
    });
  }
});

// Delete a review
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const deleted = await reviewService.deleteReview(req.params.id);
    if (!deleted) {
      return res.status(responseMapping.NOT_FOUND.code).json({ 
        success: false, 
        message: "Review not found" 
      });
    }
    res.status(responseMapping.SUCCESS.code).json({ 
      success: true, 
      message: "Review deleted successfully" 
    });
  } catch (error: any) {
    logger.error(`Error deleting review: ${error.message}`);
    res.status(responseMapping.SERVER_ERROR.code).json({ 
      success: false, 
      message: responseMapping.SERVER_ERROR.message 
    });
  }
});

// Get reviews by gig ID
router.get("/gig/:gigId", async (req: Request, res: Response) => {
  try {
    const reviews = await reviewService.getReviewsByGigId(req.params.gigId);
    res.status(responseMapping.SUCCESS.code).json({ success: true, data: reviews });
  } catch (error: any) {
    logger.error(`Error fetching gig reviews: ${error.message}`);
    res.status(responseMapping.SERVER_ERROR.code).json({ 
      success: false, 
      message: responseMapping.SERVER_ERROR.message 
    });
  }
});

// Get reviews given by a reviewer
router.get("/reviewer/:reviewerId", async (req: Request, res: Response) => {
  try {
    const reviews = await reviewService.getReviewsByReviewerId(req.params.reviewerId);
    res.status(responseMapping.SUCCESS.code).json({ success: true, data: reviews });
  } catch (error: any) {
    logger.error(`Error fetching reviewer reviews: ${error.message}`);
    res.status(responseMapping.SERVER_ERROR.code).json({ 
      success: false, 
      message: responseMapping.SERVER_ERROR.message 
    });
  }
});

// Get reviews received by a reviewee
router.get("/reviewee/:revieweeId", async (req: Request, res: Response) => {
  try {
    const reviews = await reviewService.getReviewsByRevieweeId(req.params.revieweeId);
    res.status(responseMapping.SUCCESS.code).json({ success: true, data: reviews });
  } catch (error: any) {
    logger.error(`Error fetching reviewee reviews: ${error.message}`);
    res.status(responseMapping.SERVER_ERROR.code).json({ 
      success: false, 
      message: responseMapping.SERVER_ERROR.message 
    });
  }
});

export const reviewRoutes = router;
