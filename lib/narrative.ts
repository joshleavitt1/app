export type MeetingType = "check_in" | "qbr" | "renewal" | "expansion" | "pitch" | "support" | "other";

export type ConfidenceSignal = {
  label: string;
  detail: string;
  metric?: {
    value: string;
    unit?: string;
    timeframe?: string;
  };
};

export type Watchout = {
  risk: string;
  framing: string;
  likelihood: string;
  impact: string;
};

export type ActionItem = {
  action: string;
  whyItMatters: string;
  dueBy?: string;
};

export type SuggestedClose = {
  closingQuestion: string;
  nextStep?: string;
  ctaType?: string;
};

export type NarrativeContent = {
  client: {
    name: string;
  };
  meeting: {
    date: string;
    type: MeetingType;
    objective: string;
  };
  narrative: {
    headline: string;
    contextSnapshot: {
      whatChanged: string;
    };
    confidenceSignals: ConfidenceSignal[];
    watchouts: Watchout[];
    actions: ActionItem[];
    suggestedClose: SuggestedClose;
  };
};

export type NarrativeRecord = {
  id: string;
  user_id: string;
  title: string | null;
  content: NarrativeContent;
  created_at: string;
  updated_at: string;
};

export const MEETING_TYPES: { value: MeetingType; label: string }[] = [
  { value: "check_in", label: "Check-in" },
  { value: "qbr", label: "QBR" },
  { value: "renewal", label: "Renewal" },
  { value: "expansion", label: "Expansion" },
  { value: "pitch", label: "Pitch" },
  { value: "support", label: "Support" },
  { value: "other", label: "Other" }
];

export const defaultNarrative: NarrativeContent = {
  client: {
    name: ""
  },
  meeting: {
    date: "",
    type: "check_in",
    objective: ""
  },
  narrative: {
    headline: "",
    contextSnapshot: {
      whatChanged: ""
    },
    confidenceSignals: [],
    watchouts: [],
    actions: [],
    suggestedClose: {
      closingQuestion: "",
      nextStep: "",
      ctaType: ""
    }
  }
};
