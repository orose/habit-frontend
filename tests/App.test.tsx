import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "../src/App";

function mockAllowRegistration(allowRegistration: boolean) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ allowRegistration }),
    }),
  );
}

describe("App", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders the landing page heading", () => {
    mockAllowRegistration(false);
    render(<App />);
    expect(screen.getByRole("heading", { name: "Habit" })).toBeInTheDocument();
  });

  it("hides the registration entry point when registration is closed", async () => {
    mockAllowRegistration(false);
    render(<App />);

    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(screen.queryByRole("button", { name: "Registrer bruker" })).not.toBeInTheDocument();
  });

  it("shows the registration entry point when registration is open", async () => {
    mockAllowRegistration(true);
    render(<App />);

    expect(await screen.findByRole("button", { name: "Registrer bruker" })).toBeInTheDocument();
  });

  it("keeps the registration entry point hidden if the flag fails to load", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network error")));
    render(<App />);

    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(screen.queryByRole("button", { name: "Registrer bruker" })).not.toBeInTheDocument();
  });
});
