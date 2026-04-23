import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("framer-motion", () => {
  const React = require("react");
  return {
    motion: new Proxy({}, {
      get: (_target: unknown, prop: string) => {
        return React.forwardRef((props: Record<string, unknown>, ref: React.Ref<HTMLElement>) => {
          const {
            initial: _i, animate: _a, exit: _e, transition: _t,
            whileTap: _wt, whileHover: _wh, layout: _l, variants: _v,
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

const mockLogout = jest.fn();
jest.mock("@/lib/auth-context", () => ({
  useAuth: () => ({
    user: { id: 1, email: "test@triune.com", name: "Test User" },
    token: "fake-token", loading: false,
    login: jest.fn(), register: jest.fn(), logout: mockLogout,
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

import Header from "@/components/Header";
import QuickLogSummary from "@/components/QuickLogSummary";
import SymptomToggleGrid from "@/components/SymptomToggleGrid";
import StressSlider from "@/components/StressSlider";
import WellnessMetrics from "@/components/WellnessMetrics";
import EnergyMoodSliders from "@/components/EnergyMoodSliders";
import DietLog from "@/components/DietLog";

describe("Premium UI: Header", () => {
  it("has fixed positioning class", () => {
    const { container } = render(<Header />);
    const header = container.querySelector("header");
    expect(header).toHaveClass("fixed");
    expect(header).toHaveClass("top-0");
    expect(header).toHaveClass("z-50");
  });
  it("has glass blur class", () => {
    const { container } = render(<Header />);
    const header = container.querySelector("header");
    expect(header).toHaveClass("header-glass");
  });
  it("renders pulse indicator on logo", () => {
    const { container } = render(<Header />);
    const pulse = container.querySelector(".animate-pulse");
    expect(pulse).toBeInTheDocument();
  });
});

describe("Premium UI: QuickLogSummary", () => {
  const baseLog = { energy: 7, mood: 8, stress: 3, symptoms: [] as string[], meals: [], sleepHours: 7, hydrationMl: 1500, exerciseMinutes: 30, notes: "" };
  it("renders SVG score ring with glow filter", () => {
    const { container } = render(<QuickLogSummary log={baseLog} overallScore={8.5} />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    const filter = container.querySelector("filter#ringGlow");
    expect(filter).toBeInTheDocument();
  });
  it("renders the score ring gradient", () => {
    const { container } = render(<QuickLogSummary log={baseLog} overallScore={8.5} />);
    const gradient = container.querySelector("linearGradient#ringGradient");
    expect(gradient).toBeInTheDocument();
  });
  it("shows backdrop-blur on metric tiles", () => {
    const { container } = render(<QuickLogSummary log={baseLog} overallScore={7} />);
    const tiles = container.querySelectorAll(".backdrop-blur-sm");
    expect(tiles.length).toBeGreaterThanOrEqual(4);
  });
  it("renders correct score text", () => {
    render(<QuickLogSummary log={baseLog} overallScore={3.2} />);
    expect(screen.getByText("3.2")).toBeInTheDocument();
    expect(screen.getByText(/Take it easy/i)).toBeInTheDocument();
  });
});

describe("Premium UI: SymptomToggleGrid", () => {
  it("renders 9 symptom tiles in a 3-col grid", () => {
    const { container } = render(<SymptomToggleGrid selected={[]} onChange={jest.fn()} />);
    const grid = container.querySelector(".grid.grid-cols-3");
    expect(grid).toBeInTheDocument();
    const buttons = grid!.querySelectorAll("button");
    expect(buttons.length).toBe(9);
  });
  it("applies dashboard styling with symptom-tile class", () => {
    const { container } = render(<SymptomToggleGrid selected={[]} onChange={jest.fn()} />);
    const tiles = container.querySelectorAll(".symptom-tile");
    expect(tiles.length).toBe(9);
  });
  it("shows glow effect on active symptom", () => {
    const { container } = render(<SymptomToggleGrid selected={["fatigue"]} onChange={jest.fn()} />);
    const buttons = container.querySelectorAll("button.symptom-tile");
    const fatigueBtn = Array.from(buttons).find(b => b.textContent?.includes("Fatigue"));
    expect(fatigueBtn).toBeTruthy();
    expect(fatigueBtn!.style.boxShadow).toContain("0 0 24px");
  });
  it("shows active indicator dot for selected symptoms", () => {
    const { container } = render(<SymptomToggleGrid selected={["headache"]} onChange={jest.fn()} />);
    const dots = container.querySelectorAll(".w-1\\.5.h-1\\.5.rounded-full");
    expect(dots.length).toBeGreaterThanOrEqual(1);
  });
});

describe("Premium UI: StressSlider", () => {
  it("renders gradient track with glow overlay", () => {
    const { container } = render(<StressSlider value={5} onChange={jest.fn()} />);
    const slider = container.querySelector('input[type="range"]');
    expect(slider).toBeInTheDocument();
    expect(slider!.style.background).toContain("linear-gradient");
  });
  it("has glow-rose class on card", () => {
    const { container } = render(<StressSlider value={5} onChange={jest.fn()} />);
    const card = container.querySelector(".glow-rose");
    expect(card).toBeInTheDocument();
  });
  it("renders backdrop-blur label badge", () => {
    const { container } = render(<StressSlider value={7} onChange={jest.fn()} />);
    const badge = container.querySelector(".backdrop-blur-sm");
    expect(badge).toBeInTheDocument();
    expect(screen.getByText("High")).toBeInTheDocument();
  });
});

describe("Premium UI: WellnessMetrics", () => {
  it("renders gradient icon backgrounds with glow", () => {
    const { container } = render(
      <WellnessMetrics sleepHours={8} hydrationMl={2000} exerciseMinutes={45}
        onSleepChange={jest.fn()} onHydrationChange={jest.fn()} onExerciseChange={jest.fn()} />
    );
    const iconDivs = container.querySelectorAll(".rounded-xl.flex.items-center.justify-center");
    expect(iconDivs.length).toBeGreaterThanOrEqual(3);
  });
  it("renders 3 metric cards in grid", () => {
    const { container } = render(
      <WellnessMetrics sleepHours={8} hydrationMl={2000} exerciseMinutes={45}
        onSleepChange={jest.fn()} onHydrationChange={jest.fn()} onExerciseChange={jest.fn()} />
    );
    const grid = container.querySelector(".grid.grid-cols-3");
    expect(grid).toBeInTheDocument();
  });
  it("responds to slider changes", () => {
    const onSleep = jest.fn();
    render(
      <WellnessMetrics sleepHours={7} hydrationMl={1500} exerciseMinutes={30}
        onSleepChange={onSleep} onHydrationChange={jest.fn()} onExerciseChange={jest.fn()} />
    );
    const sliders = screen.getAllByRole("slider");
    fireEvent.change(sliders[0], { target: { value: "9" } });
    expect(onSleep).toHaveBeenCalledWith(9);
  });
});

describe("Premium UI: EnergyMoodSliders", () => {
  it("renders animated emoji feedback", () => {
    render(<EnergyMoodSliders energy={9} mood={2} onEnergyChange={jest.fn()} onMoodChange={jest.fn()} />);
    expect(screen.getByText("🔥")).toBeInTheDocument();
    expect(screen.getByText("😢")).toBeInTheDocument();
  });
  it("has glow classes on cards", () => {
    const { container } = render(<EnergyMoodSliders energy={5} mood={5} onEnergyChange={jest.fn()} onMoodChange={jest.fn()} />);
    expect(container.querySelector(".glow-amber")).toBeInTheDocument();
    expect(container.querySelector(".glow-indigo")).toBeInTheDocument();
  });
});

describe("Premium UI: DietLog", () => {
  it("has glass card with glow-green", () => {
    const { container } = render(<DietLog meals={[]} onMealsChange={jest.fn()} />);
    const card = container.querySelector(".glass-card.glow-green");
    expect(card).toBeInTheDocument();
  });
  it("handles full add meal workflow", async () => {
    const onMealsChange = jest.fn();
    render(<DietLog meals={[]} onMealsChange={onMealsChange} />);
    await userEvent.click(screen.getByText("Add Meal"));
    const input = screen.getByPlaceholderText("What did you eat?");
    await userEvent.type(input, "Grilled salmon");
    await userEvent.click(screen.getByText("Add"));
    expect(onMealsChange).toHaveBeenCalledWith([
      { type: "Breakfast", description: "Grilled salmon", healthScore: 3 },
    ]);
  });
});
