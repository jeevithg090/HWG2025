import express, { Request, Response } from "express";
import { ProposalService } from "../services/proposalService";
import {
  CreateProposalSchema,
  UpdateProposalSchema,
} from "../validations/proposalValidation";
import { responseMapping } from "../constants/responseMapping";
import logger from "../common/logger";

const router = express.Router();
const proposalService = new ProposalService();

// Get all proposals with pagination
router.get("/", async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const proposals = await proposalService.getAllProposals({}, page, limit);
    res
      .status(responseMapping.SUCCESS.code)
      .json({ success: true, data: proposals });
  } catch (error: any) {
    logger.error(`Error fetching proposals: ${error.message}`);
    res.status(responseMapping.SERVER_ERROR.code).json({
      success: false,
      message: responseMapping.SERVER_ERROR.message,
    });
  }
});

// Get a specific proposal by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const proposal = await proposalService.getProposalById(req.params.id);
    if (!proposal) {
      return res.status(responseMapping.NOT_FOUND.code).json({
        success: false,
        message: "Proposal not found",
      });
    }
    res
      .status(responseMapping.SUCCESS.code)
      .json({ success: true, data: proposal });
  } catch (error: any) {
    logger.error(`Error fetching proposal: ${error.message}`);
    res.status(responseMapping.SERVER_ERROR.code).json({
      success: false,
      message: responseMapping.SERVER_ERROR.message,
    });
  }
});

// Create a new proposal
router.post("/", async (req: Request, res: Response) => {
  try {
    const validatedData = CreateProposalSchema.parse(req.body);
    const proposal = await proposalService.createProposal(validatedData);
    res
      .status(responseMapping.CREATED.code)
      .json({ success: true, data: proposal });
  } catch (error: any) {
    logger.error(`Error creating proposal: ${error.message}`);
    if (error.name === "ZodError") {
      return res.status(responseMapping.VALIDATION_ERROR.code).json({
        success: false,
        message: "Validation error",
        errors: error.errors,
      });
    }
    res.status(responseMapping.SERVER_ERROR.code).json({
      success: false,
      message: responseMapping.SERVER_ERROR.message,
    });
  }
});

// Update a proposal
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const validatedData = UpdateProposalSchema.parse(req.body);
    const updatedProposal = await proposalService.updateProposal(
      req.params.id,
      validatedData
    );
    if (!updatedProposal) {
      return res.status(responseMapping.NOT_FOUND.code).json({
        success: false,
        message: "Proposal not found",
      });
    }
    res
      .status(responseMapping.SUCCESS.code)
      .json({ success: true, data: updatedProposal });
  } catch (error: any) {
    logger.error(`Error updating proposal: ${error.message}`);
    if (error.name === "ZodError") {
      return res.status(responseMapping.VALIDATION_ERROR.code).json({
        success: false,
        message: "Validation error",
        errors: error.errors,
      });
    }
    res.status(responseMapping.SERVER_ERROR.code).json({
      success: false,
      message: responseMapping.SERVER_ERROR.message,
    });
  }
});

// Delete a proposal
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const deleted = await proposalService.deleteProposal(req.params.id);
    if (!deleted) {
      return res.status(responseMapping.NOT_FOUND.code).json({
        success: false,
        message: "Proposal not found",
      });
    }
    res.status(responseMapping.SUCCESS.code).json({
      success: true,
      message: "Proposal deleted successfully",
    });
  } catch (error: any) {
    logger.error(`Error deleting proposal: ${error.message}`);
    res.status(responseMapping.SERVER_ERROR.code).json({
      success: false,
      message: responseMapping.SERVER_ERROR.message,
    });
  }
});

// Get proposals by gig ID
router.get("/gig/:gigId", async (req: Request, res: Response) => {
  try {
    const proposals = await proposalService.getProposalsByGigId(
      req.params.gigId
    );
    res
      .status(responseMapping.SUCCESS.code)
      .json({ success: true, data: proposals });
  } catch (error: any) {
    logger.error(`Error fetching gig proposals: ${error.message}`);
    res.status(responseMapping.SERVER_ERROR.code).json({
      success: false,
      message: responseMapping.SERVER_ERROR.message,
    });
  }
});

// Get proposals by freelancer ID
router.get("/freelancer/:freelancerId", async (req: Request, res: Response) => {
  try {
    const proposals = await proposalService.getProposalsByFreelancerId(
      req.params.freelancerId
    );
    res
      .status(responseMapping.SUCCESS.code)
      .json({ success: true, data: proposals });
  } catch (error: any) {
    logger.error(`Error fetching freelancer proposals: ${error.message}`);
    res.status(responseMapping.SERVER_ERROR.code).json({
      success: false,
      message: responseMapping.SERVER_ERROR.message,
    });
  }
});

export const proposalRoutes = router;
