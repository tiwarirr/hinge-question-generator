import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

interface GeneratedOption {
  text: string;
  isCorrect: boolean;
  misconception: string | null;
}

interface GeneratedQuestion {
  stem: string;
  options: GeneratedOption[];
  editing?: boolean;
}

export default function GenerateQuestions() {
  const navigate = useNavigate();
  const [topic, setTopic] = useState('');
  const [subtopic, setSubtopic] = useState('');
  const [count, setCount] = useState(5);
  const [grade, setGrade] = useState('middle school');
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setGenerating(true);
    try {
      const data = await api.generateQuestions(topic, subtopic || undefined, count, grade);
      setQuestions(data.questions);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.saveQuestions(topic, subtopic || undefined, questions);
      navigate('/questions');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const updateQuestion = (index: number, updates: Partial<GeneratedQuestion>) => {
    setQuestions((prev) => prev.map((q, i) => (i === index ? { ...q, ...updates } : q)));
  };

  const updateOption = (qi: number, oi: number, updates: Partial<GeneratedOption>) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qi) return q;
        return {
          ...q,
          options: q.options.map((opt, j) => (j === oi ? { ...opt, ...updates } : opt)),
        };
      })
    );
  };

  const removeQuestion = (index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Generate Hinge Questions</h2>

      {/* Input Form */}
      <form onSubmit={handleGenerate} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Topic *</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Photosynthesis, Fractions, World War II"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subtopic (optional)</label>
            <input
              type="text"
              value={subtopic}
              onChange={(e) => setSubtopic(e.target.value)}
              placeholder="e.g., Light reactions, Equivalent fractions"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Number of Questions</label>
            <input
              type="number"
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              min={1}
              max={10}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Grade Level</label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            >
              <option value="elementary">Elementary (K-5)</option>
              <option value="middle school">Middle School (6-8)</option>
              <option value="high school">High School (9-12)</option>
              <option value="college">College</option>
            </select>
          </div>
        </div>
        <button
          type="submit"
          disabled={generating || !topic}
          className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {generating ? 'Generating with AI...' : 'Generate Questions'}
        </button>
      </form>

      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>
      )}

      {/* Generated Questions */}
      {questions.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Generated Questions ({questions.length})</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setQuestions([])}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg"
              >
                Clear
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {saving ? 'Saving...' : 'Save All to My Questions'}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {questions.map((q, qi) => (
              <div key={qi} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                    Question {qi + 1}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateQuestion(qi, { editing: !q.editing })}
                      className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      {q.editing ? 'Done' : 'Edit'}
                    </button>
                    <button
                      onClick={() => removeQuestion(qi)}
                      className="text-xs text-gray-400 hover:text-red-500"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                {/* Question Stem */}
                {q.editing ? (
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Question</label>
                    <textarea
                      value={q.stem}
                      onChange={(e) => updateQuestion(qi, { stem: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      rows={2}
                    />
                  </div>
                ) : (
                  <p className="font-medium mb-4 text-gray-900">{q.stem}</p>
                )}

                {/* Options */}
                <div className="space-y-2">
                  {q.options.map((opt, oi) => (
                    <div
                      key={oi}
                      className={`px-4 py-3 rounded-lg text-sm ${
                        opt.isCorrect
                          ? 'bg-green-50 border border-green-200'
                          : 'bg-red-50 border border-red-200'
                      }`}
                    >
                      {q.editing ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-600 w-6">
                              {String.fromCharCode(65 + oi)}.
                            </span>
                            <input
                              type="text"
                              value={opt.text}
                              onChange={(e) => updateOption(qi, oi, { text: e.target.value })}
                              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                              placeholder="Option text"
                            />
                            <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${
                              opt.isCorrect ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                            }`}>
                              {opt.isCorrect ? 'Correct' : 'Distractor'}
                            </span>
                          </div>
                          {!opt.isCorrect && (
                            <div className="flex items-center gap-2 ml-6">
                              <label className="text-xs text-red-600 whitespace-nowrap">Misconception:</label>
                              <input
                                type="text"
                                value={opt.misconception || ''}
                                onChange={(e) => updateOption(qi, oi, { misconception: e.target.value })}
                                className="flex-1 px-2 py-1 border border-red-300 rounded text-xs"
                                placeholder="What misconception does this distractor reveal?"
                              />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-start gap-3">
                          <span className="font-semibold mt-0.5">
                            {String.fromCharCode(65 + oi)}.
                          </span>
                          <div className="flex-1">
                            <p className={opt.isCorrect ? 'text-green-800 font-medium' : 'text-gray-800'}>
                              {opt.text}
                            </p>
                            {opt.misconception && (
                              <p className="text-xs text-red-600 mt-1">
                                Misconception: {opt.misconception}
                              </p>
                            )}
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full mt-0.5 whitespace-nowrap ${
                            opt.isCorrect ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                          }`}>
                            {opt.isCorrect ? 'Correct' : 'Distractor'}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
