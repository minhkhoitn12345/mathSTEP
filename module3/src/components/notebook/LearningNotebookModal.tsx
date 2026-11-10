/**
 * MathSTEP Module 3: Lượng Giác
 * Learning Notebook & Local Management Modal (UI06 & Section 10)
 * Includes:
 * 1. Sổ học tập cá nhân (Personal Learning Journal & Error Analysis)
 * 2. Ngân hàng câu hỏi (Content Bank Manager, Add/Edit/Delete, CSV/JSON Import/Export with UTF-8 BOM)
 * 3. Quản lý hồ sơ & Lớp học (Profile & Class Manager)
 * 4. Chế độ in ấn sạch (Clean Print layout)
 */

import React, { useState } from 'react';
import { AttemptLog, ErrorCode, QuestionItem, UserProfile } from '../../types/math';
import { ERROR_CATALOG } from '../../data/contentBank';

interface LearningNotebookModalProps {
  attempts: AttemptLog[];
  profiles: UserProfile[];
  activeProfile: UserProfile;
  onSelectProfile: (p: UserProfile) => void;
  onAddProfile: (p: UserProfile) => void;
  questions: QuestionItem[];
  onAddQuestion: (q: QuestionItem) => void;
  onDeleteQuestion: (id: string) => void;
  onExportAllData: () => void;
  onImportData: (jsonStr: string) => void;
  onClose: () => void;
}

export const LearningNotebookModal: React.FC<LearningNotebookModalProps> = ({
  attempts,
  profiles,
  activeProfile,
  onSelectProfile,
  onAddProfile,
  questions,
  onAddQuestion,
  onDeleteQuestion,
  onExportAllData,
  onImportData,
  onClose,
}) => {
  const [tab, setTab] = useState<'notebook' | 'questions' | 'profiles' | 'analytics'>('notebook');
  const [searchQ, setSearchQ] = useState('');
  const [selectedActivityFilter, setSelectedActivityFilter] = useState<string>('all');

  // New Profile Form
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileClass, setNewProfileClass] = useState('10 Chuyên Toán T01');
  const [newProfileCode, setNewProfileCode] = useState('');

  // New Question Form State
  const [isAddingQ, setIsAddingQ] = useState(false);
  const [newQTitle, setNewQTitle] = useState('');
  const [newQStatement, setNewQStatement] = useState('');
  const [newQActId, setNewQActId] = useState('LG01');
  const [newQSolution, setNewQSolution] = useState('');

  // Calculate error code distribution
  const errorCounts: Record<ErrorCode, number> = {
    E01: 0, E02: 0, E03: 0, E04: 0, E05: 0, E06: 0, E07: 0, E08: 0,
    E09: 0, E10: 0, E11: 0, E12: 0, E13: 0, E14: 0, E15: 0, E16: 0,
  };

  attempts.forEach((att) => {
    att.checkResult?.identifiedErrors.forEach((err) => {
      if (err in errorCounts) {
        errorCounts[err]++;
      }
    });
  });

  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileName.trim()) return;
    const p: UserProfile = {
      id: `p-${Date.now()}`,
      name: newProfileName.trim(),
      studentCode: newProfileCode.trim() || `HS-${Math.floor(1000 + Math.random() * 9000)}`,
      className: newProfileClass.trim(),
      role: 'student',
    };
    onAddProfile(p);
    setNewProfileName('');
    setNewProfileCode('');
  };

  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQTitle.trim() || !newQStatement.trim()) return;
    const q: QuestionItem = {
      id: `q-custom-${Date.now()}`,
      version: 1,
      activityId: newQActId as any,
      title: newQTitle.trim(),
      statement: newQStatement.trim(),
      type: 'multiple_choice',
      solution: newQSolution.trim() || 'Lời giải chuẩn từ giáo viên.',
      errorCodes: [],
      hints: [
        { level: 'H1', title: 'Gợi mở', content: 'Hãy xem lại định nghĩa và vẽ hình minh họa.' },
      ],
      source: 'Giáo viên tự biên soạn',
      reviewStatus: 'draft',
    };
    onAddQuestion(q);
    setIsAddingQ(false);
    setNewQTitle('');
    setNewQStatement('');
    setNewQSolution('');
  };

  const downloadSampleCSV = () => {
    const csvContent =
      '\uFEFF' +
      'ID,ActivityId,Title,Statement,Solution,Source\n' +
      'q-sample-01,LG01,"Tách góc 390°","Biểu diễn góc lượng giác 390° trên đường tròn đơn vị","390° = 360° + 30°","SGK Toán 10"\n' +
      'q-sample-02,LG04,"Góc đối -45°","Tính cos(-45°) và sin(-45°)","cos(-45°) = √2/2, sin(-45°) = -√2/2","SGK Toán 10"\n';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'MathSTEP_Sample_Questions.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onImportData(content);
      }
    };
    reader.readAsText(file);
  };

  const filteredQuestions = questions.filter((q) => {
    const matchAct = selectedActivityFilter === 'all' || q.activityId === selectedActivityFilter;
    const matchSearch =
      q.title.toLowerCase().includes(searchQ.toLowerCase()) ||
      q.statement.toLowerCase().includes(searchQ.toLowerCase());
    return matchAct && matchSearch;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-850">
          <div className="flex items-center gap-2">
            <span className="text-xl">📚</span>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Sổ Học Tập & Quản Lý Dữ Liệu MathSTEP
              </h2>
              <div className="text-xs text-slate-500 font-mono">
                Hồ sơ: <span className="font-semibold text-blue-600">{activeProfile.name}</span> ({activeProfile.className})
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1"
            >
              <span>🖨️</span> In sổ học tập
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="flex items-center gap-1 p-2 bg-slate-100/60 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs font-medium">
          <button
            onClick={() => setTab('notebook')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              tab === 'notebook'
                ? 'bg-blue-600 text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Sổ ghi nhận ({attempts.length})
          </button>
          <button
            onClick={() => setTab('analytics')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              tab === 'analytics'
                ? 'bg-blue-600 text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Thống kê lỗi sai (E01-E16)
          </button>
          <button
            onClick={() => setTab('questions')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              tab === 'questions'
                ? 'bg-blue-600 text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Ngân hàng câu hỏi ({questions.length})
          </button>
          <button
            onClick={() => setTab('profiles')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              tab === 'profiles'
                ? 'bg-blue-600 text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Hồ sơ học sinh ({profiles.length})
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* TAB 1: SỔ GHI NHẬN HỌC TẬP */}
          {tab === 'notebook' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Lịch sử các phiên học 8 bước của {activeProfile.name}:
                </span>
                <button
                  onClick={onExportAllData}
                  className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 rounded-md font-medium"
                >
                  Sao lưu JSON
                </button>
              </div>

              {attempts.length === 0 ? (
                <div className="p-8 text-center text-slate-400 italic bg-slate-50 dark:bg-slate-850 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                  Chưa có lượt học nào được lưu. Hãy hoàn thành 8 bước ở bảng nhiệm vụ và bấm &quot;Lưu vào Sổ Học Tập&quot;.
                </div>
              ) : (
                attempts.map((att, i) => (
                  <div
                    key={att.id || i}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/40 space-y-2.5"
                  >
                    <div className="flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 font-bold">
                          {att.activityId}
                        </span>
                        <span className="font-sans font-semibold text-slate-800 dark:text-slate-200">
                          {att.mode === 'assessment' ? 'Tự kiểm tra độc lập' : 'Học có hướng dẫn'}
                        </span>
                      </div>
                      <span className="text-slate-400">
                        {new Date(att.timestamp).toLocaleString('vi-VN')}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <span className="font-semibold text-slate-500 block mb-1">Dự đoán ban đầu:</span>
                        <p className="text-slate-800 dark:text-slate-200">{att.prediction || '(Chưa nhập)'}</p>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <span className="font-semibold text-slate-500 block mb-1">Ghi nhận quan sát:</span>
                        <p className="text-slate-800 dark:text-slate-200">{att.observation || '(Chưa nhập)'}</p>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <span className="font-semibold text-slate-500 block mb-1">Tự giải thích căn cứ toán học:</span>
                      <p className="text-slate-800 dark:text-slate-200">{att.explanation || '(Chưa nhập)'}</p>
                    </div>

                    {att.checkResult && (
                      <div className="text-[11px] flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-700">
                        <span className="text-slate-500">
                          Kết quả kiểm chứng: <strong>{att.checkResult.status === 'correct' ? 'Đúng' : 'Có lỗi'}</strong>
                        </span>
                        <span className="text-slate-500 font-mono">
                          Gợi ý đã dùng: {att.hintsUsed.length > 0 ? att.hintsUsed.join(', ') : 'H0 (Tự làm)'}
                        </span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: THỐNG KÊ LỖI SAI (E01 - E16) */}
          {tab === 'analytics' && (
            <div className="space-y-4">
              <div className="font-semibold text-slate-800 dark:text-slate-200">
                Bảng phân bố tần suất lỗi sai thường gặp (E01 - E16):
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {(Object.keys(ERROR_CATALOG) as ErrorCode[]).map((code) => {
                  const meta = ERROR_CATALOG[code];
                  const count = errorCounts[code];
                  return (
                    <div
                      key={code}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 flex items-start justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-100">
                          <span className="font-mono text-rose-600">{code}</span>
                          <span>{meta.title}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{meta.evidence}</p>
                        <div className="mt-1 text-[11px] text-blue-600 dark:text-blue-400 italic">
                          💡 Gợi ý: {meta.socraticQuestion}
                        </div>
                      </div>
                      <span
                        className={`font-mono font-bold text-sm px-2 py-0.5 rounded-full ${
                          count > 0 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: NGÂN HÀNG CÂU HỎI */}
          {tab === 'questions' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={searchQ}
                    onChange={(e) => setSearchQ(e.target.value)}
                    placeholder="Tìm kiếm câu hỏi..."
                    className="p-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs w-48 font-mono outline-none"
                  />
                  <select
                    value={selectedActivityFilter}
                    onChange={(e) => setSelectedActivityFilter(e.target.value)}
                    className="p-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs"
                  >
                    <option value="all">Tất cả hoạt động (LG01 - LG13)</option>
                    {['LG01', 'LG02', 'LG03', 'LG04', 'LG05', 'LG06', 'LG07', 'LG08', 'LG09', 'LG10', 'LG11', 'LG12', 'LG13'].map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={downloadSampleCSV}
                    className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium"
                    title="Tải tệp mẫu CSV có UTF-8 BOM"
                  >
                    Tải mẫu CSV
                  </button>
                  <label className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium cursor-pointer">
                    Nhập CSV/JSON
                    <input type="file" accept=".csv,.json" onChange={handleFileUpload} className="hidden" />
                  </label>
                  <button
                    onClick={() => setIsAddingQ(!isAddingQ)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
                  >
                    {isAddingQ ? 'Đóng form' : '+ Thêm câu hỏi mới'}
                  </button>
                </div>
              </div>

              {/* Add Question Inline Form */}
              {isAddingQ && (
                <form onSubmit={handleCreateQuestion} className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 dark:bg-blue-950/20 space-y-3">
                  <div className="font-bold text-blue-900 dark:text-blue-100">Thêm câu hỏi mới vào kho dữ liệu</div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={newQTitle}
                      onChange={(e) => setNewQTitle(e.target.value)}
                      placeholder="Tiêu đề câu hỏi..."
                      className="p-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800"
                    />
                    <select
                      value={newQActId}
                      onChange={(e) => setNewQActId(e.target.value)}
                      className="p-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800"
                    >
                      {['LG01', 'LG02', 'LG03', 'LG04', 'LG05', 'LG06', 'LG07', 'LG08', 'LG09', 'LG10', 'LG11', 'LG12', 'LG13'].map((a) => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </select>
                  </div>
                  <textarea
                    value={newQStatement}
                    onChange={(e) => setNewQStatement(e.target.value)}
                    placeholder="Nội dung đề bài toán..."
                    className="w-full h-16 p-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800"
                  />
                  <input
                    type="text"
                    value={newQSolution}
                    onChange={(e) => setNewQSolution(e.target.value)}
                    placeholder="Lời giải chuẩn / căn cứ toán học..."
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingQ(false)}
                      className="px-3 py-1 text-slate-600 text-xs font-medium"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1 bg-blue-600 text-white rounded-lg text-xs font-semibold"
                    >
                      Lưu vào kho
                    </button>
                  </div>
                </form>
              )}

              {/* Questions list */}
              <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                {filteredQuestions.map((q) => (
                  <div
                    key={q.id}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-blue-600 font-bold">{q.activityId}</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-100">{q.title}</span>
                        <span className="text-[10px] text-slate-400">({q.source})</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400">{q.statement}</p>
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">
                        Lời giải: {q.solution}
                      </p>
                    </div>
                    <button
                      onClick={() => onDeleteQuestion(q.id)}
                      className="text-slate-400 hover:text-red-500 p-1"
                      title="Xóa câu hỏi"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: HỒ SƠ HỌC SINH */}
          {tab === 'profiles' && (
            <div className="space-y-4">
              <div className="font-semibold text-slate-800 dark:text-slate-200">
                Danh sách hồ sơ học sinh cục bộ (6 hồ sơ mẫu):
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {profiles.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => onSelectProfile(p)}
                    className={`p-3 rounded-xl border cursor-pointer transition-colors ${
                      activeProfile.id === p.id
                        ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-bold">{p.name}</div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700">
                        {p.studentCode}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Lớp: {p.className} · Vai trò: {p.role === 'teacher' ? 'Giáo viên' : 'Học sinh'}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Profile Form */}
              <form onSubmit={handleCreateProfile} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 space-y-2">
                <div className="font-semibold text-slate-800 dark:text-slate-200">Thêm hồ sơ học sinh mới:</div>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={newProfileName}
                    onChange={(e) => setNewProfileName(e.target.value)}
                    placeholder="Họ và tên học sinh..."
                    className="p-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800"
                  />
                  <input
                    type="text"
                    value={newProfileCode}
                    onChange={(e) => setNewProfileCode(e.target.value)}
                    placeholder="Mã HS (HS-10A1-XX)..."
                    className="p-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800"
                  />
                  <input
                    type="text"
                    value={newProfileClass}
                    onChange={(e) => setNewProfileClass(e.target.value)}
                    placeholder="Lớp học..."
                    className="p-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
                  >
                    + Tạo hồ sơ
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
