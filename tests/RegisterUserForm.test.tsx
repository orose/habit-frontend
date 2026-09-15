import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import RegisterUserForm from "../src/RegisterUserForm";

function mockFetchResponse(status: number, body: unknown) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: status >= 200 && status < 300,
      status,
      json: async () => body,
    }),
  );
}

async function fillAndSubmit(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/Brukernavn/), "kari");
  await user.type(screen.getByLabelText(/Passord/), "hunter22");
  await user.click(screen.getByRole("button", { name: "Registrer bruker" }));
}

describe("RegisterUserForm", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("submits the form and shows a success message", async () => {
    mockFetchResponse(201, { id: 1, username: "kari" });
    const user = userEvent.setup();
    render(<RegisterUserForm />);

    await fillAndSubmit(user);

    expect(await screen.findByText(/Bruker registrert/)).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith(
      "/v1/users",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ username: "kari", password: "hunter22" }),
      }),
    );
  });

  it("shows an error message when the username is already taken", async () => {
    mockFetchResponse(409, { detail: "Brukernavnet er allerede i bruk: kari" });
    const user = userEvent.setup();
    render(<RegisterUserForm />);

    await fillAndSubmit(user);

    expect(await screen.findByText(/allerede i bruk/)).toBeInTheDocument();
  });

  it("shows an error message when registration is closed", async () => {
    mockFetchResponse(403, { detail: "Bruker-registrering er ikke åpen for øyeblikket" });
    const user = userEvent.setup();
    render(<RegisterUserForm />);

    await fillAndSubmit(user);

    expect(await screen.findByText(/ikke åpen/)).toBeInTheDocument();
  });

  it("requires all fields before the browser allows submission", () => {
    render(<RegisterUserForm />);

    expect(screen.getByLabelText(/Brukernavn/)).toBeRequired();
    expect(screen.getByLabelText(/Passord/)).toBeRequired();
  });
});
