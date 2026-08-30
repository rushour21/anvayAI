import { searchWebTool } from "./search-web";
import { searchNewsTool } from "./search-news";
import { searchFilingsTool } from "./search-filings";
import { companyProfileTool } from "./company-profile";
import { stockPriceTool } from "./stock-price";
import { historicalPricesTool } from "./historical-prices";
import { marketCapTool } from "./market-cap";
import { financialsTool } from "./financials";
import { incomeStatementTool } from "./income-statement";
import { balanceSheetTool } from "./balance-sheet";
import { cashFlowTool } from "./cash-flow";
import { calculateMetricTool } from "./calculate-metric";
import { listSkillsTool, loadSkillTool } from "./skills";
import { peRatioTool } from "./ratio-pe";
import { pbRatioTool } from "./ratio-pb";
import { evEbitdaRatioTool } from "./ratio-ev-ebitda";
import { roeRatioTool } from "./ratio-roe";
import { roicRatioTool } from "./ratio-roic";
import { marginsRatioTool } from "./ratio-margins";

/* The financial analyst agent's full tool set (AGENTS.md Phase 3 §3 + Phase
   4 §4.1-4.5). Market, statement, ratio, and research tools; the LLM
   decides per-message which (if any) it needs. */
export const financialAgentTools = [
  // Market
  stockPriceTool,
  historicalPricesTool,
  marketCapTool,
  // Statements
  financialsTool,
  incomeStatementTool,
  balanceSheetTool,
  cashFlowTool,
  // Ratios
  peRatioTool,
  pbRatioTool,
  evEbitdaRatioTool,
  roeRatioTool,
  roicRatioTool,
  marginsRatioTool,
  // Company/research
  companyProfileTool,
  searchWebTool,
  searchNewsTool,
  searchFilingsTool,
  // Calculation
  calculateMetricTool,
  // Skills
  listSkillsTool,
  loadSkillTool,
] as const;
