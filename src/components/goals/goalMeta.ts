import { Car, GraduationCap, Heart, Home, LineChart, Palmtree, PiggyBank, Shield, type LucideIcon } from "lucide-react";
import type { GoalType } from "@/lib/types/domain";

export const GOAL_ICON: Record<GoalType, LucideIcon> = {
  house: Home,
  travel: Palmtree,
  emergency: Shield,
  car: Car,
  education: GraduationCap,
  retirement: PiggyBank,
  wedding: Heart,
  investing: LineChart,
};
