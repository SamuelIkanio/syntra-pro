import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock framer-motion to avoid animation issues in tests
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

const mockLogout = jest.fn();
jest.mock("@/lib/auth-context", () => ({
  useAuth: () => ({
    user: { id: 1, email: "test@triune.com", name: "Test User" },
    token: "fake-token",
    loading: false,
    login: jest.fn(),
    register: jest.fn(),
    logout: mockLogout,
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

import Header from "@/components/Header";
import QuickLogSummary from "@/components/QuickLogSummary";
import EnergyMoodSliders from "@/components/EnergyMoodSliders";
import SymptomToggleGrid from "@/components/SymptomToggleGrid";
import StressSlider from "@/components/StressSlider";
import WellnessMetrics from "@/components/WellnessMetrics";
import DietLog from "@/components/DietLog";

describe("Header", () => {
  it("renders SYNTRA Pro branding", () => {
    render(<Header />);
    expect(screen.getByText("SYNTRA")).toBeInTheDocument();
    expect(screen.getByText("Pro")).toBeInTheDocument();
  });

  it("shows user first name", () => {
    render(<Header />);
    expect(screen.getByText("Test")).toBeInTheDocument();
  });

  it("calls logout on click", async () => {
    render(<Header />);
    const logoutBtn = screen.getByTitle("Logout");
    await userEvent.click(logoutBtn);
    expect(mockLogout).toHaveBeenCalled();
  });
});

describe("QuickLogSummary", () => {
  const baseLog = {
    energy: 7, mood: 8, stress: 3,
    symptoms: [] as string[], meals: [],
    sleepHours: 7, hydrationMl: 1500, exerciseMinutes: 30, notes: "",
  };

  it("renders overall score", () => {
    render(<QuickLogSummary log={baseLog} overallScore={7.5} />);
    expect(screen.getByText("7.5")).toBeInTheDocument();
    expect(screen.getByText("/ 10")).toBeInTheDocument();
  });

  it("shows positive message for high score", () => {
    render(<QuickLogSummary log={baseLog} overallScore={8} />);
    expect(screen.getByText(/Looking great/i)).toBeInTheDocument();
  });

  it("shows metric tiles", () => {
    render(<QuickLogSummary log={baseLog} overallScore={7} />);
    expect(screen.getByText("Energy")).toBeInTheDocument();
    expect(screen.getByText("Mood")).toBeInTheDocument();
    expect(screen.getByText("Symptoms")).toBeInTheDocument();
    expect(screen.getByText("Meals")).toBeInTheDocument();
  });
});

describe("EnergyMoodSliders", () => {
  it("renders energy and mood sliders", () => {
    const fn = jest.fn();
    render(<EnergyMoodSliders energy={5} mood={7} onEnergyChange={fn} onMoodChange={fn} />);
    expect(screen.getByText("Energy Level")).toBeInTheDocument();
    expect(screen.getByText("Mood")).toBeInTheDocument();
  });

  it("shows current values", () => {
    render(<EnergyMoodSliders energy={8} mood={3} onEnergyChange={jest.fn()} onMoodChange={jest.fn()} />);
    expect(screen.getByText("8")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("calls onChange when slider changes", () => {
    const onEnergy = jest.fn();
    render(<EnergyMoodSliders energy={5} mood={5} onEnergyChange={onEnergy} onMoodChange={jest.fn()} />);
    const sliders = screen.getAllByRole("slider");
    fireEvent.change(sliders[0], { target: { value: "8" } });
    expect(onEnergy).toHaveBeenCalledWith(8);
  });
});

describe("SymptomToggleGrid", () => {
  it("renders all 9 symptoms", () => {
    render(<SymptomToggleGrid selected={[]} onChange={jest.fn()} />);
    expect(screen.getByText("Fatigue")).toBeInTheDocument();
    expect(screen.getByText("Headache")).toBeInTheDocument();
    expect(screen.getByText("Bloating")).toBeInTheDocument();
    expect(screen.getByText("Nausea")).toBeInTheDocument();
    expect(screen.getByText("Insomnia")).toBeInTheDocument();
    expect(screen.getByText("Anxiety")).toBeInTheDocument();
    expect(screen.getByText("Dehydration")).toBeInTheDocument();
    expect(screen.getByText("Eye Strain")).toBeInTheDocument();
    expect(screen.getByText("Fever")).toBeInTheDocument();
  });

  it("shows active count", () => {
    render(<SymptomToggleGrid selected={["fatigue", "headache"]} onChange={jest.fn()} />);
    expect(screen.getByText("2 active")).toBeInTheDocument();
  });

  it("toggles symptom on click", async () => {
    const onChange = jest.fn();
    render(<SymptomToggleGrid selected={[]} onChange={onChange} />);
    await userEvent.click(screen.getByText("Fatigue"));
    expect(onChange).toHaveBeenCalledWith(["fatigue"]);
  });

  it("removes symptom on second click", async () => {
    const onChange = jest.fn();
    render(<SymptomToggleGrid selected={["fatigue"]} onChange={onChange} />);
    await userEvent.click(screen.getByText("Fatigue"));
    expect(onChange).toHaveBeenCalledWith([]);
  });
});

describe("StressSlider", () => {
  it("renders with value", () => {
    render(<StressSlider value={6} onChange={jest.fn()} />);
    expect(screen.getByText("Stress")).toBeInTheDocument();
    expect(screen.getByText("6")).toBeInTheDocument();
    expect(screen.getByText("Moderate")).toBeInTheDocument();
  });

  it("shows Calm label for low stress", () => {
    render(<StressSlider value={1} onChange={jest.fn()} />);
    const calmElements = screen.getAllByText("Calm");
    expect(calmElements.length).toBeGreaterThanOrEqual(1);
  });

  it("calls onChange", () => {
    const onChange = jest.fn();
    render(<StressSlider value={5} onChange={onChange} />);
    const slider = screen.getByRole("slider");
    fireEvent.change(slider, { target: { value: "8" } });
    expect(onChange).toHaveBeenCalledWith(8);
  });
});

describe("WellnessMetrics", () => {
  it("renders sleep, water, exercise", () => {
    render(
      <WellnessMetrics
        sleepHours={7} hydrationMl={1500} exerciseMinutes={30}
        onSleepChange={jest.fn()} onHydrationChange={jest.fn()} onExerciseChange={jest.fn()}
      />
    );
    expect(screen.getByText("Sleep")).toBeInTheDocument();
    expect(screen.getByText("Water")).toBeInTheDocument();
    expect(screen.getByText("Exercise")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText("1500")).toBeInTheDocument();
    expect(screen.getByText("30")).toBeInTheDocument();
  });
});

describe("DietLog", () => {
  it("renders add meal button when empty", () => {
    render(<DietLog meals={[]} onMealsChange={jest.fn()} />);
    expect(screen.getByText("Add Meal")).toBeInTheDocument();
  });

  it("shows meal form when Add Meal clicked", async () => {
    render(<DietLog meals={[]} onMealsChange={jest.fn()} />);
    await userEvent.click(screen.getByText("Add Meal"));
    expect(screen.getByPlaceholderText("What did you eat?")).toBeInTheDocument();
    expect(screen.getByText("Breakfast")).toBeInTheDocument();
    expect(screen.getByText("Lunch")).toBeInTheDocument();
  });

  it("renders existing meals", () => {
    const meals = [{ type: "Breakfast", description: "Oatmeal", healthScore: 4 }];
    render(<DietLog meals={meals} onMealsChange={jest.fn()} />);
    expect(screen.getByText("Oatmeal")).toBeInTheDocument();
    expect(screen.getByText("Breakfast")).toBeInTheDocument();
  });

  it("shows average score", () => {
    const meals = [
      { type: "Breakfast", description: "Oatmeal", healthScore: 4 },
      { type: "Lunch", description: "Salad", healthScore: 5 },
    ];
    render(<DietLog meals={meals} onMealsChange={jest.fn()} />);
    expect(screen.getByText("Avg: 4.5 \u2605")).toBeInTheDocument();
  });
});
