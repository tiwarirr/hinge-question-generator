import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

export default function CreateSession() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [questions, setQuestions] = useState<any[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [createdSession, setCreatedSession] = useState<any>(null);

  useEffect(() => {
    api.getQuestions().then((data) => {
      setQuestions(data.questions);
      const topics = [...new Set(data.questions.map((q: any) => q.topic))];
      if (topics.length === 1) setTopic(topics[0] as string);
      setLoading(false);
    });
  }, []);

  const toggleQuestion = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selected.size === 0) {
      setError('Select at least one question');
      return;
    }
    setError('');
    setCreating(true);
    try {
      const data = await api.createSession(title, topic, Array.from(selected));
      setCreatedSession(data.session);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <div className="animate-pulse text-gray-400">Loading questions...</div>;

  if (createdSession) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-2xl font-bold mb-2">Session Created!</h2>
          <p className="text-gray-500 mb-6">Share this code with your students:</p>
          <div className="text-5xl font-mono font-bold text-indigo-600 tracking-wider mb-6">
            {createdSession.code}
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Students can join at: <span className="font-mono text-indigo-600">/join/{createdSession.code}</span>
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => {
                navigator.clipboard.writeText(createdSession.code);
                alert('Code copied!');
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
            >
              Copy Code
            </button>
            <button
              onClick={() => navigate(`/report/${createdSession.id}`)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
            >
              View Report
            </button>
            <button
              onClick={() => navigate(`/session/${createdSession.id}/manual`)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
            >
              Manual Entry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const topics = [...new Set(questions.map((q) => q.topic))];
  const filteredQuestions = topic ? questions.filter((q) => q.topic === topic) : questions;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Create Quiz Session</h2>

      <form onSubmit={handleCreate} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Session Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Photosynthesis Quiz - Period 3"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            >
              <option value="">All topics</option>
              {topics.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>
        )}

        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-2">
            Select questions ({selected.size} selected):
          </p>
          {filteredQuestions.length === 0 ? (
            <p className="text-gray-400 text-sm">No questions available. Generate some first.</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredQuestions.map((q) => (
                <label
                  key={q.id}
                  className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer border ${
                    selected.has(q.id)
                      ? 'border-indigo-300 bg-indigo-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selected.has(q.id)}
                    onChange={() => toggleQuestion(q.id)}
                    className="mt-1"
                  />
                  <div>
                    <p className="text-sm font-medium">{q.stem}</p>
                    <p className="text-xs text-gray-500">{q.topic}</p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={creating || selected.size === 0}
          className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {creating ? 'Creating...' : 'Create Session'}
        </button>
      </form>
    </div>
  );
}
