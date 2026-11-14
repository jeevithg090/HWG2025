/**
 * Typed HTTP client for the TechCollab backend services.
 *
 * Every function resolves (it never throws) to an {@link ApiResult}: either
 * `{ success: true, status, ...body }` mirroring the service's success payload,
 * or `{ success: false, status, message, errors? }`. A `status` of 0 means the
 * request never reached the server (network failure, CORS, service down).
 *
 * Callers are responsible for user-facing notifications (toasts etc.).
 */

import { config } from "./config";
import { getAuthHeaders, getAuthToken } from "./auth-utils";
import type {
  AuthUser,
  ClientDashboard,
  CreateEventPayload,
  CreateGigPayload,
  CreateProposalPayload,
  CreateReviewPayload,
  EventAttendee,
  EventFilters,
  FreelancerDashboard,
  Gig,
  LoginPayload,
  Pagination,
  Proposal,
  Review,
  ValidationIssue,
  SignupPayload,
  TechEvent,
  UpdateEventPayload,
  UpdateGigPayload,
  UpdateProposalPayload,
} from "./types";

export interface ApiError {
  success: false;
  status: number;
  message: string;
  errors?: unknown;
}

export type ApiSuccess<T> = { success: true; status: number } & T;

export type ApiResult<T> = ApiSuccess<T> | ApiError;

export type QueryValue = string | number | boolean | null | undefined | string[];

export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  query?: Record<string, QueryValue>;
  /** Explicit token; `undefined` falls back to the stored token, `null` sends none. */
  token?: string | null;
  /** When true the request is not sent unless a token is available. */
  requireAuth?: boolean;
  signal?: AbortSignal;
}

export const NETWORK_ERROR_MESSAGE =
  "Unable to reach the server. Please check your connection and try again.";
export const AUTH_REQUIRED_MESSAGE = "You need to sign in to do that.";

/** Builds a query string, skipping empty values and joining arrays with commas. */
export function buildQueryString(query?: Record<string, QueryValue>): string {
  if (!query) return "";
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    if (Array.isArray(value)) {
      if (value.length === 0) continue;
      params.set(key, value.join(","));
    } else {
      params.set(key, String(value));
    }
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

async function parseBody(response: Response): Promise<Record<string, unknown> | null> {
  const text = await response.text().catch(() => "");
  if (!text) return null;
  try {
    const parsed: unknown = JSON.parse(text);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : { data: parsed };
  } catch {
    return { message: text };
  }
}

function isFailureFlag(value: unknown): boolean {
  return value === false || value === 0;
}

function isValidationIssue(value: unknown): value is ValidationIssue {
  return (
    !!value &&
    typeof value === "object" &&
    typeof (value as { message?: unknown }).message === "string"
  );
}

/**
 * Turns `{ message: "VALIDATION_ERROR", errors: [{ path, message }] }` into a
 * readable sentence such as "title: Title must be at least 5 characters".
 */
export function formatValidationErrors(errors: unknown): string | null {
  if (!Array.isArray(errors)) return null;
  const parts = errors.filter(isValidationIssue).map((issue) => {
    const path = Array.isArray(issue.path) ? issue.path.join(".") : issue.path;
    return path ? `${path}: ${issue.message}` : issue.message;
  });
  return parts.length ? parts.join("; ") : null;
}

/**
 * Performs a JSON request against `baseUrl + path` and normalizes the result.
 */
export async function apiRequest<T extends object>(
  baseUrl: string,
  path: string,
  options: RequestOptions = {},
): Promise<ApiResult<T>> {
  const { method = "GET", body, query, requireAuth = false, signal } = options;
  // `undefined` means "use the stored token"; `null` explicitly sends none.
  const token = options.token === undefined ? getAuthToken() : options.token;

  if (requireAuth && !token) {
    return { success: false, status: 401, message: AUTH_REQUIRED_MESSAGE };
  }

  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}${buildQueryString(query)}`, {
      method,
      headers: getAuthHeaders({}, token),
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return { success: false, status: 0, message: "Request was cancelled." };
    }
    return { success: false, status: 0, message: NETWORK_ERROR_MESSAGE };
  }

  const payload = await parseBody(response);

  if (!response.ok || isFailureFlag(payload?.success)) {
    const validationMessage = formatValidationErrors(payload?.errors);
    const serverMessage =
      typeof payload?.message === "string" && payload.message ? payload.message : null;
    const message =
      (serverMessage === "VALIDATION_ERROR" || !serverMessage) && validationMessage
        ? validationMessage
        : serverMessage || response.statusText || `Request failed with status ${response.status}`;
    const error: ApiError = {
      success: false,
      status: response.ok ? 400 : response.status,
      message,
    };
    if (payload && "errors" in payload) error.errors = payload.errors;
    return error;
  }

  const rest: Record<string, unknown> = { ...(payload ?? {}) };
  delete rest.success;
  return { ...(rest as T), success: true, status: response.status };
}

/** Returns the error message for a failed result, or a fallback. */
export function getErrorMessage(result: ApiResult<object>, fallback: string): string {
  return result.success ? fallback : result.message || fallback;
}

const user = (path: string, options?: RequestOptions) =>
  apiRequest(config.userServiceUrl, path, options);
const freelance = (path: string, options?: RequestOptions) =>
  apiRequest(config.freelanceServiceUrl, path, options);
const events = (path: string, options?: RequestOptions) =>
  apiRequest(config.eventServiceUrl, path, options);

const enc = encodeURIComponent;

// ---------------------------------------------------------------------------
// User service
// ---------------------------------------------------------------------------

export const userApi = {
  signup: (payload: SignupPayload) =>
    user("/user/signup", { method: "POST", body: payload, token: null }) as Promise<
      ApiResult<{ user: AuthUser }>
    >,

  login: (credentials: LoginPayload) =>
    user("/user/login", { method: "POST", body: credentials, token: null }) as Promise<
      ApiResult<{ token: string; user: AuthUser; message?: string }>
    >,

  /** PATCH /user/profile with any of name, bio, skills. */
  updateProfile: (
    changes: { name?: string; bio?: string | null; skills?: string[] },
    token?: string | null,
  ) =>
    user("/user/profile", { method: "PATCH", body: changes, token, requireAuth: true }) as Promise<
      ApiResult<{ user: AuthUser }>
    >,

  getUserProfile: (token?: string | null) =>
    user("/user/profile", { token, requireAuth: true }) as Promise<ApiResult<{ user: AuthUser }>>,
};

// ---------------------------------------------------------------------------
// Event service
// ---------------------------------------------------------------------------

type EventsList = { events: TechEvent[]; pagination?: Pagination };

export const eventApi = {
  getAllEvents: (filters?: EventFilters, token?: string | null) =>
    events("/events", { query: { ...filters }, token }) as Promise<ApiResult<EventsList>>,

  getEventById: (eventId: string, token?: string | null) =>
    events(`/events/${enc(eventId)}`, { token }) as Promise<ApiResult<{ event: TechEvent }>>,

  createEvent: (payload: CreateEventPayload, token?: string | null) =>
    events("/events", { method: "POST", body: payload, token, requireAuth: true }) as Promise<
      ApiResult<{ event: TechEvent }>
    >,

  updateEvent: (eventId: string, payload: UpdateEventPayload, token?: string | null) =>
    events(`/events/${enc(eventId)}`, {
      method: "PUT",
      body: payload,
      token,
      requireAuth: true,
    }) as Promise<ApiResult<{ event: TechEvent }>>,

  deleteEvent: (eventId: string, token?: string | null) =>
    events(`/events/${enc(eventId)}`, {
      method: "DELETE",
      token,
      requireAuth: true,
    }) as Promise<ApiResult<{ message?: string }>>,

  /** The service takes the user's id/email from the token; `userName` is optional. */
  registerForEvent: (
    eventId: string,
    registration: { userName?: string } = {},
    token?: string | null,
  ) =>
    events(`/events/${enc(eventId)}/register`, {
      method: "POST",
      body: registration,
      token,
      requireAuth: true,
    }) as Promise<ApiResult<{ message?: string; attendee?: EventAttendee }>>,

  cancelRegistration: (eventId: string, token?: string | null) =>
    events(`/events/${enc(eventId)}/cancel`, {
      method: "POST",
      body: {},
      token,
      requireAuth: true,
    }) as Promise<ApiResult<{ message?: string }>>,

  getEventAttendees: (eventId: string, token?: string | null) =>
    events(`/events/${enc(eventId)}/attendees`, { token, requireAuth: true }) as Promise<
      ApiResult<{ attendees: EventAttendee[] }>
    >,

  markAttendance: (attendeeId: string, token?: string | null) =>
    events(`/events/attendees/${enc(attendeeId)}/mark-attendance`, {
      method: "POST",
      body: {},
      token,
      requireAuth: true,
    }) as Promise<ApiResult<{ attendee: EventAttendee }>>,

  getUserEvents: (userId: string, token?: string | null) =>
    events(`/events/user/${enc(userId)}`, { token }) as Promise<
      ApiResult<{ events: EventAttendee[] }>
    >,
};

// ---------------------------------------------------------------------------
// Freelance service
// ---------------------------------------------------------------------------

type Data<T> = { data: T };
type Paged<T> = { data: T[]; pagination?: Pagination };

export interface GigSearchParams {
  query?: string;
  skills?: string[];
}

export const freelanceApi = {
  getProjects: (filters?: { page?: number; limit?: number }, token?: string | null) =>
    freelance("/gigs", { query: { ...filters }, token }) as Promise<ApiResult<Paged<Gig>>>,

  searchProjects: (params: GigSearchParams, token?: string | null) =>
    freelance("/gigs/search", {
      query: { query: params.query, skills: params.skills },
      token,
    }) as Promise<ApiResult<Paged<Gig>>>,

  getGigById: (gigId: string, token?: string | null) =>
    freelance(`/gigs/${enc(gigId)}`, { token }) as Promise<ApiResult<Data<Gig>>>,

  getGigsByClientId: (clientId: string, token?: string | null) =>
    freelance(`/gigs/client/${enc(clientId)}`, { token }) as Promise<ApiResult<Paged<Gig>>>,

  createProject: (payload: CreateGigPayload, token?: string | null) =>
    freelance("/gigs", { method: "POST", body: payload, token, requireAuth: true }) as Promise<
      ApiResult<Data<Gig>>
    >,

  updateGig: (gigId: string, payload: UpdateGigPayload, token?: string | null) =>
    freelance(`/gigs/${enc(gigId)}`, {
      method: "PUT",
      body: payload,
      token,
      requireAuth: true,
    }) as Promise<ApiResult<Data<Gig>>>,

  deleteGig: (gigId: string, token?: string | null) =>
    freelance(`/gigs/${enc(gigId)}`, {
      method: "DELETE",
      token,
      requireAuth: true,
    }) as Promise<ApiResult<{ message?: string }>>,

  createProposal: (payload: CreateProposalPayload, token?: string | null) =>
    freelance("/proposals", {
      method: "POST",
      body: payload,
      token,
      requireAuth: true,
    }) as Promise<ApiResult<Data<Proposal>>>,

  getProposalsByGigId: (gigId: string, token?: string | null) =>
    freelance(`/proposals/gig/${enc(gigId)}`, { token, requireAuth: true }) as Promise<
      ApiResult<Paged<Proposal>>
    >,

  getProposalsByFreelancerId: (freelancerId: string, token?: string | null) =>
    freelance(`/proposals/freelancer/${enc(freelancerId)}`, {
      token,
      requireAuth: true,
    }) as Promise<ApiResult<Paged<Proposal>>>,

  getProposalById: (proposalId: string, token?: string | null) =>
    freelance(`/proposals/${enc(proposalId)}`, { token, requireAuth: true }) as Promise<
      ApiResult<Data<Proposal>>
    >,

  /** Gig owner: accept/reject. Freelancer: withdraw or edit while pending. */
  updateProposal: (proposalId: string, payload: UpdateProposalPayload, token?: string | null) =>
    freelance(`/proposals/${enc(proposalId)}`, {
      method: "PUT",
      body: payload,
      token,
      requireAuth: true,
    }) as Promise<ApiResult<Data<Proposal>>>,

  createReview: (payload: CreateReviewPayload, token?: string | null) =>
    freelance("/reviews", {
      method: "POST",
      body: payload,
      token,
      requireAuth: true,
    }) as Promise<ApiResult<Data<Review>>>,

  getReviewsByGigId: (gigId: string, token?: string | null) =>
    freelance(`/reviews/gig/${enc(gigId)}`, { token }) as Promise<ApiResult<Paged<Review>>>,

  getClientDashboard: (clientId: string, token?: string | null) =>
    freelance(`/dashboard/client/${enc(clientId)}`, { token, requireAuth: true }) as Promise<
      ApiResult<Data<ClientDashboard>>
    >,

  getFreelancerDashboard: (freelancerId: string, token?: string | null) =>
    freelance(`/dashboard/freelancer/${enc(freelancerId)}`, {
      token,
      requireAuth: true,
    }) as Promise<ApiResult<Data<FreelancerDashboard>>>,
};

const api = {
  user: userApi,
  event: eventApi,
  freelance: freelanceApi,
};

export default api;
