'use server';
/**
 * @fileOverview An AI flow to analyze and summarize a lead.
 *
 * - summarizeLead - A function that generates insights about a lead.
 * - SummarizeLeadInput - The input type for the summarizeLead function.
 * - SummarizeLeadOutput - The return type for the summarizeLeadOutput function.
 */

import {ai} from '@/ai/genkit';
import type { HistoryItem, Note } from '@/lib/types';
import {z} from 'genkit';

// Helper to format history and notes for the prompt
const formatHistory = (history: HistoryItem[]) => 
    history.map(h => `${h.timestamp}: ${h.action} (by ${h.user ? h.user.name : 'System'})`).join('\n');

const formatNotes = (notes: Note[]) => 
    notes.map(n => `${n.timestamp}: ${n.content} (by ${n.user ? n.user.name : 'System'})`).join('\n');

const formatCustomFields = (fields: Record<string, any>) => JSON.stringify(fields, null, 2);


const SummarizeLeadInputSchema = z.object({
  name: z.string().describe('The name of the lead.'),
  inquiryType: z.string().describe('The type of inquiry the lead has made.'),
  history: z.string().describe('The chronological history of interactions with the lead.'),
  notes: z.string().describe('Internal notes made by team members about the lead.'),
  customFields: z.string().describe('A JSON string of any custom data captured for the lead.'),
});
export type SummarizeLeadInput = z.infer<typeof SummarizeLeadInputSchema>;

const SummarizeLeadOutputSchema = z.object({
  summary: z.string().describe("A concise 2-3 sentence summary of the lead's current situation and key points."),
  temperature: z.enum(['Hot', 'Warm', 'Cold']).describe("The lead's temperature, indicating their likelihood to convert. 'Hot' for very likely, 'Warm' for moderately likely, 'Cold' for unlikely."),
  suggestedNextSteps: z.array(z.string()).describe('A list of 3-4 concrete, actionable next steps for the sales counselor to take.'),
});
export type SummarizeLeadOutput = z.infer<typeof SummarizeLeadOutputSchema>;

export async function summarizeLead(lead: {
    name: string;
    inquiryType: string;
    history: HistoryItem[];
    notes: Note[];
    customFields?: Record<string, any>;
}): Promise<SummarizeLeadOutput> {
    const input = {
        name: lead.name,
        inquiryType: lead.inquiryType,
        history: formatHistory(lead.history || []),
        notes: formatNotes(lead.notes || []),
        customFields: formatCustomFields(lead.customFields || {}),
    };
  const {output} = await summarizeLeadFlow(input);
  if (!output) {
    throw new Error("AI failed to generate a valid summary.");
  }
  return output;
}

const prompt = ai.definePrompt({
  name: 'summarizeLeadPrompt',
  input: {schema: SummarizeLeadInputSchema},
  output: {schema: SummarizeLeadOutputSchema},
  prompt: `You are an expert sales assistant for a fertility and healthcare clinic. Your goal is to provide actionable insights for sales counselors to help them convert leads into patients.

Based on ALL the information provided, generate a concise summary, determine the lead's temperature (Hot, Warm, or Cold), and suggest concrete next steps.
- The summary should be brief and highlight the most important information a counselor needs to know.
- The temperature should reflect their intent and engagement level. A lead with a booked appointment is likely Hot. A lead who has expressed disinterest is Cold.
- Suggested next steps should be specific and actionable (e.g., "Call to discuss financing options," not "Follow up").

Analyze the following lead information for a person named {{name}}.

**Inquiry Type:**
{{inquiryType}}

**Interaction History:**
{{{history}}}

**Internal Notes:**
{{{notes}}}

**Additional Information:**
{{{customFields}}}
`,
});

const summarizeLeadFlow = ai.defineFlow(
  {
    name: 'summarizeLeadFlow',
    inputSchema: SummarizeLeadInputSchema,
    outputSchema: SummarizeLeadOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
