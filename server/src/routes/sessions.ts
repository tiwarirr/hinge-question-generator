import { Router, Response } from 'express';
import prisma from '../db/client';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// Create a quiz session
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { title, topic, questionIds } = req.body;
    if (!title || !topic || !questionIds || !Array.isArray(questionIds)) {
      res.status(400).json({ error: 'Title, topic, and questionIds are required' });
      return;
    }

    let code = generateCode();
    while (await prisma.quizSession.findUnique({ where: { code } })) {
      code = generateCode();
    }

    const session = await prisma.quizSession.create({
      data: {
        teacherId: req.userId!,
        title,
        topic,
        code,
        questions: { connect: questionIds.map((id: string) => ({ id })) },
      },
      include: { questions: { include: { options: true } } },
    });

    res.json({ session });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// List teacher's sessions
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const sessions = await prisma.quizSession.findMany({
      where: { teacherId: req.userId },
      include: {
        questions: { include: { options: true } },
        _count: { select: { responses: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ sessions });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get session by code (public - for students)
router.get('/code/:code', async (req: AuthRequest, res: Response) => {
  try {
    const code = req.params.code as string;
    const session = await prisma.quizSession.findUnique({
      where: { code },
      include: {
        questions: {
          include: { options: { select: { id: true, text: true } } },
        },
      },
    });

    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    res.json({ session });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Close a session
router.patch('/:id/close', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const session = await prisma.quizSession.findUnique({ where: { id } });
    if (!session || session.teacherId !== req.userId) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    const updated = await prisma.quizSession.update({
      where: { id },
      data: { status: 'closed' },
    });
    res.json({ session: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get session by ID (authenticated - for teacher)
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const session = await prisma.quizSession.findUnique({
      where: { id },
      include: { questions: { include: { options: true } } },
    });

    if (!session || session.teacherId !== req.userId) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    res.json({ session });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
