import "@testing-library/jest-dom";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock framer-motion
jest.mock("framer-motion", () => {
  const React = require("react");
  return {
    motion: new Proxy({}, {
      get: (_target: unknown, prop: string) => {
        return React.forwardRef((props: Record<string, unknown>, ref: React.Ref<HTMLElement>) => {
          const {
            initial: _i,
            animate: _a,
            exit: _e,
            transition: _t,
            whileTap: _wt,
            whileHover: _wh,
            layout: _l,
            layoutId: _lid,
            variants: _v,
            ...rest
          } = props;
          return React.createElement(prop, { ...rest, ref });
        });
      },
    }),
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
    useAnimation: () => ({ start: jest.fn() }),
    useInView: () => true,
  };
});

jest.mock("@/lib/auth-context", () => ({
  useAuth: () => ({
    user: { id: 1, email: "test@triune.com", name: "Test User" },
    token: "fake-token",
    loading: false,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

const mockReport = {
  date: "2026-04-23",
  summary: "Report for 2026-04-23: Your energy was 7/10 and your mood was good.",
  triggered_insights: [
    { message: "Low hydration may be causing fatigue.", category: "hydration", severity: "warning" },
    { message: "High stress levels detected today.", category: "stress", severity: "critical" },
  ],
  personalized_tips: [
    "Try a 5-minute meditation before bed to lower your stress.",
    "Drink a large glass of water now to rehydrate.",
    "Aim for 7-9 hours of sleep to help your body recover and reset.",
  ],
  overall_score: 7.5,
};

jest.mock("@/lib/api", () => ({
  api: {
    getLogs: jest.fn().mockResolvedValue({ logs: [], total: 0 }),
    insights: jest.fn().mockResolvedValue({
      summary: {
        totalLogs: 10,
        avgEnergy: 6.5,
        avgMood: 7.2,
        avgStress: 4.1,
        topSymptoms: ["fatigue"],
        general_tips: [
          "Aim for 7-9 hours of sleep to help your body recover and reset.",
          "Drinking a glass of water first thing in the morning can boost your energy.",
          "Even 10 minutes of light stretching can significantly reduce daily stress.",
        ],
      },
      insights: [
        { type: "positive", category: "mood", message: "Your mood is great!" },
      ],
    }),
    saveLogs: jest.fn().mockResolvedValue({
      id: 1,
      date: "2026-04-23",
      message: "Log saved successfully",
      report: {
        date: "2026-04-23",
        summary: "Report for 2026-04-23: Your energy was 7/10 and your mood was good.",
        triggered_insights: [
          { message: "Low hydration may be causing fatigue.", category: "hydration", severity: "warning" },
          { message: "High stress levels detected today.", category: "stress", severity: "critical" },
        ],
        personalized_tips: [
          "Try a 5-minute meditation before bed to lower your stress.",
          "Drink a large glass of water now to rehydrate.",
          "Aim for 7-9 hours of sleep to help your body recover and reset.",
        ],
        overall_score: 7.5,
      },
    }),
  },
}));

import DailyReportModal from "@/components/DailyReportModal";
import InsightsPanel from "@/components/InsightsPanel";
import Page from "@/app/page";

// ==================== DailyReportModal Tests ====================

describe("DailyReportModal", () => {
  it("renders the modal with data-testid", () => {
    render(<DailyReportModal report={mockReport} onClose={jest.fn()} />);
    expect(screen.getByTestId("daily-report-modal")).toBeInTheDocument();
  });

  it("displays the Daily Report title", () => {
    render(<DailyReportModal report={mockReport} onClose={jest.fn()} />);
    expect(screen.getByText("Daily Report")).toBeInTheDocument();
  });

  it("displays the report date", () => {
    render(<DailyReportModal report={mockReport} onClose={jest.fn()} />);
    expect(screen.getByText("2026-04-23")).toBeInTheDocument();
  });

  it("renders the summary section", () => {
    render(<DailyReportModal report={mockReport} onClose={jest.fn()} />);
    expect(screen.getByTestId("report-summary")).toBeInTheDocument();
    expect(screen.getByText(/Your energy was 7\/10/)).toBeInTheDocument();
  });

  it("renders triggered insights", () => {
    render(<DailyReportModal report={mockReport} onClose={jest.fn()} />);
    expect(screen.getByTestId("report-insights")).toBeInTheDocument();
    expect(screen.getByText("Low hydration may be causing fatigue.")).toBeInTheDocument();
    expect(screen.getByText("High stress levels detected today.")).toBeInTheDocument();
  });

  it("renders insight categories", () => {
    render(<DailyReportModal report={mockReport} onClose={jest.fn()} />);
    expect(screen.getByText("hydration")).toBeInTheDocument();
    expect(screen.getByText("stress")).toBeInTheDocument();
  });

  it("renders personalized tips", () => {
    render(<DailyReportModal report={mockReport} onClose={jest.fn()} />);
    expect(screen.getByTestId("report-tips")).toBeInTheDocument();
    expect(screen.getByText("Try a 5-minute meditation before bed to lower your stress.")).toBeInTheDocument();
    expect(screen.getByText("Drink a large glass of water now to rehydrate.")).toBeInTheDocument();
  });

  it("renders the correct number of tips", () => {
    render(<DailyReportModal report={mockReport} onClose={jest.fn()} />);
    expect(screen.getByTestId("report-tip-0")).toBeInTheDocument();
    expect(screen.getByTestId("report-tip-1")).toBeInTheDocument();
    expect(screen.getByTestId("report-tip-2")).toBeInTheDocument();
  });

  it("renders dismiss button", () => {
    render(<DailyReportModal report={mockReport} onClose={jest.fn()} />);
    expect(screen.getByTestId("report-dismiss")).toBeInTheDocument();
    expect(screen.getByText("Got It")).toBeInTheDocument();
  });

  it("calls onClose when dismiss button clicked", async () => {
    const onClose = jest.fn();
    render(<DailyReportModal report={mockReport} onClose={onClose} />);
    await userEvent.click(screen.getByTestId("report-dismiss"));
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose when close X button clicked", async () => {
    const onClose = jest.fn();
    render(<DailyReportModal report={mockReport} onClose={onClose} />);
    await userEvent.click(screen.getByLabelText("Close report"));
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose when backdrop clicked", async () => {
    const onClose = jest.fn();
    const { container } = render(<DailyReportModal report={mockReport} onClose={onClose} />);
    const backdrop = container.querySelector("[data-testid='daily-report-modal'] > div:first-child");
    if (backdrop) {
      await userEvent.click(backdrop);
      expect(onClose).toHaveBeenCalled();
    }
  });

  it("renders modal without triggered insights when empty", () => {
    const reportNoInsights = { ...mockReport, triggered_insights: [] };
    render(<DailyReportModal report={reportNoInsights} onClose={jest.fn()} />);
    expect(screen.queryByTestId("report-insights")).not.toBeInTheDocument();
  });

  it("renders modal without tips when empty", () => {
    const reportNoTips = { ...mockReport, personalized_tips: [] };
    render(<DailyReportModal report={reportNoTips} onClose={jest.fn()} />);
    expect(screen.queryByTestId("report-tips")).not.toBeInTheDocument();
  });

  it("has glassmorphism styling on the modal", () => {
    const { container } = render(<DailyReportModal report={mockReport} onClose={jest.fn()} />);
    const cards = container.querySelectorAll(".glass-card");
    expect(cards.length).toBeGreaterThanOrEqual(1);
  });
});

// ==================== InsightsPanel Health Tips Tests ====================

describe("InsightsPanel: Health Tips", () => {
  it("renders health tips section", async () => {
    render(<InsightsPanel />);
    await waitFor(() => {
      expect(screen.getByTestId("health-tips-section")).toBeInTheDocument();
    });
  });

  it("shows Health Tips heading with Sparkles icon", async () => {
    render(<InsightsPanel />);
    await waitFor(() => {
      expect(screen.getByText("Health Tips")).toBeInTheDocument();
    });
  });

  it("renders all general tips from API response", async () => {
    render(<InsightsPanel />);
    await waitFor(() => {
      expect(screen.getByTestId("health-tip-0")).toBeInTheDocument();
      expect(screen.getByTestId("health-tip-1")).toBeInTheDocument();
      expect(screen.getByTestId("health-tip-2")).toBeInTheDocument();
    });
  });

  it("displays the actual tip text", async () => {
    render(<InsightsPanel />);
    await waitFor(() => {
      expect(screen.getByText("Aim for 7-9 hours of sleep to help your body recover and reset.")).toBeInTheDocument();
      expect(screen.getByText("Drinking a glass of water first thing in the morning can boost your energy.")).toBeInTheDocument();
    });
  });

  it("does not show health tips when general_tips is empty", async () => {
    const { api } = require("@/lib/api");
    api.insights.mockResolvedValueOnce({
      summary: {
        totalLogs: 5,
        avgEnergy: 6.0,
        avgMood: 6.0,
        avgStress: 5.0,
        topSymptoms: [],
        general_tips: [],
      },
      insights: [],
    });
    render(<InsightsPanel />);
    await waitFor(() => {
      expect(screen.queryByTestId("health-tips-section")).not.toBeInTheDocument();
    });
  });

  it("does not show health tips when general_tips is undefined", async () => {
    const { api } = require("@/lib/api");
    api.insights.mockResolvedValueOnce({
      summary: {
        totalLogs: 5,
        avgEnergy: 6.0,
        avgMood: 6.0,
        avgStress: 5.0,
        topSymptoms: [],
      },
      insights: [],
    });
    render(<InsightsPanel />);
    await waitFor(() => {
      expect(screen.queryByTestId("health-tips-section")).not.toBeInTheDocument();
    });
  });

  it("tips have glassmorphism card styling", async () => {
    const { container } = render(<InsightsPanel />);
    await waitFor(() => {
      expect(screen.getByTestId("health-tips-section")).toBeInTheDocument();
    });
    const tipCards = container.querySelectorAll("[data-testid^='health-tip-']");
    tipCards.forEach(card => {
      expect(card).toHaveClass("glass-card");
    });
  });
});

// ==================== Page Integration: Report Modal on Save ====================

describe("Page: Daily Report Modal after Save", () => {
  it("shows report modal after successful save", async () => {
    render(<Page />);
    const saveBtn = screen.getByText("Save Daily Log");
    await act(async () => {
      await userEvent.click(saveBtn);
    });
    await waitFor(() => {
      expect(screen.getByTestId("daily-report-modal")).toBeInTheDocument();
    });
  });

  it("shows report summary in modal after save", async () => {
    render(<Page />);
    await act(async () => {
      await userEvent.click(screen.getByText("Save Daily Log"));
    });
    await waitFor(() => {
      expect(screen.getByText(/Your energy was 7\/10/)).toBeInTheDocument();
    });
  });

  it("closes modal when Got It is clicked", async () => {
    render(<Page />);
    await act(async () => {
      await userEvent.click(screen.getByText("Save Daily Log"));
    });
    await waitFor(() => {
      expect(screen.getByTestId("daily-report-modal")).toBeInTheDocument();
    });
    await act(async () => {
      await userEvent.click(screen.getByTestId("report-dismiss"));
    });
    await waitFor(() => {
      expect(screen.queryByTestId("daily-report-modal")).not.toBeInTheDocument();
    });
  });

  it("does not show modal when save response has no report", async () => {
    const { api } = require("@/lib/api");
    api.saveLogs.mockResolvedValueOnce({
      id: 1,
      date: "2026-04-23",
      message: "saved",
    });
    render(<Page />);
    await act(async () => {
      await userEvent.click(screen.getByText("Save Daily Log"));
    });
    await waitFor(() => {
      expect(screen.getByText("Log Saved!")).toBeInTheDocument();
    });
    expect(screen.queryByTestId("daily-report-modal")).not.toBeInTheDocument();
  });
});
