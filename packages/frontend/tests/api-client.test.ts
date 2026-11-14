import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  AUTH_REQUIRED_MESSAGE,
  NETWORK_ERROR_MESSAGE,
  apiRequest,
  buildQueryString,
  eventApi,
  formatValidationErrors,
  freelanceApi,
  userApi,
} from "@/lib/api-client";
import { setAuthToken } from "@/lib/auth-utils";
import { config } from "@/lib/config";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

function lastCall() {
  const [url, init] = fetchMock.mock.calls.at(-1)!;
  return { url: String(url), init: init as RequestInit };
}

describe("buildQueryString", () => {
  it("skips empty values and joins arrays", () => {
    expect(buildQueryString()).toBe("");
    expect(buildQueryString({ a: undefined, b: null, c: "", d: [] })).toBe("");
    expect(buildQueryString({ query: "react dev", skills: ["a", "b"], page: 2, ok: true })).toBe(
      "?query=react+dev&skills=a%2Cb&page=2&ok=true",
    );
  });
});

describe("formatValidationErrors", () => {
  it("formats issues with paths", () => {
    expect(
      formatValidationErrors([
        { path: "title", message: "Too short" },
        { path: ["budget", 0], message: "Must be positive" },
        { message: "General problem" },
      ]),
    ).toBe("title: Too short; budget.0: Must be positive; General problem");
  });

  it("returns null for anything else", () => {
    expect(formatValidationErrors(undefined)).toBeNull();
    expect(formatValidationErrors([{ nope: true }])).toBeNull();
  });
});

describe("apiRequest", () => {
  it("spreads the success body and drops the success flag", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ success: true, data: [1, 2] }));
    const result = await apiRequest<{ data: number[] }>("http://svc", "/items");
    expect(result).toEqual({ success: true, status: 200, data: [1, 2] });
  });

  it("treats success: 0 / false bodies as failures even with 200", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ success: 0, message: "Nope" }));
    const result = await apiRequest("http://svc", "/x");
    expect(result).toEqual({ success: false, status: 400, message: "Nope" });
  });

  it("returns status and message for HTTP errors", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ success: false, message: "Not found" }, 404));
    const result = await apiRequest("http://svc", "/x");
    expect(result).toMatchObject({ success: false, status: 404, message: "Not found" });
  });

  it("turns validation errors into a readable message", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        {
          success: false,
          message: "VALIDATION_ERROR",
          errors: [{ path: "title", message: "Title must be at least 5 characters" }],
        },
        400,
      ),
    );
    const result = await apiRequest("http://svc", "/gigs", { method: "POST", body: {} });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.message).toBe("title: Title must be at least 5 characters");
      expect(result.errors).toHaveLength(1);
    }
  });

  it("handles non-JSON error bodies", async () => {
    fetchMock.mockResolvedValueOnce(new Response("Bad gateway", { status: 502 }));
    const result = await apiRequest("http://svc", "/x");
    expect(result).toEqual({ success: false, status: 502, message: "Bad gateway" });
  });

  it("reports network failures with status 0", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    const result = await apiRequest("http://svc", "/x");
    expect(result).toEqual({ success: false, status: 0, message: NETWORK_ERROR_MESSAGE });
  });

  it("does not call the server for auth-required requests without a token", async () => {
    const result = await apiRequest("http://svc", "/x", { method: "POST", requireAuth: true });
    expect(result).toEqual({ success: false, status: 401, message: AUTH_REQUIRED_MESSAGE });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sends JSON body and the stored bearer token", async () => {
    setAuthToken("tok");
    fetchMock.mockResolvedValueOnce(jsonResponse({ success: true }, 201));
    await apiRequest("http://svc", "/things", { method: "POST", body: { a: 1 } });
    const { url, init } = lastCall();
    expect(url).toBe("http://svc/things");
    expect(init.method).toBe("POST");
    expect(init.body).toBe(JSON.stringify({ a: 1 }));
    expect(init.headers).toMatchObject({ Authorization: "Bearer tok" });
  });
});

describe("service clients", () => {
  it("login posts credentials to the user service without a token", async () => {
    setAuthToken("stale");
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        success: 1,
        token: "t",
        user: { id: "1", name: "A", email: "a@b.c", type: "client" },
      }),
    );
    const result = await userApi.login({ email: "a@b.c", password: "secret" });
    const { url, init } = lastCall();
    expect(url).toBe(`${config.userServiceUrl}/user/login`);
    expect(init.headers).not.toHaveProperty("Authorization");
    expect(result.success && result.token).toBe("t");
  });

  it("getUserProfile returns data.user and surfaces 401", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ success: 1, user: { id: "1" } }));
    const ok = await userApi.getUserProfile("tok");
    expect(ok.success && ok.user.id).toBe("1");
    expect(lastCall().init.headers).toMatchObject({ Authorization: "Bearer tok" });

    fetchMock.mockResolvedValueOnce(jsonResponse({ success: 0, message: "UNAUTHORIZED" }, 401));
    const denied = await userApi.getUserProfile("bad");
    expect(denied).toMatchObject({ success: false, status: 401 });
  });

  it("event list exposes events and pagination", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        success: true,
        events: [{ id: "e1" }],
        pagination: { total: 1, page: 1, limit: 10 },
      }),
    );
    const result = await eventApi.getAllEvents({ isPublished: true, limit: 10 });
    expect(lastCall().url).toBe(`${config.eventServiceUrl}/events?isPublished=true&limit=10`);
    expect(result.success && result.events[0].id).toBe("e1");
    expect(result.success && result.pagination?.total).toBe(1);
  });

  it("event registration requires and sends the token", async () => {
    const unauthenticated = await eventApi.registerForEvent("e1");
    expect(unauthenticated).toMatchObject({ success: false, status: 401 });
    expect(fetchMock).not.toHaveBeenCalled();

    setAuthToken("tok");
    fetchMock.mockResolvedValueOnce(jsonResponse({ success: true, message: "REGISTERED" }));
    const result = await eventApi.registerForEvent("e1", { userName: "Ada" });
    const { url, init } = lastCall();
    expect(url).toBe(`${config.eventServiceUrl}/events/e1/register`);
    expect(init.headers).toMatchObject({ Authorization: "Bearer tok" });
    expect(JSON.parse(String(init.body))).toEqual({ userName: "Ada" });
    expect(result.success).toBe(true);
  });

  it("gig search encodes query and skills", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ success: true, data: [] }));
    await freelanceApi.searchProjects({ query: "next js", skills: ["React", "Node"] });
    expect(lastCall().url).toBe(
      `${config.freelanceServiceUrl}/gigs/search?query=next+js&skills=React%2CNode`,
    );
  });

  it("encodes path parameters", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ success: true, data: {} }));
    await freelanceApi.getGigById("a/b");
    expect(lastCall().url).toBe(`${config.freelanceServiceUrl}/gigs/a%2Fb`);
  });
});
