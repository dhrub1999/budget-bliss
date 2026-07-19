import { z } from 'zod';

export const goalIcons = [
  '🎯',
  '🏠',
  '✈️',
  '💻',
  '🚗',
  '🎓',
  '💍',
  '🌴'
] as const;

/**
 * Map each icon to a pastel color for the goal progress bar.
 * Auto-assigned based on icon selection — no color picker needed.
 */
export const iconColorMap: Record<string, string> = {
  '🎯': '#FFB3BA', // pastel pink
  '🏠': '#BAE1FF', // pastel blue
  '✈️': '#FFFFBA', // pastel yellow
  '💻': '#E8BAFF', // pastel purple
  '🚗': '#BAFFC9', // pastel green
  '🎓': '#FFD9BA', // pastel orange
  '💍': '#FFBAE8', // pastel rose
  '🌴': '#BAFFED' // pastel teal
};

export const goalSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Goal name is required' })
    .max(100, { message: 'Goal name must be 100 characters or less' }),

  targetAmount: z.coerce
    .number({ invalid_type_error: 'Target amount must be a number' })
    .positive({ message: 'Target amount must be a positive number' }),

  savedAmount: z.coerce
    .number({ invalid_type_error: 'Saved amount must be a number' })
    .min(0, { message: 'Saved amount cannot be negative' })
    .default(0),

  icon: z
    .string()
    .min(1, { message: 'Icon is required' })
    .refine((val) => goalIcons.includes(val as any), {
      message: 'Please select a valid icon'
    }),

  deadline: z.preprocess(
    (val) => {
      if (typeof val === 'string') return new Date(val);
      if (val instanceof Date) return val;
      return val;
    },
    z
      .date({
        required_error: 'Deadline is required',
        invalid_type_error: 'Invalid date format'
      })
      .refine((date) => date > new Date(), {
        message: 'Deadline must be in the future'
      })
  )
});

export type GoalSchemaInput = z.input<typeof goalSchema>;
export type GoalSchemaOutput = z.output<typeof goalSchema>;
