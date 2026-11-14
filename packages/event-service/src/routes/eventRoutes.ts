import { Router } from "express";
import { currentUser, optionalAuth, requireAuth } from "../middleware/auth";
import { EventService } from "../services/eventService";
import {
  CreateEventSchema,
  EventQuerySchema,
  IdSchema,
  MarkAttendanceSchema,
  UpdateEventSchema,
} from "../validations/eventValidation";

export const createEventRouter = (events: EventService) => {
  const router = Router();

  router.get("/", optionalAuth, async (req, res) => {
    const result = await events.list(EventQuerySchema.parse(req.query), req.user);
    res.json({ success: true, ...result });
  });

  router.get("/user/:userId", requireAuth, async (req, res) => {
    const registrations = await events.userRegistrations(
      currentUser(req),
      IdSchema.parse(req.params.userId),
    );
    res.json({ success: true, events: registrations });
  });

  router.post("/attendees/:attendeeId/mark-attendance", requireAuth, async (req, res) => {
    const { hasAttended } = MarkAttendanceSchema.parse(req.body ?? {});
    const attendee = await events.markAttendance(
      currentUser(req),
      IdSchema.parse(req.params.attendeeId),
      hasAttended,
    );
    res.json({ success: true, attendee });
  });

  router.get("/:id", optionalAuth, async (req, res) => {
    const event = await events.get(IdSchema.parse(req.params.id), req.user);
    res.json({ success: true, event });
  });

  router.post("/", requireAuth, async (req, res) => {
    const event = await events.create(currentUser(req), CreateEventSchema.parse(req.body));
    res.status(201).json({ success: true, event });
  });

  router.put("/:id", requireAuth, async (req, res) => {
    const event = await events.update(
      currentUser(req),
      IdSchema.parse(req.params.id),
      UpdateEventSchema.parse(req.body),
    );
    res.json({ success: true, event });
  });

  router.delete("/:id", requireAuth, async (req, res) => {
    await events.remove(currentUser(req), IdSchema.parse(req.params.id));
    res.json({ success: true, message: "EVENT_DELETED" });
  });

  router.post("/:id/register", requireAuth, async (req, res) => {
    const { message, attendee } = await events.register(
      currentUser(req),
      IdSchema.parse(req.params.id),
    );
    res.json({ success: true, message, attendee });
  });

  router.post("/:id/cancel", requireAuth, async (req, res) => {
    await events.cancel(currentUser(req), IdSchema.parse(req.params.id));
    res.json({ success: true, message: "REGISTRATION_CANCELLED" });
  });

  router.get("/:id/attendees", requireAuth, async (req, res) => {
    const attendees = await events.attendees(currentUser(req), IdSchema.parse(req.params.id));
    res.json({ success: true, attendees });
  });

  return router;
};
