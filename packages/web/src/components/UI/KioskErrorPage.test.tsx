import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

// Mock i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe("KioskErrorPage", () => {
  it("renders error message with device URL", async () => {
    const { KioskErrorPage } = await import("./KioskErrorPage.tsx");

    render(
      <KioskErrorPage
        url="http://192.168.1.100"
        onRetry={vi.fn()}
        retrying={false}
      />,
    );

    expect(screen.getByText(/kioskError.title/i)).toBeInTheDocument();
    expect(screen.getByText(/192\.168\.1\.100/)).toBeInTheDocument();
  });

  it("calls onRetry when retry button clicked", async () => {
    const { KioskErrorPage } = await import("./KioskErrorPage.tsx");
    const onRetry = vi.fn();
    const user = userEvent.setup();

    render(
      <KioskErrorPage
        url="http://192.168.1.100"
        onRetry={onRetry}
        retrying={false}
      />,
    );

    const retryButton = screen.getByRole("button", {
      name: /kioskError.retryButton/i,
    });
    await user.click(retryButton);

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("disables retry button when retrying", async () => {
    const { KioskErrorPage } = await import("./KioskErrorPage.tsx");

    render(
      <KioskErrorPage
        url="http://192.168.1.100"
        onRetry={vi.fn()}
        retrying={true}
      />,
    );

    const retryButton = screen.getByRole("button");
    expect(retryButton).toBeDisabled();
    expect(screen.getByText(/kioskError.retrying/i)).toBeInTheDocument();
  });
});
