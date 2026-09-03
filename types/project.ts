export interface Project {
  id: string;
  name: string;
  tickers: string[];
  thesis: string | null;
  openQuestions: string[];
  lastViewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Counts of what moved while the analyst was away. Null until the project
    has been opened at least once. */
export interface ChangedSince {
  since: string;
  conversations: number;
  documents: number;
  artifacts: number;
}

export interface ProjectOverview extends Project {
  changedSince: ChangedSince | null;
  conversations: Array<{ id: string; title: string; updatedAt: string }>;
  documents: Array<{
    id: string;
    filename: string;
    status: string;
    pageCount: number | null;
    createdAt: string;
  }>;
  artifacts: Array<{
    id: string;
    kind: "sheet" | "note";
    title: string;
    currentVersion: number;
    updatedAt: string;
  }>;
}
