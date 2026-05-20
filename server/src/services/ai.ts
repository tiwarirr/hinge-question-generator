import OpenAI from 'openai';

function getOpenAI(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is not set. Please set it in the server/.env file.');
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
  });
}

function getModel(): string {
  return process.env.OPENAI_MODEL || 'gpt-4o-mini';
}

export interface GeneratedOption {
  text: string;
  isCorrect: boolean;
  misconception: string | null;
}

export interface GeneratedQuestion {
  stem: string;
  options: GeneratedOption[];
}

export async function generateHingeQuestions(
  topic: string,
  subtopic: string | undefined,
  count: number,
  grade: string
): Promise<GeneratedQuestion[]> {
  const prompt = `You are an expert educator specializing in diagnostic assessment and formative evaluation.

Generate exactly ${count} Hinge Questions on the topic "${topic}"${subtopic ? ` (subtopic: ${subtopic})` : ''} for ${grade} students.

What are Hinge Questions?
- Diagnostic multiple-choice questions asked at critical "hinge points" in a lesson
- Designed to check whether students have grasped a concept before moving on
- Must be answerable in under 30 seconds
- Each wrong answer (distractor) must reveal a SPECIFIC, COMMON misconception that students have

Requirements for each question:
- Clear, unambiguous question stem
- Exactly 4 options (A, B, C, D)
- 1 clearly correct answer
- 3 distractors that each reveal a different, specific misconception
- Language appropriate for ${grade} students
- Questions should test understanding, not just recall

Return ONLY a JSON object with a "questions" array in this exact format:
{
  "questions": [
    {
      "stem": "Question text here?",
      "options": [
        {"text": "Correct answer", "isCorrect": true, "misconception": null},
        {"text": "Wrong answer A", "isCorrect": false, "misconception": "Specific misconception this reveals"},
        {"text": "Wrong answer B", "isCorrect": false, "misconception": "Another specific misconception"},
        {"text": "Wrong answer C", "isCorrect": false, "misconception": "Third specific misconception"}
      ]
    }
  ]
}`;

  const openai = getOpenAI();
  const model = getModel();

  try {
    const response = await openai.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error('No response from AI');

    const parsed = JSON.parse(content);
    const questions = Array.isArray(parsed) ? parsed : parsed.questions;
    return questions as GeneratedQuestion[];
  } catch (err: any) {
    // If json_object format is not supported, retry without it
    if (err.message?.includes('json_object') || err.status === 400) {
      const response = await openai.chat.completions.create({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      });

      const content = response.choices[0].message.content;
      if (!content) throw new Error('No response from AI');

      // Extract JSON from possible markdown code blocks
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Could not parse AI response as JSON');

      const parsed = JSON.parse(jsonMatch[0]);
      const questions = Array.isArray(parsed) ? parsed : parsed.questions;
      return questions as GeneratedQuestion[];
    }
    throw err;
  }
}

export async function generateRecommendations(
  topic: string,
  misconceptions: { misconception: string; count: number; percentage: number }[],
  questionResults: { stem: string; correctPercent: number }[]
): Promise<string> {
  const prompt = `You are an expert education consultant. Based on a diagnostic assessment on "${topic}", provide reteaching recommendations.

Misconceptions found (ranked by frequency):
${misconceptions.map((m, i) => `${i + 1}. "${m.misconception}" — ${m.percentage}% of students (${m.count} students)`).join('\n')}

Question performance:
${questionResults.map((q, i) => `${i + 1}. "${q.stem}" — ${q.correctPercent}% correct`).join('\n')}

Provide:
1. A brief summary of the class's understanding
2. Top 2-3 misconceptions to address immediately
3. Specific reteaching strategies for each misconception
4. Suggested follow-up activities

Keep it concise and actionable. Use markdown formatting.`;

  const openai = getOpenAI();
  const response = await openai.chat.completions.create({
    model: getModel(),
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
  });

  return response.choices[0].message.content || 'No recommendations generated.';
}
