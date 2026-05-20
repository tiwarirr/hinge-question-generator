import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { api } from '../lib/api';

const COLORS = ['#10B981', '#EF4444', '#F59E0B', '#6366F1', '#EC4899'];

export default function DiagnosticReport() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (sessionId) {
      api.getReport(sessionId)
        .then((data) => setReport(data.report))
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [sessionId]);

  if (loading) return <div className="animate-pulse text-gray-400">Generating report...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!report) return null;

  const exportUrl = api.exportReport(sessionId!);

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold">Diagnostic Report</h2>
          <p className="text-gray-500">{report.title} &middot; {report.topic}</p>
        </div>
        <a
          href={exportUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
        >
          Export CSV
        </a>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <p className="text-sm text-gray-500">Total Students</p>
          <p className="text-2xl font-bold text-indigo-600">{report.totalStudents}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <p className="text-sm text-gray-500">Questions</p>
          <p className="text-2xl font-bold text-indigo-600">{report.totalQuestions}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <p className="text-sm text-gray-500">Overall Score</p>
          <p className={`text-2xl font-bold ${report.overallCorrectPercent >= 70 ? 'text-green-600' : report.overallCorrectPercent >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
            {report.overallCorrectPercent}%
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <p className="text-sm text-gray-500">Misconceptions Found</p>
          <p className="text-2xl font-bold text-red-500">{report.misconceptions.length}</p>
        </div>
      </div>

      {/* Per-Question Performance */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h3 className="font-semibold text-lg mb-4">Question Performance</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={report.questionAnalysis.map((q: any, i: number) => ({
            name: `Q${i + 1}`,
            correct: q.correctPercent,
            incorrect: 100 - q.correctPercent,
          }))}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 100]} />
            <Tooltip formatter={(value: number) => `${value}%`} />
            <Bar dataKey="correct" fill="#10B981" name="Correct" stackId="a" />
            <Bar dataKey="incorrect" fill="#EF4444" name="Incorrect" stackId="a" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Misconception Map */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h3 className="font-semibold text-lg mb-4">Misconception Map</h3>
        {report.misconceptions.length === 0 ? (
          <p className="text-gray-400">No misconceptions identified. Great job!</p>
        ) : (
          <div className="space-y-3">
            {report.misconceptions.map((m: any, i: number) => (
              <div key={i} className="flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{m.misconception}</p>
                  <p className="text-xs text-gray-500">
                    Affects {m.count} response(s) &middot; Seen in: {m.questions.slice(0, 2).join('; ')}
                    {m.questions.length > 2 ? ` +${m.questions.length - 2} more` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full"
                      style={{ width: `${Math.min(m.percentage, 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-red-600 w-10 text-right">{m.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detailed Question Breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h3 className="font-semibold text-lg mb-4">Detailed Breakdown</h3>
        <div className="space-y-6">
          {report.questionAnalysis.map((q: any, qi: number) => (
            <div key={q.questionId} className="border-b border-gray-100 pb-6 last:border-0">
              <div className="flex justify-between items-start mb-3">
                <div className="font-medium">
                  <span className="text-indigo-600 mr-2">Q{qi + 1}.</span>
                  <span dangerouslySetInnerHTML={{ __html: q.stem }} />
                </div>
                <span className={`text-sm font-semibold px-2 py-1 rounded ${
                  q.correctPercent >= 70 ? 'bg-green-100 text-green-700' :
                  q.correctPercent >= 50 ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {q.correctPercent}% correct
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {q.optionBreakdown.map((opt: any, oi: number) => (
                  <div
                    key={opt.optionId}
                    className={`px-3 py-2 rounded-lg text-sm ${
                      opt.isCorrect ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between">
                      <span>
                        <span className="font-semibold">{String.fromCharCode(65 + oi)}.</span> {opt.text}
                      </span>
                      <span className="font-medium">{opt.percent}%</span>
                    </div>
                    {opt.misconception && opt.count > 0 && (
                      <p className="text-xs text-red-500 mt-1">Misconception: {opt.misconception}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-semibold text-lg mb-4">AI Recommendations</h3>
        <div className="prose prose-sm max-w-none text-gray-700">
          {report.recommendations.split('\n').map((line: string, i: number) => {
            if (line.startsWith('### ')) return <h4 key={i} className="font-semibold text-base mt-4 mb-2">{line.slice(4)}</h4>;
            if (line.startsWith('## ')) return <h3 key={i} className="font-bold text-lg mt-4 mb-2">{line.slice(3)}</h3>;
            if (line.startsWith('- ')) return <li key={i} className="ml-4">{line.slice(2)}</li>;
            if (line.trim() === '') return <br key={i} />;
            return <p key={i}>{line}</p>;
          })}
        </div>
      </div>
    </div>
  );
}
