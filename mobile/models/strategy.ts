import { z } from 'zod';

export const StrategyPlanSchema = z.object({
  lapToBox: z.number(),                    // 0 = no further stop
  newTires: z.string(),
  explanation: z.string(),
  confidence: z.enum(['low', 'medium', 'high']),
  generatedAtLap: z.number(),
  generatedAt: z.number(),
});
export type StrategyPlan = z.infer<typeof StrategyPlanSchema>;