/** Where a value came from. Every number an analyst is asked to trust needs
    one of these — a cell with no source is a cell they have to re-verify by
    hand, which is the work the product exists to remove. */
export interface CellSource {
  /** Human-readable, shown in the Source column and the cell comment,
      e.g. "NVDA 10-Q, Page 14" or "Financial Modeling Prep". */
  label: string;
  url?: string;
  page?: number;
  /** Set when the source is a document the user uploaded. */
  documentId?: string;
  /** Set when the value came from one of the agent's data tools. */
  tool?: string;
}

/** A single cell.

    `formula` and `value` are deliberately separate. A cell the analyst
    expects to be computed (a growth rate, a margin, a peer median) must ship
    as a real Excel formula, so it recalculates and can be audited. Writing a
    hardcoded number where a formula belongs produces exactly the "plug" that
    a model review flags — see docs/WORKSPACE.md §7. */
export interface Cell {
  /** The literal value. For a formula cell this is the last computed result,
      used for on-screen display only. */
  value: string | number | null;
  /** Excel formula WITHOUT the leading "=", e.g. "C5/B5-1". */
  formula?: string;
  source?: CellSource;
  /** Rendering hint; does not affect the stored value. */
  format?: "number" | "percent" | "currency" | "text";
}

export interface SheetColumn {
  key: string;
  label: string;
}

export interface SheetContent {
  columns: SheetColumn[];
  /** Row-major. Each row maps column key -> cell. */
  rows: Array<Record<string, Cell>>;
  /** Free-text notes shown under the table (normalizations, caveats). */
  notes?: string[];
}

export interface NoteSection {
  heading: string;
  /** Markdown body. */
  body: string;
}

export interface NoteContent {
  sections: NoteSection[];
  sources?: CellSource[];
}

export type ArtifactKind = "sheet" | "note";

export type ArtifactContent = SheetContent | NoteContent;

/** The recipe that produced an artifact. Storing it is what makes Refresh
    possible: re-run the same spec next quarter and diff the result, instead
    of rebuilding the artifact from scratch. */
export interface ArtifactSpec {
  tickers?: string[];
  metrics?: string[];
  periods?: string[];
  /** Free-form for kinds that don't fit the above. */
  [key: string]: unknown;
}

export interface ArtifactSummary {
  id: string;
  kind: ArtifactKind;
  title: string;
  projectId: string | null;
  conversationId: string | null;
  currentVersion: number;
  createdAt: number;
  updatedAt: number;
}

export interface ArtifactDetail extends ArtifactSummary {
  spec: ArtifactSpec | null;
  content: ArtifactContent;
}

export function isSheetContent(content: ArtifactContent): content is SheetContent {
  return Array.isArray((content as SheetContent).columns);
}
