import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "../src/App";

function mockBackend() {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === "string" ? input : input.toString();

      if (url === "/v1/settings/allow-registration") {
        return { ok: true, json: async () => ({ allowRegistration: false }) };
      }
      if (url === "/v1/auth/login") {
        const body = JSON.parse(init?.body as string) as { username: string; password: string };
        if (body.username === "kari" && body.password === "hunter22") {
          return { ok: true, json: async () => ({ token: "the-jwt" }) };
        }
        return { ok: false, status: 401, json: async () => ({}) };
      }
      if (url === "/v1/habits") {
        return { ok: true, json: async () => [] };
      }
      if (url === "/v1/stats") {
        return { ok: true, json: async () => [] };
      }
      throw new Error(`Unexpected fetch: ${url}`);
    }),
  );
}

describe("Login flow", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("logs in, shows the dashboard, then logs out", async () => {
    mockBackend();
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText(/Brukernavn/), "kari");
    await user.type(screen.getByLabelText(/Passord/), "hunter22");
    await user.click(screen.getByRole("button", { name: "Logg inn" }));

    expect(await screen.findByText("Vanene dine")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Logg ut" }));

    expect(await screen.findByRole("button", { name: "Logg inn" })).toBeInTheDocument();
  });

  it("shows an error and stays on the login screen with wrong credentials", async () => {
    mockBackend();
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText(/Brukernavn/), "kari");
    await user.type(screen.getByLabelText(/Passord/), "feilPassord");
    await user.click(screen.getByRole("button", { name: "Logg inn" }));

    expect(await screen.findByText("Feil brukernavn eller passord.")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole("button", { name: "Logg inn" })).toBeInTheDocument());
  });
});
