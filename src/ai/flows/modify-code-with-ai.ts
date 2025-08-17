'use server';
/**
 * @fileOverview AI-powered code modification flow.
 *
 * - modifyCode - A function that accepts a natural language request for code modification and generates the necessary code changes.
 * - ModifyCodeInput - The input type for the modifyCode function.
 * - ModifyCodeOutput - The return type for the modifyCode function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ModifyCodeInputSchema = z.object({
  request: z
    .string()
    .describe('The natural language request for code modification.'),
  fileContent: z
    .string()
    .describe('The current content of the file to be modified.'),
  filePath: z.string().describe('The full path of the file to be modified.'),
});
export type ModifyCodeInput = z.infer<typeof ModifyCodeInputSchema>;

const ModifyCodeOutputSchema = z.object({
  modifiedContent: z.string().describe('The modified content of the file.'),
  commitMessage: z
    .string()
    .describe('A descriptive commit message for the changes.'),
});
export type ModifyCodeOutput = z.infer<typeof ModifyCodeOutputSchema>;

export async function modifyCode(
  input: ModifyCodeInput
): Promise<ModifyCodeOutput> {
  return modifyCodeFlow(input);
}

const modifyCodePrompt = ai.definePrompt({
  name: 'modifyCodePrompt',
  input: {schema: ModifyCodeInputSchema},
  output: {schema: z.object({modifiedContent: z.string()})},
  prompt: `You are a code modification expert. Given a file content, its path, and a modification request, you will generate ONLY the modified content.

File Path:
\`\`\`
{{filePath}}
\`\`\`

File Content:
\`\`\`
{{fileContent}}
\`\`\`

Modification Request:
{{request}}

Return only the complete, modified file content. Do not add any extra explanations, notes, or markdown formatting around the code.
`,
});

const commitMessagePrompt = ai.definePrompt({
  name: 'commitMessagePrompt',
  input: {
    schema: z.object({
      request: z.string(),
      filePath: z.string(),
      originalContent: z.string(),
      modifiedContent: z.string(),
    }),
  },
  output: {schema: z.object({commitMessage: z.string()})},
  prompt: `You are a commit message expert. Your task is to generate a concise, descriptive commit message in the conventional commit format (e.g., "feat: Add new login button").

Modification Request: {{request}}
File Path: {{filePath}}

Analyze the diff between the original and modified content to understand the change.

Original Content:
\`\`\`
{{originalContent}}
\`\`\`

Modified Content:
\`\`\`
{{modifiedContent}}
\`\`\`

Generate the commit message.`,
});

const modifyCodeFlow = ai.defineFlow(
  {
    name: 'modifyCodeFlow',
    inputSchema: ModifyCodeInputSchema,
    outputSchema: ModifyCodeOutputSchema,
  },
  async input => {
    const {output: modifiedContentOutput} = await modifyCodePrompt(input);

    const {output: commitMessageOutput} = await commitMessagePrompt({
      request: input.request,
      filePath: input.filePath,
      originalContent: input.fileContent,
      modifiedContent: modifiedContentOutput.modifiedContent,
    });

    return {
      modifiedContent: modifiedContentOutput.modifiedContent,
      commitMessage: commitMessageOutput.commitMessage,
    };
  }
);
