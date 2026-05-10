import { z } from "zod";

export const createTripSchema = z.object({
  name: z.string().min(1, "Trip name is required").max(100),
  description: z.string().max(500).optional(),
  emoji: z.string().max(10).default("✈️"),
  currency: z.string().default("INR"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const updateTripSchema = createTripSchema.partial();

export const createExpenseSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  amount: z.number().positive("Amount must be greater than 0"),
  category: z.enum(["FOOD", "TRANSPORT", "ACCOMMODATION", "ENTERTAINMENT", "SHOPPING", "FUEL", "ACTIVITIES", "OTHER"]).default("OTHER"),
  notes: z.string().max(1000).optional(),
  receiptUrl: z.string().url().optional(),
  location: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  splitType: z.enum(["EQUAL", "UNEQUAL", "PERCENTAGE"]).default("EQUAL"),
  date: z.string().optional(),
  paidById: z.string().min(1, "Payer is required"),
  splitAmong: z.array(z.object({
    userId: z.string(),
    amount: z.number().optional(),
    percentage: z.number().optional(),
  })).min(1, "At least one person must be included"),
});

export const updateExpenseSchema = createExpenseSchema.partial();

export const createSettlementSchema = z.object({
  amount: z.number().positive("Amount must be greater than 0"),
  method: z.enum(["MANUAL", "UPI", "PAYPAL"]).default("MANUAL"),
  note: z.string().max(500).optional(),
  payerId: z.string().min(1, "Payer is required"),
  receiverId: z.string().min(1, "Receiver is required"),
});

export const inviteMemberSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export type CreateTripInput = z.infer<typeof createTripSchema>;
export type UpdateTripInput = z.infer<typeof updateTripSchema>;
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
export type CreateSettlementInput = z.infer<typeof createSettlementSchema>;
