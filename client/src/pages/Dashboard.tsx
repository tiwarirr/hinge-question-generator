import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

export default function Dashboard() {
  const [stats, setStats] = useState({ questions: 0, sessions: 0 });
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    Promise.all([api.getQuestions(), api.getSessions()])
      .then(([q, s]) => {
        setStats({ questions: q.questions.length, sessions: s.sessions.length });
        setSessions(s.sessions.slice(0, 5));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleClose = async (sessionId: string) => {
    if (!confirm('Close this session? Students will no longer be able to submit responses.')) return;
    try {
      await api.closeSession(sessionId);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <div className="animate-pulse text-gray-400">Loading dashboard...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <p className="text-sm text-gray-500">Total Questions</p>
          <p className="text-3xl font-bold text-indigo-600 mt-1">{stats.questions}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <p className="text-sm text-gray-500">Quiz Sessions</p>
          <p className="text-3xl font-bold text-indigo-600 mt-1">{stats.sessions}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <p className="text-sm text-gray-500">Quick Action</p>
          <Link
            to="/generate"
            className="inline-block mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            Generate New Questions
          </Link>
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-semibold text-lg">Recent Sessions</h3>
          <Link to="/session/new" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
            + New Session
          </Link>
        </div>
        {sessions.length === 0 ? (
          <p className="p-6 text-gray-400 text-sm">No sessions yet. Generate questions and create a session to get started.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {sessions.map((s) => (
              <div key={s.id} className="p-4 px-6 flex justify-between items-center">
                <div>
                  <p className="font-medium">{s.title}</p>
                  <p className="text-sm text-gray-500">{s.topic} &middot; Code: <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">{s.code}</span></p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${s.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {s.status}
                  </span>
                  {s.status === 'active' && (
                    <button
                      onClick={() => handleClose(s.id)}
                      className="text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      Close
                    </button>
                  )}
                  <Link
                    to={`/report/${s.id}`}
                    className="text-sm text-indigo-600 hover:text-indigo-700"
                  >
                    Report
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
