import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { getAuthToken, getUserFromStorage, setAuthToken, setUserInStorage } from "@/lib/auth-utils";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }));

function Probe() {
  const { user, isLoading, isAuthenticated } = useAuth();
  if (isLoading) return <p>loading</p>;
  return <p>{isAuthenticated ? `signed in as ${user?.name}` : "signed out"}</p>;
}

const storedUser = { id: "u1", name: "Cached Name", email: "a@b.c", type: "client" as const };
const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

describe("AuthProvider session validation", () => {
  it("is signed out without a stored token and does not call the API", async () => {
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );
    expect(await screen.findByText("signed out")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("refreshes the user from data.user on success", async () => {
    setAuthToken("tok");
    setUserInStorage(storedUser);
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ success: 1, user: { ...storedUser, name: "Fresh Name" } })),
    );
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );
    expect(await screen.findByText("signed in as Fresh Name")).toBeInTheDocument();
    expect(getUserFromStorage()?.name).toBe("Fresh Name");
  });

  it("clears the session on 401", async () => {
    setAuthToken("expired");
    setUserInStorage(storedUser);
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ success: 0, message: "UNAUTHORIZED" }), { status: 401 }),
    );
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );
    expect(await screen.findByText("signed out")).toBeInTheDocument();
    expect(getAuthToken()).toBeNull();
  });

  it("keeps the cached session on network errors", async () => {
    setAuthToken("tok");
    setUserInStorage(storedUser);
    fetchMock.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );
    await waitFor(() => expect(screen.getByText("signed in as Cached Name")).toBeInTheDocument());
    expect(getAuthToken()).toBe("tok");
  });
});
