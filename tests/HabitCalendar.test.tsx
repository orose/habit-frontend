import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { HabitCalendar } from "../src/components/HabitCalendar";

describe("HabitCalendar", () => {
  it("shows the month of the given reference date", () => {
    const today = new Date(2026, 5, 10); // June 2026
    render(<HabitCalendar checkins={[]} createdAt="2020-01-01" today={today} />);

    expect(screen.getByText(/juni 2026/i)).toBeInTheDocument();
  });

  it("shows a 'Gjort' tooltip for a checked-in day", async () => {
    const user = userEvent.setup();
    const today = new Date(2026, 5, 10);
    render(<HabitCalendar checkins={["2026-06-08"]} createdAt="2020-01-01" today={today} />);

    await user.hover(screen.getByRole("gridcell", { name: "8" }));

    expect(await screen.findByRole("tooltip")).toHaveTextContent("Gjort");
  });

  it("shows an 'Ikke gjort' tooltip for a day without a checkin", async () => {
    const user = userEvent.setup();
    const today = new Date(2026, 5, 10);
    render(<HabitCalendar checkins={[]} createdAt="2020-01-01" today={today} />);

    await user.hover(screen.getByRole("gridcell", { name: "8" }));

    expect(await screen.findByRole("tooltip")).toHaveTextContent("Ikke gjort");
  });

  it("disables days after today", () => {
    const today = new Date(2026, 5, 10);
    render(<HabitCalendar checkins={[]} createdAt="2020-01-01" today={today} />);

    expect(screen.getByRole("gridcell", { name: "11" })).toBeDisabled();
  });

  it("does not allow navigating to a month after today's", () => {
    const today = new Date(2026, 5, 10);
    render(<HabitCalendar checkins={[]} createdAt="2020-01-01" today={today} />);

    expect(screen.getByLabelText("Neste måned")).toBeDisabled();
  });

  it("does not allow navigating before the month the habit was created in", () => {
    const today = new Date(2026, 5, 10);
    render(<HabitCalendar checkins={[]} createdAt="2026-06-01" today={today} />);

    expect(screen.getByLabelText("Forrige måned")).toBeDisabled();
  });

  it("navigates back a month when 'Forrige måned' is clicked", async () => {
    const user = userEvent.setup();
    const today = new Date(2026, 5, 10);
    render(<HabitCalendar checkins={[]} createdAt="2020-01-01" today={today} />);

    await user.click(screen.getByLabelText("Forrige måned"));

    expect(await screen.findByText(/mai 2026/i)).toBeInTheDocument();
  });
});
