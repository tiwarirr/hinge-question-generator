import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { api } from '../lib/api';

interface OptionData {
  text: string;
  isCorrect: boolean;
  misconception: string;
}

function RichTextEditor({
  value,
  onChange,
  placeholder,
  compact,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  compact?: boolean;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showEquationInput, setShowEquationInput] = useState(false);
  const [equationText, setEquationText] = useState('');
  const [equationMode, setEquationMode] = useState<'inline' | 'block'>('inline');

  const execCommand = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val);
    syncContent();
  };

  const syncContent = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInsertEquation = () => {
    if (!equationText.trim()) return;
    try {
      const html = katex.renderToString(equationText, {
        throwOnError: false,
        displayMode: equationMode === 'block',
      });
      const wrapper =
        equationMode === 'block'
          ? `<div class="katex-block" style="text-align:center;margin:4px 0">${html}</div>`
          : `<span class="katex-inline">${html}</span>`;
      editorRef.current?.focus();
      document.execCommand('insertHTML', false, wrapper);
      syncContent();
    } catch {
      alert('Invalid equation syntax');
    }
    setEquationText('');
    setShowEquationInput(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('Image must be under 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      editorRef.current?.focus();
      const img = `<img src="${reader.result}" style="max-width:100%;height:auto;border-radius:6px;margin:4px 0" />`;
      document.execCommand('insertHTML', false, img);
      syncContent();
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          editorRef.current?.focus();
          const img = `<img src="${reader.result}" style="max-width:100%;height:auto;border-radius:6px;margin:4px 0" />`;
          document.execCommand('insertHTML', false, img);
          syncContent();
        };
        reader.readAsDataURL(file);
        return;
      }
    }
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className={`bg-gray-50 border-b border-gray-300 px-2 py-1 flex flex-wrap gap-1 items-center ${compact ? 'text-xs' : ''}`}>
        <button
          type="button"
          onClick={() => execCommand('bold')}
          className="px-1.5 py-0.5 font-bold rounded hover:bg-gray-200"
          title="Bold"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => execCommand('italic')}
          className="px-1.5 py-0.5 italic rounded hover:bg-gray-200"
          title="Italic"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => execCommand('underline')}
          className="px-1.5 py-0.5 underline rounded hover:bg-gray-200"
          title="Underline"
        >
          U
        </button>
        <div className="w-px h-4 bg-gray-300 mx-0.5" />
        <button
          type="button"
          onClick={() => setShowEquationInput(!showEquationInput)}
          className="px-1.5 py-0.5 rounded hover:bg-gray-200 font-mono"
          title="Insert equation"
        >
          &#119975;
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="px-1.5 py-0.5 rounded hover:bg-gray-200"
          title="Insert image"
        >
          &#128247;
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>

      {/* Equation Input */}
      {showEquationInput && (
        <div className="bg-indigo-50 border-b border-indigo-200 p-2 space-y-1">
          <div className="flex items-center gap-1">
            <input
              type="text"
              value={equationText}
              onChange={(e) => setEquationText(e.target.value)}
              placeholder="LaTeX: x^2 + y^2 = r^2"
              className="flex-1 px-2 py-1 border border-indigo-300 rounded text-xs font-mono"
              onKeyDown={(e) => e.key === 'Enter' && handleInsertEquation()}
            />
            <select
              value={equationMode}
              onChange={(e) => setEquationMode(e.target.value as 'inline' | 'block')}
              className="px-1 py-1 border border-indigo-300 rounded text-xs"
            >
              <option value="inline">Inline</option>
              <option value="block">Block</option>
            </select>
            <button
              type="button"
              onClick={handleInsertEquation}
              className="px-2 py-1 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700"
            >
              Insert
            </button>
          </div>
          {equationText && (
            <div className="bg-white p-1.5 rounded border border-indigo-200 text-xs">
              <span
                dangerouslySetInnerHTML={{
                  __html: katex.renderToString(equationText, {
                    throwOnError: false,
                    displayMode: equationMode === 'block',
                  }),
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        className={`px-3 focus:outline-none ${compact ? 'py-1.5 min-h-[36px] text-sm' : 'py-2 min-h-[80px]'}`}
        onInput={syncContent}
        onBlur={syncContent}
        onPaste={handlePaste}
        data-placeholder={placeholder || 'Type here...'}
        suppressContentEditableWarning
      />
    </div>
  );
}

export default function CreateQuestionManual() {
  const navigate = useNavigate();
  const [topic, setTopic] = useState('');
  const [subtopic, setSubtopic] = useState('');
  const [stemHtml, setStemHtml] = useState('');
  const [options, setOptions] = useState<OptionData[]>([
    { text: '', isCorrect: true, misconception: '' },
    { text: '', isCorrect: false, misconception: '' },
    { text: '', isCorrect: false, misconception: '' },
    { text: '', isCorrect: false, misconception: '' },
  ]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(false);
  const [allQuestions, setAllQuestions] = useState<any[]>([]);

  const updateOption = (index: number, updates: Partial<OptionData>) => {
    setOptions((prev) => prev.map((opt, i) => (i === index ? { ...opt, ...updates } : opt)));
  };

  const setCorrectOption = (index: number) => {
    setOptions((prev) =>
      prev.map((opt, i) => ({
        ...opt,
        isCorrect: i === index,
        misconception: i === index ? '' : opt.misconception,
      }))
    );
  };

  const hasContent = (html: string) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return (div.textContent || '').trim().length > 0;
  };

  const addToBatch = () => {
    if (!hasContent(stemHtml)) {
      setError('Question text is required');
      return;
    }
    const emptyOption = options.find((o) => !hasContent(o.text));
    if (emptyOption) {
      setError('All 4 options must have text');
      return;
    }
    const correctCount = options.filter((o) => o.isCorrect).length;
    if (correctCount !== 1) {
      setError('Exactly one option must be marked as correct');
      return;
    }

    setAllQuestions((prev) => [
      ...prev,
      {
        stem: stemHtml,
        options: options.map((o) => ({
          text: o.text,
          isCorrect: o.isCorrect,
          misconception: o.isCorrect ? null : o.misconception || null,
        })),
      },
    ]);

    setStemHtml('');
    setOptions([
      { text: '', isCorrect: true, misconception: '' },
      { text: '', isCorrect: false, misconception: '' },
      { text: '', isCorrect: false, misconception: '' },
      { text: '', isCorrect: false, misconception: '' },
    ]);
    setError('');
  };

  const removeFromBatch = (index: number) => {
    setAllQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveAll = async () => {
    if (allQuestions.length === 0) {
      setError('Add at least one question first');
      return;
    }
    if (!topic.trim()) {
      setError('Topic is required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await api.saveQuestions(topic, subtopic || undefined, allQuestions);
      navigate('/questions');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Create Question Manually</h2>

      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>
      )}

      {/* Topic */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Topic *</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Algebra, Photosynthesis"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subtopic</label>
            <input
              type="text"
              value={subtopic}
              onChange={(e) => setSubtopic(e.target.value)}
              placeholder="e.g., Quadratic equations"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Question Editor */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h3 className="font-semibold text-lg mb-4">Question</h3>

        {/* Stem */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Question Stem
          </label>
          <RichTextEditor
            value={stemHtml}
            onChange={setStemHtml}
            placeholder="Type your question here... Use toolbar for equations and images"
          />
        </div>

        {/* Options */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-3">Answer Options</label>
          <div className="space-y-3">
            {options.map((opt, i) => (
              <div
                key={i}
                className={`rounded-lg border-2 overflow-hidden ${
                  opt.isCorrect
                    ? 'border-green-400'
                    : 'border-gray-200'
                }`}
              >
                {/* Header bar */}
                <div className={`flex items-center gap-2 px-3 py-2 ${opt.isCorrect ? 'bg-green-50' : 'bg-gray-50'}`}>
                  <button
                    type="button"
                    onClick={() => setCorrectOption(i)}
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      opt.isCorrect
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                    }`}
                  >
                    {String.fromCharCode(65 + i)}
                  </button>
                  <span className="text-xs text-gray-500 flex-1">
                    {opt.isCorrect ? 'Correct Answer' : `Distractor ${String.fromCharCode(65 + i)}`}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    opt.isCorrect ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {opt.isCorrect ? 'Correct' : 'Distractor'}
                  </span>
                </div>

                {/* Rich text editor for option */}
                <div className="border-t border-gray-200">
                  <RichTextEditor
                    value={opt.text}
                    onChange={(val) => updateOption(i, { text: val })}
                    placeholder={`Option ${String.fromCharCode(65 + i)} — type text, add equations, or paste images`}
                    compact
                  />
                </div>

                {/* Misconception field for distractors */}
                {!opt.isCorrect && (
                  <div className="border-t border-gray-200 px-3 py-2 bg-red-50">
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-red-600 whitespace-nowrap font-medium">Misconception:</label>
                      <input
                        type="text"
                        value={opt.misconception}
                        onChange={(e) => updateOption(i, { misconception: e.target.value })}
                        placeholder="What misconception does this distractor reveal?"
                        className="flex-1 px-2 py-1 border border-red-200 rounded text-xs bg-white focus:ring-1 focus:ring-red-300 focus:border-red-300 outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">Click a letter to mark that option as correct. Each option supports equations and images.</p>
        </div>

        {/* Preview */}
        {hasContent(stemHtml) && (
          <div className="mb-4">
            <button
              type="button"
              onClick={() => setPreview(!preview)}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium mb-2"
            >
              {preview ? 'Hide Preview' : 'Show Preview'}
            </button>
            {preview && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div
                  className="font-medium mb-3"
                  dangerouslySetInnerHTML={{ __html: stemHtml }}
                />
                <div className="space-y-2">
                  {options.map((opt, i) => (
                    <div
                      key={i}
                      className={`text-sm px-3 py-2 rounded ${
                        opt.isCorrect ? 'bg-green-100 border border-green-200' : 'bg-white border border-gray-200'
                      }`}
                    >
                      <span className="font-semibold">{String.fromCharCode(65 + i)}.</span>{' '}
                      <span dangerouslySetInnerHTML={{ __html: opt.text || '<em>(empty)</em>' }} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={addToBatch}
          className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          + Add This Question
        </button>
      </div>

      {/* Batch List */}
      {allQuestions.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">
              Questions to Save ({allQuestions.length})
            </h3>
            <button
              onClick={handleSaveAll}
              disabled={saving}
              className="px-6 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Saving...' : 'Save All to My Questions'}
            </button>
          </div>

          <div className="space-y-3">
            {allQuestions.map((q, qi) => (
              <div
                key={qi}
                className="border border-gray-200 rounded-lg p-4 flex justify-between items-start"
              >
                <div className="flex-1">
                  <p className="text-xs text-gray-400 mb-1">Question {qi + 1}</p>
                  <div
                    className="font-medium text-sm mb-2"
                    dangerouslySetInnerHTML={{ __html: q.stem }}
                  />
                  <div className="space-y-1">
                    {q.options.map((opt: any, oi: number) => (
                      <div key={oi} className="flex items-center gap-1 text-xs">
                        <span className={`font-semibold ${opt.isCorrect ? 'text-green-600' : 'text-gray-500'}`}>
                          {String.fromCharCode(65 + oi)}.
                        </span>
                        <span
                          className={opt.isCorrect ? 'text-green-700' : 'text-gray-600'}
                          dangerouslySetInnerHTML={{ __html: opt.text }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => removeFromBatch(qi)}
                  className="text-gray-400 hover:text-red-500 text-sm ml-3"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
