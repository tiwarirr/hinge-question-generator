import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../lib/api';

export default function StudentView() {
  const { code } = useParams<{ code: string }>();
  const [session, setSession] = useState<any>(null);
  const [studentName, setStudentName] = useState('');
  const [joined, setJoined] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!code) {
      setError('No session code provided');
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(`/api/sessions/code/${code}`)
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Session not found');
        }
        return res.json();
      })
      .then((data) => {
        setSession(data.session);
        setError('');
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [code]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) return;
    setJoined(true);
  };

  const handleAnswer = async (optionId: string) => {
    if (submitting || !session) return;
    const question = session.questions[currentQ];
    setSubmitting(true);
    try {
      await api.submitResponse(session.id, question.id, optionId, studentName);
      if (currentQ < session.questions.length - 1) {
        setCurrentQ((prev) => prev + 1);
      } else {
        setSubmitted(true);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-3"></div>
          <p className="text-gray-500">Loading session...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <div className="text-red-500 text-4xl mb-4">&#9888;</div>
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
          <p className="text-sm text-gray-400 mt-4">Code: {code}</p>
        </div>
      </div>
    );
  }

  // No session
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <h2 className="text-xl font-bold mb-2">Session Not Found</h2>
          <p className="text-gray-600">No session found with code: {code}</p>
        </div>
      </div>
    );
  }

  // Session closed
  if (session.status === 'closed') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <div className="text-gray-400 text-4xl mb-4">&#128274;</div>
          <h2 className="text-xl font-bold mb-2">Session Closed</h2>
          <p className="text-gray-600">This quiz session is no longer accepting responses.</p>
          <p className="text-sm text-gray-400 mt-4">Code: {code}</p>
        </div>
      </div>
    );
  }

  // Submitted state
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <div className="text-green-500 text-5xl mb-4">&#10003;</div>
          <h2 className="text-2xl font-bold mb-2">All Done!</h2>
          <p className="text-gray-500">Thank you, {studentName}! Your responses have been recorded.</p>
        </div>
      </div>
    );
  }

  // Join form
  if (!joined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-center mb-2">{session.title}</h1>
          <p className="text-gray-500 text-center mb-6">Topic: {session.topic}</p>
          <p className="text-sm text-gray-400 text-center mb-4">
            {session.questions.length} question{session.questions.length !== 1 ? 's' : ''}
          </p>
          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              Join &amp; Start
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Questions view
  const question = session.questions[currentQ];
  if (!question) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-red-500">No questions found in this session.</p>
      </div>
    );
  }

  const totalQ = session.questions.length;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm p-4">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div>
            <p className="font-semibold">{session.title}</p>
            <p className="text-sm text-gray-500">{studentName}</p>
          </div>
          <p className="text-sm text-gray-500">
            Question {currentQ + 1} of {totalQ}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-gray-200 h-1">
        <div
          className="bg-indigo-600 h-1 transition-all"
          style={{ width: `${((currentQ + 1) / totalQ) * 100}%` }}
        />
      </div>

      {/* Question */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl w-full">
          <div className="text-lg font-medium mb-6" dangerouslySetInnerHTML={{ __html: question.stem }} />
          <div className="space-y-3">
            {question.options.map((opt: any, i: number) => (
              <button
                key={opt.id}
                onClick={() => handleAnswer(opt.id)}
                disabled={submitting}
                className="w-full text-left px-5 py-4 rounded-lg border-2 border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all disabled:opacity-50 cursor-pointer"
              >
                <span className="font-semibold text-indigo-600 mr-3">{String.fromCharCode(65 + i)}.</span>
                {opt.text}
              </button>
            ))}
          </div>
          {submitting && <p className="text-center text-sm text-gray-400 mt-4">Submitting...</p>}
        </div>
      </div>
    </div>
  );
}
