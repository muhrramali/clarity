import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ScoreBadge, scoreToRating } from "@/components/ScoreBadge";

describe("scoreToRating", () => {
  it.each([
    [100, "excellent"],
    [85, "excellent"],
    [84, "good"],
    [65, "good"],
    [64, "fair"],
    [40, "fair"],
    [39, "hard"],
    [0, "hard"],
  ])("maps score %d to %s", (score, expected) => {
    expect(scoreToRating(score)).toBe(expected);
  });

  it("clamps out-of-range scores to a valid rating", () => {
    expect(scoreToRating(-50)).toBe("hard");
    expect(scoreToRating(999)).toBe("excellent");
  });
});

describe("ScoreBadge", () => {
  it("renders the numeric score out of 100", () => {
    render(<ScoreBadge score={72} />);
    expect(screen.getByText("72")).toBeInTheDocument();
    expect(screen.getByText("/100")).toBeInTheDocument();
  });

  it("renders the rating label derived from the score", () => {
    render(<ScoreBadge score={90} />);
    expect(screen.getByText("Excellent")).toBeInTheDocument();
  });

  it("uses the explicit rating when provided", () => {
    render(<ScoreBadge score={50} rating="excellent" />);
    expect(screen.getByText("Excellent")).toBeInTheDocument();
  });

  it("exposes an accessible label via aria-label", () => {
    render(<ScoreBadge score={30} />);
    const status = screen.getByRole("status");
    expect(status.getAttribute("aria-label") ?? "").toMatch(/30 out of 100/i);
    expect(status.getAttribute("aria-label") ?? "").toMatch(/hard/i);
  });

  it("rounds fractional scores for display", () => {
    render(<ScoreBadge score={72.6} />);
    expect(screen.getByText("73")).toBeInTheDocument();
  });
});
