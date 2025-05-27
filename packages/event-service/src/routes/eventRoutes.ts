import express, { RequestHandler } from "express";
import { 
  CreateEventSchema,
  UpdateEventSchema,
  RegisterForEventSchema,
  EventQuerySchema
} from "../validations/eventValidation";
import { EventService } from "../services/eventService";
import { Event } from "../models/event";
import responseStatusMap from "../constants/responseMapping";
import { CreateEventInput, RegisterEventInput } from "../types/createEventTypes";

const eventRouter = express.Router();
const eventService: EventService = new EventService();

// Create a new event
eventRouter.post("/", (async (req, res) => {
  try {
    const reqBody = req.body;
    CreateEventSchema.parse(reqBody);
    
    const newEvent = await eventService.createEvent(reqBody as CreateEventInput);
    
    res.status(201).json({ 
      success: true, 
      event: newEvent 
    });
  } catch (error) {
    let errorMessage: string = "INTERNAL_SERVER_ERROR";
    let status: number = 500;

    if (error instanceof Error) {
      errorMessage = error.message;
    }
    status = responseStatusMap[errorMessage] || 500;
    
    res.status(status).json({ 
      success: false, 
      message: errorMessage 
    });
  }
}) as RequestHandler);

// Get all events with optional filters
eventRouter.get("/", (async (req, res) => {
  try {
    const { 
      isActive, 
      eventType, 
      isPublished, 
      page, 
      limit 
    } = req.query;
    
    const parsedQuery = EventQuerySchema.parse({
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      eventType: eventType as string | undefined,
      isPublished: isPublished === 'true' ? true : isPublished === 'false' ? false : undefined,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    });
    
    const { events, total } = await eventService.findEvents(parsedQuery);
    
    res.status(200).json({
      success: true,
      events,
      pagination: {
        total,
        page: parsedQuery.page || 1,
        limit: parsedQuery.limit || 10,
        pages: Math.ceil(total / (parsedQuery.limit || 10))
      }
    });
  } catch (error) {
    let errorMessage: string = "INTERNAL_SERVER_ERROR";
    let status: number = 500;

    if (error instanceof Error) {
      errorMessage = error.message;
    }
    status = responseStatusMap[errorMessage] || 500;
    
    res.status(status).json({ 
      success: false, 
      message: errorMessage 
    });
  }
}) as RequestHandler);

// Get event by ID
eventRouter.get("/:id", (async (req, res) => {
  try {
    const { id } = req.params;
    const event = await eventService.findEventById(id);
    
    if (!event) {
      return res.status(404).json({ 
        success: false, 
        message: "EVENT_NOT_FOUND" 
      });
    }
    
    res.status(200).json({ 
      success: true, 
      event 
    });
  } catch (error) {
    let errorMessage: string = "INTERNAL_SERVER_ERROR";
    let status: number = 500;

    if (error instanceof Error) {
      errorMessage = error.message;
    }
    status = responseStatusMap[errorMessage] || 500;
    
    res.status(status).json({ 
      success: false, 
      message: errorMessage 
    });
  }
}) as RequestHandler);

// Update event
eventRouter.put("/:id", (async (req, res) => {
  try {
    const { id } = req.params;
    const reqBody = req.body;
    UpdateEventSchema.parse(reqBody);
    
    const updatedEvent = await eventService.updateEvent(id, reqBody);
    
    if (!updatedEvent) {
      return res.status(404).json({ 
        success: false, 
        message: "EVENT_NOT_FOUND" 
      });
    }
    
    res.status(200).json({ 
      success: true, 
      event: updatedEvent 
    });
  } catch (error) {
    let errorMessage: string = "INTERNAL_SERVER_ERROR";
    let status: number = 500;

    if (error instanceof Error) {
      errorMessage = error.message;
    }
    status = responseStatusMap[errorMessage] || 500;
    
    res.status(status).json({ 
      success: false, 
      message: errorMessage 
    });
  }
}) as RequestHandler);

// Delete event
eventRouter.delete("/:id", (async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await eventService.deleteEvent(id);
    
    if (!deleted) {
      return res.status(404).json({ 
        success: false, 
        message: "EVENT_NOT_FOUND" 
      });
    }
    
    res.status(200).json({ 
      success: true, 
      message: "EVENT_DELETED" 
    });
  } catch (error) {
    let errorMessage: string = "INTERNAL_SERVER_ERROR";
    let status: number = 500;

    if (error instanceof Error) {
      errorMessage = error.message;
    }
    status = responseStatusMap[errorMessage] || 500;
    
    res.status(status).json({ 
      success: false, 
      message: errorMessage 
    });
  }
}) as RequestHandler);

// Register for an event
eventRouter.post("/:eventId/register", (async (req, res) => {
  try {
    const { eventId } = req.params;
    const reqBody = req.body;
    RegisterForEventSchema.parse(reqBody);
    
    const result = await eventService.registerForEvent(eventId, reqBody as RegisterEventInput);
    
    if (!result.success) {
      const status = responseStatusMap[result.message] || 400;
      return res.status(status).json({ 
        success: false, 
        message: result.message 
      });
    }
    
    res.status(200).json({ 
      success: true, 
      message: result.message,
      attendee: result.attendee
    });
  } catch (error) {
    let errorMessage: string = "INTERNAL_SERVER_ERROR";
    let status: number = 500;

    if (error instanceof Error) {
      errorMessage = error.message;
    }
    status = responseStatusMap[errorMessage] || 500;
    
    res.status(status).json({ 
      success: false, 
      message: errorMessage 
    });
  }
}) as RequestHandler);

// Cancel event registration
eventRouter.post("/:eventId/cancel", (async (req, res) => {
  try {
    const { eventId } = req.params;
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: "USER_ID_REQUIRED" 
      });
    }
    
    const result = await eventService.cancelRegistration(eventId, userId);
    
    if (!result.success) {
      const status = responseStatusMap[result.message] || 400;
      return res.status(status).json({ 
        success: false, 
        message: result.message 
      });
    }
    
    res.status(200).json({ 
      success: true, 
      message: result.message
    });
  } catch (error) {
    let errorMessage: string = "INTERNAL_SERVER_ERROR";
    let status: number = 500;

    if (error instanceof Error) {
      errorMessage = error.message;
    }
    status = responseStatusMap[errorMessage] || 500;
    
    res.status(status).json({ 
      success: false, 
      message: errorMessage 
    });
  }
}) as RequestHandler);

// Get event attendees
eventRouter.get("/:eventId/attendees", (async (req, res) => {
  try {
    const { eventId } = req.params;
    const attendees = await eventService.getEventAttendees(eventId);
    
    res.status(200).json({ 
      success: true, 
      attendees 
    });
  } catch (error) {
    let errorMessage: string = "INTERNAL_SERVER_ERROR";
    let status: number = 500;

    if (error instanceof Error) {
      errorMessage = error.message;
    }
    status = responseStatusMap[errorMessage] || 500;
    
    res.status(status).json({ 
      success: false, 
      message: errorMessage 
    });
  }
}) as RequestHandler);

// Mark attendance
eventRouter.post("/attendees/:attendeeId/mark-attendance", (async (req, res) => {
  try {
    const { attendeeId } = req.params;
    const { hasAttended = true } = req.body;
    
    const attendee = await eventService.markAttendance(attendeeId, hasAttended);
    
    if (!attendee) {
      return res.status(404).json({ 
        success: false, 
        message: "ATTENDEE_NOT_FOUND" 
      });
    }
    
    res.status(200).json({ 
      success: true, 
      attendee 
    });
  } catch (error) {
    let errorMessage: string = "INTERNAL_SERVER_ERROR";
    let status: number = 500;

    if (error instanceof Error) {
      errorMessage = error.message;
    }
    status = responseStatusMap[errorMessage] || 500;
    
    res.status(status).json({ 
      success: false, 
      message: errorMessage 
    });
  }
}) as RequestHandler);

// Get all events for a user
eventRouter.get("/user/:userId", (async (req, res) => {
  try {
    const { userId } = req.params;
    const eventAttendees = await eventService.getUserEvents(userId);
    
    res.status(200).json({ 
      success: true, 
      events: eventAttendees 
    });
  } catch (error) {
    let errorMessage: string = "INTERNAL_SERVER_ERROR";
    let status: number = 500;

    if (error instanceof Error) {
      errorMessage = error.message;
    }
    status = responseStatusMap[errorMessage] || 500;
    
    res.status(status).json({ 
      success: false, 
      message: errorMessage 
    });
  }
}) as RequestHandler);

export default eventRouter;
