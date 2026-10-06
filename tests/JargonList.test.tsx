import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { JargonList } from "@/components/JargonList";

describe("JargonList", () => {
  it("shows the empty-state message when there are no items", () => {
    render(<JargonList items={[]} />);
    expect(screen.getByTestId("jargon-empty")).toBeInTheDocument();
    expect(
      screen.getByText(/No jargon detected/i),
    ).toBeInTheDocument();
  });

  it("supports a custom empty-state message", () => {
    render(<JargonList items={[]} emptyMessage="All clear!" />);
    expect(screen.getByText("All clear!")).toBeInTheDocument();
  });

  it("renders one row per jargon item with term and simpler alternative", () => {
    render(
      <JargonList
        items={[
          { term: "utilize", simpler: "use" },
          { term: "in order to", simpler: "to" },
        ]}
      />,
    );

    expect(screen.getByTestId("jargon-list")).toBeInTheDocument();
    const rows = screen.getAllByTestId("jargon-item");
    expect(rows).toHaveLength(2);

    expect(screen.getByText("utilize")).toBeInTheDocument();
    expect(screen.getByText("use")).toBeInTheDocument();
    expect(screen.getByText("in order to")).toBeInTheDocument();
    expect(screen.getByText("to")).toBeInTheDocument();
  });

  it("renders the reason when provided", () => {
    render(
      <JargonList
        items={[
          {
            term: "leverage",
            simpler: "use",
            reason: "Shorter everyday word.",
          },
        ]}
      />,
    );
    expect(screen.getByTestId("jargon-reason")).toHaveTextContent(
      "Shorter everyday word.",
    );
  });

  it("does not render the reason region when reason is empty", () => {
    render(
      <JargonList
        items={[{ term: "leverage", simpler: "use", reason: "" }]}
      />,
    );
    expect(screen.queryByTestId("jargon-reason")).toBeNull();
  });

  it("labels the list accessibly", () => {
    render(
      <JargonList
        items={[{ term: "utilize", simpler: "use" }]}
      />,
    );
    expect(
      screen.getByRole("list", {
        name: /Jargon replaced with simpler alternatives/i,
      }),
    ).toBeInTheDocument();
  });
});
