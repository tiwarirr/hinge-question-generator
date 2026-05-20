import { Router, Response } from 'express';
import prisma from '../db/client';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { generateDiagnosticReport } from '../services/analysis';

const router = Router();

// Get diagnostic report for a session
router.get('/:sessionId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const sessionId = req.params.sessionId as string;
    const session = await prisma.quizSession.findUnique({
      where: { id: sessionId },
    });
    if (!session || session.teacherId !== req.userId) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    const report = await generateDiagnosticReport(sessionId);
    res.json({ report });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Export report as CSV
router.get('/:sessionId/export', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const sessionId = req.params.sessionId as string;
    const session = await prisma.quizSession.findUnique({
      where: { id: sessionId },
    });
    if (!session || session.teacherId !== req.userId) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    const report = await generateDiagnosticReport(sessionId);

    // Build CSV
    const rows: string[] = ['Question,Total Responses,Correct %,Top Misconception'];

    for (const qa of report.questionAnalysis) {
      const topMisconception = qa.optionBreakdown
        .filter((o) => !o.isCorrect && o.misconception)
        .sort((a, b) => b.count - a.count)[0];

      rows.push(
        `"${qa.stem.replace(/"/g, '""')}",${qa.totalResponses},${qa.correctPercent}%,"${topMisconception?.misconception?.replace(/"/g, '""') || 'None'}"`
      );
    }

    rows.push('');
    rows.push('Misconception,Count,Percentage');
    for (const m of report.misconceptions) {
      rows.push(`"${m.misconception.replace(/"/g, '""')}",${m.count},${m.percentage}%`);
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="report-${session.code}.csv"`);
    res.send(rows.join('\n'));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
