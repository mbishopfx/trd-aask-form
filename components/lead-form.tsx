'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  employmentFormSchema,
  educationLevelOptions
} from '@/lib/types';
import { toast } from 'sonner';

export function LeadForm() {
  const form = useForm<z.infer<typeof employmentFormSchema>>({
    resolver: zodResolver(employmentFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      pay_range: '',
      education_level: undefined,
      certificates: '',
      linkedin: '',
      additional_notes: ''
    }
  });

  async function onSubmit(data: z.infer<typeof employmentFormSchema>) {
    const response = await fetch('/api/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      toast.success('Application submitted successfully!');
      form.reset();
    } else {
      const error = await response.json();
      toast.error(error.message || 'Application submission failed');
    }
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-8 text-center">
        <div className="mb-4 flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="AASK Physical Therapy Logo"
            className="h-32 w-auto object-contain"
          />
        </div>
        <h1 className="text-3xl font-bold">AASK Rehab & Physical Therapy</h1>
        <p className="mt-2 text-lg text-gray-600">Employment Application</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FieldSet>
          <FieldLegend>Personal Information</FieldLegend>
          <FieldDescription>
            Please provide your contact and personal details.
          </FieldDescription>
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="name">
                    Full Name <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    {...field}
                    id="name"
                    aria-invalid={fieldState.invalid}
                    placeholder="John Doe"
                    autoComplete="name"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="email">
                      Email <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                      {...field}
                      id="email"
                      type="email"
                      aria-invalid={fieldState.invalid}
                      placeholder="john@example.com"
                      autoComplete="email"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="phone"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="phone">
                      Phone <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                      {...field}
                      id="phone"
                      type="tel"
                      aria-invalid={fieldState.invalid}
                      placeholder="(555) 123-4567"
                      autoComplete="tel"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>
          </FieldGroup>
        </FieldSet>

        <FieldSet>
          <FieldLegend>Professional Information</FieldLegend>
          <FieldDescription>
            Tell us about your education and qualifications.
          </FieldDescription>
          <FieldGroup>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Controller
                name="education_level"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="education_level">
                      Education Level <span className="text-destructive">*</span>
                    </FieldLabel>
                    <select
                      {...field}
                      id="education_level"
                      aria-invalid={fieldState.invalid}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Select education level...</option>
                      {educationLevelOptions.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="pay_range"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="pay_range">
                      Desired Pay Rate <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                      {...field}
                      id="pay_range"
                      aria-invalid={fieldState.invalid}
                      placeholder="e.g., $60,000/year or $30/hour"
                    />
                    <FieldDescription>
                      Enter your desired salary or hourly rate
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

            <Controller
              name="certificates"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="certificates">
                    Certifications & Licenses
                  </FieldLabel>
                  <Textarea
                    {...field}
                    id="certificates"
                    aria-invalid={fieldState.invalid}
                    placeholder="List your relevant certifications, licenses, or qualifications..."
                    rows={4}
                    className="resize-none"
                  />
                  <FieldDescription>
                    Optional: Include any PT certifications, state licenses, or other
                    relevant credentials.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="linkedin"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="linkedin">LinkedIn Profile</FieldLabel>
                  <Input
                    {...field}
                    id="linkedin"
                    type="url"
                    aria-invalid={fieldState.invalid}
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                  <FieldDescription>
                    Optional: Provide your LinkedIn profile URL.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </FieldSet>

        <FieldSet>
          <FieldLegend>Additional Information</FieldLegend>
          <FieldDescription>
            Share any additional information relevant to your application.
          </FieldDescription>
          <FieldGroup>
            <Controller
              name="additional_notes"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="additional_notes">
                    Additional Notes
                  </FieldLabel>
                  <Textarea
                    {...field}
                    id="additional_notes"
                    aria-invalid={fieldState.invalid}
                    placeholder="Tell us about your experience, availability, or anything else you'd like us to know..."
                    rows={6}
                    className="resize-none"
                  />
                  <FieldDescription>
                    {field.value?.length || 0}/2000 characters
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </FieldSet>

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Submitting...' : 'Submit Application'}
          </Button>
        </div>
      </form>
    </div>
  );
}
