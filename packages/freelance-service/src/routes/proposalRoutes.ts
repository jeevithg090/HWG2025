import { Router } from "express";
import { currentUser, requireAuth } from "../middleware/auth";
import { ProposalService } from "../services/proposalService";
import {
  CreateProposalSchema,
  IdParamSchema,
  PaginationSchema,
  UpdateProposalSchema,
} from "../validations/schemas";

/** Proposals contain private bids, so every route requires authentication. */
export const createProposalRouter = (proposals: ProposalService) => {
  const router = Router();
  router.use(requireAuth);

  router.get("/", async (req, res) => {
    const pagination = PaginationSchema.parse(req.query);
    const { items, pagination: meta } = await proposals.listAll(currentUser(req), pagination);
    res.json({ success: true, data: items, pagination: meta });
  });

  router.get("/gig/:gigId", async (req, res) => {
    const { id } = IdParamSchema.parse({ id: req.params.gigId });
    res.json({ success: true, data: await proposals.listForGig(currentUser(req), id) });
  });

  router.get("/freelancer/:freelancerId", async (req, res) => {
    const { id } = IdParamSchema.parse({ id: req.params.freelancerId });
    res.json({ success: true, data: await proposals.listForFreelancer(currentUser(req), id) });
  });

  router.get("/:id", async (req, res) => {
    const { id } = IdParamSchema.parse(req.params);
    res.json({ success: true, data: await proposals.get(currentUser(req), id) });
  });

  router.post("/", async (req, res) => {
    const proposal = await proposals.create(currentUser(req), CreateProposalSchema.parse(req.body));
    res.status(201).json({ success: true, data: proposal });
  });

  router.put("/:id", async (req, res) => {
    const { id } = IdParamSchema.parse(req.params);
    const input = UpdateProposalSchema.parse(req.body);
    res.json({ success: true, data: await proposals.update(currentUser(req), id, input) });
  });

  router.delete("/:id", async (req, res) => {
    const { id } = IdParamSchema.parse(req.params);
    await proposals.remove(currentUser(req), id);
    res.json({ success: true, message: "PROPOSAL_DELETED" });
  });

  return router;
};
