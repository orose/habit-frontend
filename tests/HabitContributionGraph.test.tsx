import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { HabitContributionGraph } from "../src/components/HabitContributionGraph";

describe("HabitContributionGraph", () => {
  it("renders one cell per day across the shown weeks", () => {
    render(<HabitContributionGraph checkins={[]} createdAt="2020-01-01" weeksToShow={4} />);

    expect(screen.getAllByTestId("contribution-day")).toHaveLength(4 * 7);
  });

  it("shows a 'gjort' tooltip for a checked-in day", async () => {
    const user = userEvent.setup();
    const today = new Date(2026, 5, 10); // Wednesday 10 June 2026
    render(<HabitContributionGraph checkins={["2026-06-08"]} createdAt="2020-01-01" today={today} weeksToShow={1} />);

    const cells = screen.getAllByTestId("contribution-day");
    await user.hover(cells[0]);

    expect(await screen.findByRole("tooltip")).toHaveTextContent("Gjort 8. juni");
  });

  it("shows an 'ikke gjort' tooltip for a day without a checkin", async () => {
    const user = userEvent.setup();
    const today = new Date(2026, 5, 10);
    render(<HabitContributionGraph checkins={[]} createdAt="2020-01-01" today={today} weeksToShow={1} />);

    const cells = screen.getAllByTestId("contribution-day");
    await user.hover(cells[0]);

    expect(await screen.findByRole("tooltip")).toHaveTextContent("Ikke gjort 8. juni");
  });

  it("shows no tooltip for a day before the habit was created", async () => {
    const user = userEvent.setup();
    const today = new Date(2026, 5, 10);
    render(
      <HabitContributionGraph checkins={[]} createdAt="2026-06-09 00:00:00" today={today} weeksToShow={1} />,
    );

    const cells = screen.getAllByTestId("contribution-day");
    await user.hover(cells[0]);

    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });
});
