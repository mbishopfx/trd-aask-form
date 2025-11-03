import OpenAI from 'openai';
import {
  EmploymentFormSchema,
  QualificationSchema,
  JobApplication
} from '@/lib/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Research LinkedIn profile if URL is provided
 */
export async function researchLinkedIn(
  linkedinUrl: string
): Promise<string | null> {
  if (!linkedinUrl) return null;

  try {
    // Note: In a real implementation, you would use a LinkedIn scraping service
    // or the LinkedIn API. For now, we'll simulate this with AI analysis.
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are an HR analyst researching potential candidates. Provide insights based on LinkedIn profile URL.'
        },
        {
          role: 'user',
          content: `Analyze this LinkedIn profile URL and provide insights about what we might expect from a candidate with this profile: ${linkedinUrl}`
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    return response.choices[0].message.content || 'Unable to analyze LinkedIn profile';
  } catch (error) {
    console.error('LinkedIn research error:', error);
    return 'Unable to research LinkedIn profile at this time';
  }
}

/**
 * Analyze applicant and generate comprehensive assessment
 */
export async function analyzeApplicant(
  application: JobApplication
): Promise<{
  research_summary: string;
  linkedin_analysis: string | null;
}> {
  try {
    // Research LinkedIn if provided
    const linkedinAnalysis = application.linkedin
      ? await researchLinkedIn(application.linkedin)
      : null;

    // Generate comprehensive analysis
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an expert HR analyst for AASK Physical Therapy. Analyze job applications and provide detailed, professional assessments of candidates. Consider education level, certifications, pay expectations, and overall fit for a physical therapy practice.`
        },
        {
          role: 'user',
          content: `Analyze this job application:

Name: ${application.name}
Email: ${application.email}
Phone: ${application.phone}
Address: ${application.address}
Education Level: ${application.education_level}
Desired Pay Range: ${application.pay_range}
Certifications: ${application.certificates || 'None provided'}
LinkedIn: ${application.linkedin || 'Not provided'}
Additional Notes: ${application.additional_notes || 'None'}

${linkedinAnalysis ? `LinkedIn Analysis: ${linkedinAnalysis}` : ''}

Provide a comprehensive analysis covering:
1. Overall candidate profile and background
2. Qualifications and certifications assessment
3. Education level appropriateness for physical therapy roles
4. Salary expectations evaluation
5. Potential strengths and areas of concern
6. Recommendations for next steps

Format your response as a professional HR assessment report.`
        }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });

    return {
      research_summary:
        response.choices[0].message.content || 'Unable to generate analysis',
      linkedin_analysis: linkedinAnalysis
    };
  } catch (error) {
    console.error('Applicant analysis error:', error);
    throw new Error('Failed to analyze applicant');
  }
}

/**
 * Qualify candidate based on application and research
 */
export async function qualifyCandidate(
  application: JobApplication,
  research: string
): Promise<QualificationSchema> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an HR qualification system for AASK Physical Therapy. Based on the application and research, determine if the candidate is QUALIFIED, UNQUALIFIED, or needs FOLLOW_UP. Provide a clear, concise reason for your decision.`
        },
        {
          role: 'user',
          content: `Based on this analysis, qualify the candidate:

Applicant: ${application.name}
Education: ${application.education_level}
Pay Range: ${application.pay_range}
Certifications: ${application.certificates || 'None'}

Analysis:
${research}

Respond in JSON format with:
{
  "category": "QUALIFIED" | "UNQUALIFIED" | "FOLLOW_UP",
  "reason": "Brief explanation of your decision"
}`
        }
      ],
      temperature: 0.5,
      max_tokens: 300,
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(
      response.choices[0].message.content || '{}'
    ) as QualificationSchema;
    return result;
  } catch (error) {
    console.error('Candidate qualification error:', error);
    // Default to FOLLOW_UP if there's an error
    return {
      category: 'FOLLOW_UP',
      reason: 'Unable to automatically qualify candidate - manual review needed'
    };
  }
}

/**
 * Complete AI analysis pipeline
 */
export async function performAIAnalysis(application: JobApplication) {
  // Step 1: Analyze applicant
  const { research_summary, linkedin_analysis } = await analyzeApplicant(
    application
  );

  // Step 2: Qualify candidate
  const qualification = await qualifyCandidate(application, research_summary);

  return {
    research_summary,
    linkedin_analysis,
    qualification_category: qualification.category,
    qualification_reason: qualification.reason
  };
}
