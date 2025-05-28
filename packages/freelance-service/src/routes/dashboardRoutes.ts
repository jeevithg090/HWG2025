import express, { Request, Response } from "express";
import { GigService } from "../services/gigService";
import { ProposalService } from "../services/proposalService";
import { ReviewService } from "../services/reviewService";
import { responseMapping } from "../constants/responseMapping";
import logger from "../common/logger";

const router = express.Router();
const gigService = new GigService();
const proposalService = new ProposalService();
const reviewService = new ReviewService();

// Get client dashboard stats
router.get("/client/:clientId", async (req: Request, res: Response) => {
  try {
    const { clientId } = req.params;

    // Get client's gigs with their proposals and reviews
    const gigs = await gigService.getGigsByClientId(clientId);
    const gigStats = await Promise.all(
      gigs.map(async (gig) => {
        const proposals = await proposalService.getProposalsByGigId(gig.id);
        const reviews = await reviewService.getReviewsByGigId(gig.id);

        return {
          gig,
          proposalCount: proposals.length,
          averageRating: reviews.length
            ? reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length
            : null,
        };
      })
    );

    const stats = {
      totalGigs: gigs.length,
      activeGigs: gigs.filter(
        (g) => g.status !== "completed" && g.status !== "cancelled"
      ).length,
      completedGigs: gigs.filter((g) => g.status === "completed").length,
      gigs: gigStats,
    };

    res
      .status(responseMapping.SUCCESS.code)
      .json({ success: true, data: stats });
  } catch (error: any) {
    logger.error(`Error fetching client dashboard: ${error.message}`);
    res.status(responseMapping.SERVER_ERROR.code).json({
      success: false,
      message: responseMapping.SERVER_ERROR.message,
    });
  }
});

// Get freelancer dashboard stats
router.get("/freelancer/:freelancerId", async (req: Request, res: Response) => {
  try {
    const { freelancerId } = req.params;

    // Get freelancer's proposals and reviews
    const proposals =
      await proposalService.getProposalsByFreelancerId(freelancerId);
    const reviews = await reviewService.getReviewsByRevieweeId(freelancerId);

    const stats = {
      totalProposals: proposals.length,
      acceptedProposals: proposals.filter((p) => p.status === "accepted")
        .length,
      pendingProposals: proposals.filter((p) => p.status === "pending").length,
      averageRating: reviews.length
        ? reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length
        : null,
      recentProposals: proposals.slice(0, 5),
      recentReviews: reviews.slice(0, 5),
    };

    res
      .status(responseMapping.SUCCESS.code)
      .json({ success: true, data: stats });
  } catch (error: any) {
    logger.error(`Error fetching freelancer dashboard: ${error.message}`);
    res.status(responseMapping.SERVER_ERROR.code).json({
      success: false,
      message: responseMapping.SERVER_ERROR.message,
    });
  }
});

// Get system stats
router.get("/admin/stats", async (req: Request, res: Response) => {
  try {
    const gigs = await gigService.getAllGigs();
    const proposals = await proposalService.getAllProposals();
    const reviews = await reviewService.getAllReviews();

    const stats = {
      totalGigs: gigs.length,
      activeGigs: gigs.filter(
        (g) => g.status !== "completed" && g.status !== "cancelled"
      ).length,
      totalProposals: proposals.length,
      acceptedProposals: proposals.filter((p) => p.status === "accepted")
        .length,
      averageRating: reviews.length
        ? reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length
        : null,
      recentGigs: gigs.slice(0, 5),
      recentProposals: proposals.slice(0, 5),
    };

    res
      .status(responseMapping.SUCCESS.code)
      .json({ success: true, data: stats });
  } catch (error: any) {
    logger.error(`Error fetching admin dashboard: ${error.message}`);
    res.status(responseMapping.SERVER_ERROR.code).json({
      success: false,
      message: responseMapping.SERVER_ERROR.message,
    });
  }
});

export const dashboardRoutes = router;
