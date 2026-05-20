import { Router, Response } from 'express';
import prisma from '../db/client';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// Submit student response (in-app)
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId, questionId, selectedOptionId, studentName } = req.body;
    if (!sessionId || !questionId || !selectedOptionId) {
      res.status(400).json({ error: 'sessionId, questionId, and selectedOptionId are required' });
      return;
    }

    const session = await prisma.quizSession.findUnique({ where: { id: sessionId } });
    if (!session || session.status !== 'active') {
      res.status(400).json({ error: 'Session not found or closed' });
      return;
    }

    const response = await prisma.response.create({
      data: {
        sessionId,
        questionId,
        selectedOptionId,
        studentName: studentName || 'Anonymous',
        entryMode: 'in-app',
      },
    });

    res.json({ response });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Manual bulk entry (teacher)
router.post('/manual', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId, responses } = req.body;
    if (!sessionId || !Array.isArray(responses)) {
      res.status(400).json({ error: 'sessionId and responses array are required' });
      return;
    }

    const session = await prisma.quizSession.findUnique({ where: { id: sessionId } });
    if (!session || session.teacherId !== req.userId) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    const created = await Promise.all(
      responses.map((r: any) =>
        prisma.response.create({
          data: {
            sessionId,
            questionId: r.questionId,
            selectedOptionId: r.selectedOptionId,
            studentName: r.studentName,
            entryMode: 'manual',
          },
        })
      )
    );

    res.json({ responses: created, count: created.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get responses for a session
router.get('/session/:sessionId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const sessionId = req.params.sessionId as string;
    const session = await prisma.quizSession.findUnique({
      where: { id: sessionId },
    });
    if (!session || session.teacherId !== req.userId) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    const responses = await prisma.response.findMany({
      where: { sessionId },
      include: {
        question: { include: { options: true } },
        selectedOption: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ responses });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
