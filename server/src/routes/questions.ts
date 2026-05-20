import { Router, Response } from 'express';
import prisma from '../db/client';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { generateHingeQuestions } from '../services/ai';

const router = Router();

// AI-generate questions
router.post('/generate', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { topic, subtopic, count = 5, grade = 'middle school' } = req.body;
    if (!topic) {
      res.status(400).json({ error: 'Topic is required' });
      return;
    }

    const questions = await generateHingeQuestions(topic, subtopic, Math.min(count, 10), grade);
    res.json({ questions, topic, subtopic, grade });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Save questions to database
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { topic, subtopic, questions, sessionId } = req.body;
    if (!questions || !Array.isArray(questions)) {
      res.status(400).json({ error: 'Questions array is required' });
      return;
    }

    const created = await Promise.all(
      questions.map((q: any) =>
        prisma.question.create({
          data: {
            teacherId: req.userId!,
            topic: topic || 'General',
            subtopic,
            stem: q.stem,
            sessionId: sessionId || null,
            options: {
              create: q.options.map((o: any) => ({
                text: o.text,
                isCorrect: o.isCorrect,
                misconception: o.misconception || null,
              })),
            },
          },
          include: { options: true },
        })
      )
    );

    res.json({ questions: created });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// List teacher's questions
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { topic } = req.query;
    const where: any = { teacherId: req.userId };
    if (topic) where.topic = { contains: topic as string };

    const questions = await prisma.question.findMany({
      where,
      include: { options: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ questions });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update a question
router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { stem, options, topic, subtopic } = req.body;
    const question = await prisma.question.findUnique({ where: { id } });
    if (!question || question.teacherId !== req.userId) {
      res.status(404).json({ error: 'Question not found' });
      return;
    }

    if (options) {
      await prisma.option.deleteMany({ where: { questionId: id } });
    }

    const updated = await prisma.question.update({
      where: { id },
      data: {
        stem: stem || question.stem,
        topic: topic || question.topic,
        subtopic: subtopic !== undefined ? subtopic : question.subtopic,
        ...(options && {
          options: {
            create: options.map((o: any) => ({
              text: o.text,
              isCorrect: o.isCorrect,
              misconception: o.misconception || null,
            })),
          },
        }),
      },
      include: { options: true },
    });
    res.json({ question: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a question
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const question = await prisma.question.findUnique({ where: { id } });
    if (!question || question.teacherId !== req.userId) {
      res.status(404).json({ error: 'Question not found' });
      return;
    }

    await prisma.question.delete({ where: { id } });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
