import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

export default function ManageQuestions() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const data = await api.getQuestions(filter || undefined);
      setQuestions(data.questions);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, [filter]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this question?')) return;
    await api.deleteQuestion(id);
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const startEdit = (q: any) => {
    setEditingId(q.id);
    setEditData({
      stem: q.stem,
      topic: q.topic,
      subtopic: q.subtopic || '',
      options: q.options.map((opt: any) => ({
        id: opt.id,
        text: opt.text,
        isCorrect: opt.isCorrect,
        misconception: opt.misconception || '',
      })),
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData(null);
  };

  const updateEditOption = (index: number, updates: any) => {
    setEditData((prev: any) => ({
      ...prev,
      options: prev.options.map((opt: any, i: number) =>
        i === index ? { ...opt, ...updates } : opt
      ),
    }));
  };

  const handleSave = async () => {
    if (!editingId || !editData) return;
    setSaving(true);
    try {
      await api.updateQuestion(editingId, {
        stem: editData.stem,
        topic: editData.topic,
        subtopic: editData.subtopic || undefined,
        options: editData.options.map((opt: any) => ({
          text: opt.text,
          isCorrect: opt.isCorrect,
          misconception: opt.misconception || null,
        })),
      });
      setEditingId(null);
      setEditData(null);
      loadQuestions();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const topics = [...new Set(questions.map((q) => q.topic))];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">My Questions</h2>
        <Link
          to="/session/new"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          Create Quiz Session
        </Link>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setFilter('')}
          className={`px-3 py-1.5 rounded-full text-sm ${
            !filter ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        {topics.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-3 py-1.5 rounded-full text-sm ${
              filter === t ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="animate-pulse text-gray-400">Loading questions...</div>
      ) : questions.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="mb-2">No questions yet.</p>
          <Link to="/generate" className="text-indigo-600 hover:text-indigo-700 font-medium">
            Generate your first questions
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((q) => {
            const isEditing = editingId === q.id;

            return (
              <div key={q.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.topic}
                        onChange={(e) => setEditData((prev: any) => ({ ...prev, topic: e.target.value }))}
                        className="bg-transparent outline-none w-32"
                      />
                    ) : (
                      <>{q.topic}{q.subtopic ? ` / ${q.subtopic}` : ''}</>
                    )}
                  </span>
                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <button
                          onClick={handleSave}
                          disabled={saving}
                          className="text-green-600 hover:text-green-700 text-sm font-medium"
                        >
                          {saving ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="text-gray-400 hover:text-gray-600 text-sm"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(q)}
                          className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(q.id)}
                          className="text-gray-400 hover:text-red-500 text-sm"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Stem */}
                {isEditing ? (
                  <div className="mb-3">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Question</label>
                    <textarea
                      value={editData.stem}
                      onChange={(e) => setEditData((prev: any) => ({ ...prev, stem: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      rows={2}
                    />
                  </div>
                ) : (
                  <div className="font-medium mb-3" dangerouslySetInnerHTML={{ __html: q.stem }} />
                )}

                {/* Options */}
                <div className="grid grid-cols-2 gap-2">
                  {(isEditing ? editData.options : q.options).map((opt: any, i: number) => (
                    <div
                      key={opt.id || i}
                      className={`text-sm px-3 py-2 rounded-lg ${
                        opt.isCorrect
                          ? 'bg-green-50 text-green-800 border border-green-200'
                          : 'bg-gray-50 text-gray-600 border border-gray-200'
                      }`}
                    >
                      {isEditing ? (
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{String.fromCharCode(65 + i)}.</span>
                            <input
                              type="text"
                              value={opt.text}
                              onChange={(e) => updateEditOption(i, { text: e.target.value })}
                              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm bg-white"
                            />
                            <span className={`text-xs px-1.5 py-0.5 rounded-full whitespace-nowrap ${
                              opt.isCorrect ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                            }`}>
                              {opt.isCorrect ? 'Correct' : 'Distractor'}
                            </span>
                          </div>
                          {!opt.isCorrect && (
                            <div className="flex items-center gap-2 ml-5">
                              <label className="text-xs text-red-500 whitespace-nowrap">Misconception:</label>
                              <input
                                type="text"
                                value={opt.misconception || ''}
                                onChange={(e) => updateEditOption(i, { misconception: e.target.value })}
                                className="flex-1 px-2 py-1 border border-red-300 rounded text-xs bg-white"
                                placeholder="What does this wrong answer reveal?"
                              />
                            </div>
                          )}
                        </div>
                      ) : (
                        <>
                          <span className="font-semibold">{String.fromCharCode(65 + i)}.</span> {opt.text}
                          {opt.misconception && (
                            <span className="block text-xs text-red-500 mt-0.5">({opt.misconception})</span>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
