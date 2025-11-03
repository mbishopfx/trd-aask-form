import { z } from 'zod';

/**
 * Employment Application schema
 */

export const educationLevelOptions = [
  'High School',
  "Associate's",
  "Bachelor's",
  "Master's",
  'Doctorate'
] as const;

export const employmentFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Name is required')
    .max(100, 'Name must be at most 100 characters.'),
  email: z.string().email('Please enter a valid email address.'),
  phone: z
    .string()
    .regex(/^[\d\s\-\+\(\)]+$/, 'Please enter a valid phone number.')
    .min(10, 'Phone number must be at least 10 digits.'),
  pay_range: z
    .string()
    .min(1, 'Please enter your desired pay rate')
    .max(100, 'Pay rate must be at most 100 characters.'),
  education_level: z.enum(educationLevelOptions, {
    message: 'Please select your education level'
  }),
  certificates: z
    .string()
    .max(1000, 'Certificates must be at most 1000 characters.')
    .optional()
    .or(z.literal('')),
  linkedin: z
    .string()
    .url('Please enter a valid LinkedIn URL')
    .optional()
    .or(z.literal('')),
  additional_notes: z
    .string()
    .max(2000, 'Additional notes must be at most 2000 characters.')
    .optional()
    .or(z.literal(''))
});

export type EmploymentFormSchema = z.infer<typeof employmentFormSchema>;

/**
 * Job Application (Database schema)
 */
export interface JobApplication extends EmploymentFormSchema {
  id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

/**
 * Qualification schema for AI analysis
 */

export const qualificationCategorySchema = z.enum([
  'QUALIFIED',
  'UNQUALIFIED',
  'FOLLOW_UP'
]);

export const qualificationSchema = z.object({
  category: qualificationCategorySchema,
  reason: z.string()
});

export type QualificationSchema = z.infer<typeof qualificationSchema>;

/**
 * AI Analysis (Database schema)
 */
export interface AIAnalysis {
  id: string;
  application_id: string;
  research_summary: string | null;
  qualification_category: string | null;
  qualification_reason: string | null;
  linkedin_analysis: string | null;
  analyzed_at: string;
}
