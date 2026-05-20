import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

export default function ManualEntry() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [studentName, setStudentName] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submittedCount, setSubmittedCount] = useState(0);

  useEffect(() => {
    if (id) {
      api.getSessionById(id)
        .then((data) => setSession(data.session))
        .catch(() => setError('Session not found'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) {
      setError('Enter student name');
      return;
    }

    const unanswered = session.questions.filter((q: any) => !answers[q.id]);
    if (unanswered.length > 0) {
      setError(`Answer all questions (${unanswered.length} remaining)`);
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      const responses = session.questions.map((q: any) => ({
        questionId: q.id,
        selectedOptionId: answers[q.id],
        studentName: studentName.trim(),
      }));
      await api.submitManualResponses(id!, responses);
      setSubmittedCount((prev) => prev + 1);
      setStudentName('');
      setAnswers({});
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="animate-pulse text-gray-400">Loading session...</div>;
  if (error && !session) return <div className="text-red-600">{error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Manual Response Entry</h2>
          <p className="text-gray-500">{session?.title} &middot; {session?.topic}</p>
        </div>
        <button
          onClick={() => navigate(`/report/${id}`)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
        >
          View Report
        </button>
      </div>

      {submittedCount > 0 && (
        <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {submittedCount} student response set(s) submitted successfully.
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Student Name</label>
          <input
            type="text"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder="Enter student name"
            className="w-full max-w-sm px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />
        </div>

        <div className="space-y-6">
          {session?.questions?.map((q: any, qi: number) => (
            <div key={q.id} className="border-b border-gray-100 pb-6 last:border-0">
              <div className="font-medium mb-3">
                <span className="text-indigo-600 mr-2">Q{qi + 1}.</span>
                <span dangerouslySetInnerHTML={{ __html: q.stem }} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {q.options.map((opt: any, oi: number) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: opt.id }))}
                    className={`text-left px-4 py-3 rounded-lg border-2 text-sm transition-all ${
                      answers[q.id] === opt.id
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-800'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="font-semibold mr-2">{String.fromCharCode(65 + oi)}.</span>
                    {opt.text}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {submitting ? 'Submitting...' : 'Submit & Add Next Student'}
          </button>
        </div>
      </form>
    </div>
  );
}
