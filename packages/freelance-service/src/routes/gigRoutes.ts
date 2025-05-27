import express, { Request, Response } from "express";
import { GigService } from "../services/gigService";
import { CreateGigSchema, UpdateGigSchema } from "../validations/gigValidation";
import { responseMapping } from "../constants/responseMapping";
import logger from "../common/logger";

const router = express.Router();
const gigService = new GigService();

// Get all gigs with pagination
router.get("/", async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const gigs = await gigService.getAllGigs({}, page, limit);
    res.status(responseMapping.SUCCESS.code).json({ success: true, data: gigs });
  } catch (error: any) {
    logger.error(`Error fetching gigs: ${error.message}`);
    res.status(responseMapping.SERVER_ERROR.code).json({ 
      success: false, 
      message: responseMapping.SERVER_ERROR.message 
    });
  }
});

// Get a specific gig by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const gig = await gigService.getGigById(req.params.id);
    if (!gig) {
      return res.status(responseMapping.NOT_FOUND.code).json({ 
        success: false, 
        message: "Gig not found" 
      });
    }
    res.status(responseMapping.SUCCESS.code).json({ success: true, data: gig });
  } catch (error: any) {
    logger.error(`Error fetching gig: ${error.message}`);
    res.status(responseMapping.SERVER_ERROR.code).json({ 
      success: false, 
      message: responseMapping.SERVER_ERROR.message 
    });
  }
});

// Create a new gig
router.post("/", async (req: Request, res: Response) => {
  try {
    const validatedData = CreateGigSchema.parse(req.body);
    const gig = await gigService.createGig(validatedData);
    res.status(responseMapping.CREATED.code).json({ success: true, data: gig });
  } catch (error: any) {
    logger.error(`Error creating gig: ${error.message}`);
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

// Update a gig
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const validatedData = UpdateGigSchema.parse(req.body);
    const updatedGig = await gigService.updateGig(req.params.id, validatedData);
    if (!updatedGig) {
      return res.status(responseMapping.NOT_FOUND.code).json({ 
        success: false, 
        message: "Gig not found" 
      });
    }
    res.status(responseMapping.SUCCESS.code).json({ success: true, data: updatedGig });
  } catch (error: any) {
    logger.error(`Error updating gig: ${error.message}`);
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

// Delete a gig
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const deleted = await gigService.deleteGig(req.params.id);
    if (!deleted) {
      return res.status(responseMapping.NOT_FOUND.code).json({ 
        success: false, 
        message: "Gig not found" 
      });
    }
    res.status(responseMapping.SUCCESS.code).json({ 
      success: true, 
      message: "Gig deleted successfully" 
    });
  } catch (error: any) {
    logger.error(`Error deleting gig: ${error.message}`);
    res.status(responseMapping.SERVER_ERROR.code).json({ 
      success: false, 
      message: responseMapping.SERVER_ERROR.message 
    });
  }
});

// Search gigs
router.get("/search", async (req: Request, res: Response) => {
  try {
    const { query, skills } = req.query;
    const skillsArray = typeof skills === 'string' ? skills.split(',') : undefined;
    const gigs = await gigService.searchGigs(query as string, skillsArray);
    res.status(responseMapping.SUCCESS.code).json({ success: true, data: gigs });
  } catch (error: any) {
    logger.error(`Error searching gigs: ${error.message}`);
    res.status(responseMapping.SERVER_ERROR.code).json({ 
      success: false, 
      message: responseMapping.SERVER_ERROR.message 
    });
  }
});

// Get gigs by client ID
router.get("/client/:clientId", async (req: Request, res: Response) => {
  try {
    const gigs = await gigService.getGigsByClientId(req.params.clientId);
    res.status(responseMapping.SUCCESS.code).json({ success: true, data: gigs });
  } catch (error: any) {
    logger.error(`Error fetching client gigs: ${error.message}`);
    res.status(responseMapping.SERVER_ERROR.code).json({ 
      success: false, 
      message: responseMapping.SERVER_ERROR.message 
    });
  }
});

export const gigRoutes = router;
