import prisma from '../db/client';
import { generateRecommendations } from './ai';

export interface QuestionAnalysis {
  questionId: string;
  stem: string;
  totalResponses: number;
  correctCount: number;
  correctPercent: number;
  optionBreakdown: {
    optionId: string;
    text: string;
    isCorrect: boolean;
    misconception: string | null;
    count: number;
    percent: number;
  }[];
}

export interface MisconceptionSummary {
  misconception: string;
  count: number;
  percentage: number;
  questions: string[];
}

export interface DiagnosticReport {
  sessionId: string;
  title: string;
  topic: string;
  totalStudents: number;
  totalQuestions: number;
  overallCorrectPercent: number;
  questionAnalysis: QuestionAnalysis[];
  misconceptions: MisconceptionSummary[];
  recommendations: string;
}

export async function generateDiagnosticReport(sessionId: string): Promise<DiagnosticReport> {
  const session = await prisma.quizSession.findUnique({
    where: { id: sessionId },
    include: {
      questions: { include: { options: true } },
    },
  });

  if (!session) throw new Error('Session not found');

  const responses = await prisma.response.findMany({
    where: { sessionId },
    include: {
      question: true,
      selectedOption: true,
    },
  });

  // Get unique students
  const uniqueStudents = new Set(responses.map((r) => r.studentName || r.studentId || 'unknown'));

  // Per-question analysis
  const questionAnalysis: QuestionAnalysis[] = session.questions.map((q) => {
    const qResponses = responses.filter((r) => r.questionId === q.id);
    const correctOption = q.options.find((o) => o.isCorrect);
    const correctCount = qResponses.filter((r) => r.selectedOptionId === correctOption?.id).length;

    const optionBreakdown = q.options.map((opt) => {
      const count = qResponses.filter((r) => r.selectedOptionId === opt.id).length;
      return {
        optionId: opt.id,
        text: opt.text,
        isCorrect: opt.isCorrect,
        misconception: opt.misconception,
        count,
        percent: qResponses.length > 0 ? Math.round((count / qResponses.length) * 100) : 0,
      };
    });

    return {
      questionId: q.id,
      stem: q.stem,
      totalResponses: qResponses.length,
      correctCount,
      correctPercent: qResponses.length > 0 ? Math.round((correctCount / qResponses.length) * 100) : 0,
      optionBreakdown,
    };
  });

  // Aggregate misconceptions
  const misconceptionMap = new Map<string, { count: number; questions: Set<string> }>();
  for (const qa of questionAnalysis) {
    for (const opt of qa.optionBreakdown) {
      if (!opt.isCorrect && opt.misconception && opt.count > 0) {
        const existing = misconceptionMap.get(opt.misconception) || { count: 0, questions: new Set() };
        existing.count += opt.count;
        existing.questions.add(qa.stem);
        misconceptionMap.set(opt.misconception, existing);
      }
    }
  }

  const totalResponses = responses.length;
  const misconceptions: MisconceptionSummary[] = Array.from(misconceptionMap.entries())
    .map(([misconception, data]) => ({
      misconception,
      count: data.count,
      percentage: totalResponses > 0 ? Math.round((data.count / totalResponses) * 100) : 0,
      questions: Array.from(data.questions),
    }))
    .sort((a, b) => b.count - a.count);

  const totalCorrect = questionAnalysis.reduce((sum, q) => sum + q.correctCount, 0);
  const overallCorrectPercent =
    totalResponses > 0 ? Math.round((totalCorrect / totalResponses) * 100) : 0;

  // Generate AI recommendations
  let recommendations = '';
  try {
    recommendations = await generateRecommendations(
      session.topic,
      misconceptions,
      questionAnalysis.map((q) => ({ stem: q.stem, correctPercent: q.correctPercent }))
    );
  } catch {
    recommendations = 'Unable to generate AI recommendations. Please review the data manually.';
  }

  return {
    sessionId,
    title: session.title,
    topic: session.topic,
    totalStudents: uniqueStudents.size,
    totalQuestions: session.questions.length,
    overallCorrectPercent,
    questionAnalysis,
    misconceptions,
    recommendations,
  };
}
