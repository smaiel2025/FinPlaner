import type { CustomerState } from "@/lib/types/domain";
import type { GoalProjection, Opportunity } from "@/lib/types/intelligence";

export type Detector = (state: CustomerState, projections: GoalProjection[]) => Opportunity[];

export const base = (state: CustomerState) => ({ detectedAt: state.today });
