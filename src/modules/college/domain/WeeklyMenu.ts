import { z } from 'zod';

const mealItemSchema = z.string()
  .trim()
  .min(1, 'Menu item cannot be empty or whitespace')
  .max(100, 'Menu item is too long');

const mealSchema = z.array(mealItemSchema)
  .max(30, 'Too many items in a meal')
  .default([]);

const dailyMenuSchema = z.object({
  breakfast: mealSchema,
  lunch: mealSchema,
  snacks: mealSchema,
  dinner: mealSchema,
}).strict().default({ breakfast: [], lunch: [], snacks: [], dinner: [] });

export const weeklyMenuSchema = z.object({
  monday: dailyMenuSchema,
  tuesday: dailyMenuSchema,
  wednesday: dailyMenuSchema,
  thursday: dailyMenuSchema,
  friday: dailyMenuSchema,
  saturday: dailyMenuSchema,
  sunday: dailyMenuSchema,
}).strict();

export type WeeklyMenuProps = z.infer<typeof weeklyMenuSchema>;

export class WeeklyMenu {
  private constructor(public readonly props: WeeklyMenuProps) {}

  static create(props: unknown): WeeklyMenu {
    const validated = weeklyMenuSchema.parse(props || {});
    return new WeeklyMenu(validated);
  }

  toJSON(): WeeklyMenuProps {
    return this.props;
  }
}
