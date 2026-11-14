import { describe, expect, it } from "vitest";
import {
  AUTH_TOKEN_KEY,
  AUTH_USER_KEY,
  clearAuthData,
  getAuthHeaders,
  getAuthToken,
  getUserFromStorage,
  isAuthenticated,
  setAuthToken,
  setUserInStorage,
} from "@/lib/auth-utils";
import type { AuthUser } from "@/lib/types";

const user: AuthUser = { id: "u1", name: "Ada Lovelace", email: "ada@example.com", type: "client" };

describe("auth-utils", () => {
  it("stores, reads and clears the token", () => {
    expect(getAuthToken()).toBeNull();
    expect(isAuthenticated()).toBe(false);

    setAuthToken("abc");
    expect(window.localStorage.getItem(AUTH_TOKEN_KEY)).toBe("abc");
    expect(getAuthToken()).toBe("abc");
    expect(isAuthenticated()).toBe(true);

    clearAuthData();
    expect(getAuthToken()).toBeNull();
  });

  it("round-trips the user object", () => {
    setUserInStorage(user);
    expect(getUserFromStorage()).toEqual(user);
    clearAuthData();
    expect(getUserFromStorage()).toBeNull();
  });

  it("ignores malformed or incomplete stored users", () => {
    window.localStorage.setItem(AUTH_USER_KEY, "{not json");
    expect(getUserFromStorage()).toBeNull();

    window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify({ name: "No id" }));
    expect(getUserFromStorage()).toBeNull();
  });

  it("builds JSON headers with a bearer token when available", () => {
    expect(getAuthHeaders()).toEqual({ "Content-Type": "application/json" });

    setAuthToken("stored");
    expect(getAuthHeaders()).toEqual({
      "Content-Type": "application/json",
      Authorization: "Bearer stored",
    });
    expect(getAuthHeaders({ "X-Extra": "1" }, "explicit")).toEqual({
      "Content-Type": "application/json",
      "X-Extra": "1",
      Authorization: "Bearer explicit",
    });
    expect(getAuthHeaders({}, null)).toEqual({ "Content-Type": "application/json" });
  });
});
