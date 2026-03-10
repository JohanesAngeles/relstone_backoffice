// pages/CourseContentPage.jsx
import { useState, useEffect } from 'react';
import AppLayout               from '../../layouts/AppLayout';
import {
  FiBook, FiPlus, FiSave, FiChevronDown, FiChevronRight,
  FiCheck, FiAlertCircle, FiEdit2, FiTrash2, FiX,
  FiClock, FiBold, FiItalic, FiUnderline as FiUnderlineIcon, FiList,
  FiUploadCloud, FiEye, FiEyeOff,
} from 'react-icons/fi';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit                   from '@tiptap/starter-kit';
import Underline                    from '@tiptap/extension-underline';
import TextAlign                    from '@tiptap/extension-text-align';

const API = import.meta.env.VITE_API_URL;

const COURSE_TEMPLATES = [
  { examName: 'Agency',                                              courseName: 'Agency',                                                       unlockHours: 48  },
  { examName: 'Ethics',                                              courseName: 'Ethics, Professional Conduct and Legal Aspects of Real Estate', unlockHours: 48  },
  { examName: 'Fair Housing',                                        courseName: 'Fair Housing',                                                  unlockHours: 48  },
  { examName: 'Trust Fund Handling',                                 courseName: 'Trust Fund Accounting and Handling',                            unlockHours: 48  },
  { examName: 'Risk Management',                                     courseName: 'Risk Management for Real Estate Professionals',                 unlockHours: 48  },
  { examName: 'Real Estate Management and Supervision',              courseName: 'Real Estate Management and Supervision',                       unlockHours: 48  },
  { examName: 'Implicit Bias',                                       courseName: 'Implicit Bias',                                                unlockHours: 48  },
  { examName: 'Selling Business Opportunities in California Part 1', courseName: 'Selling Business Opportunities in California - Part 1',        unlockHours: 96  },
  { examName: 'Selling Business Opportunities in California Part 2', courseName: 'Selling Business Opportunities in California - Part 2',        unlockHours: 144 },
  { examName: 'Mortgage Lending Part 1',                             courseName: 'Mortgage Lending - Part 1',                                   unlockHours: 96  },
  { examName: 'Mortgage Lending Part 2',                             courseName: 'Mortgage Lending - Part 2',                                   unlockHours: 144 },
];

const UNLOCK_LABEL = { 48: '2 days', 96: '4 days', 144: '6 days' };

const S = {
  root:        { display: 'flex', height: 'calc(100vh - 60px)', overflow: 'hidden', fontFamily: "'Poppins', sans-serif" },
  sidebar:     { width: 280, background: '#091925', display: 'flex', flexDirection: 'column', flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.06)' },
  sideHead:    { padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  sideTitle:   { display: 'flex', alignItems: 'center', gap: 8, color: '#fff', fontWeight: 600, fontSize: 13 },
  addBtn:      { background: '#2EABFE', border: 'none', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', color: '#fff', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, fontFamily: "'Poppins', sans-serif" },
  sideList:    { flex: 1, overflowY: 'auto', padding: '8px 0' },
  main:        { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#f0f4f8' },
  topBar:      { background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 },
  topTitle:    { margin: 0, fontSize: 17, fontWeight: 700, color: '#091925' },
  topSub:      { margin: '2px 0 0', fontSize: 12, color: '#64748b' },
  saveBtn:     { background: '#2EABFE', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 22px', fontWeight: 600, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'Poppins', sans-serif" },
  body:        { flex: 1, overflowY: 'auto', padding: 24 },
  card:        { background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #e2e8f0', marginBottom: 20 },
  cardTitle:   { margin: '0 0 16px', fontSize: 14, fontWeight: 600, color: '#091925', display: 'flex', alignItems: 'center', gap: 8 },
  label:       { fontSize: 11, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' },
  input:       { width: '100%', padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, fontFamily: "'Poppins', sans-serif", boxSizing: 'border-box', color: '#0f172a' },
  textarea:    { width: '100%', padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, fontFamily: "'Poppins', sans-serif", resize: 'vertical', boxSizing: 'border-box', color: '#0f172a' },
  emptyState:  { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8', gap: 12 },
  grid2:       { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 },
  quizRow:     { border: '1px solid #e2e8f0', borderRadius: 10, padding: 14, background: '#fafafa', marginBottom: 12 },
  qNum:        { fontSize: 12, fontWeight: 700, color: '#2EABFE', minWidth: 22 },
  answerBtn:   (active, isTrue) => ({
    padding: '4px 16px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer',
    fontFamily: "'Poppins', sans-serif",
    background: active ? (isTrue ? '#dcfce7' : '#fee2e2') : '#f1f5f9',
    color:      active ? (isTrue ? '#16a34a' : '#dc2626') : '#64748b',
    border:     active ? `1.5px solid ${isTrue ? '#16a34a' : '#dc2626'}` : '1.5px solid #e2e8f0',
  }),
  delBtn:      { background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 4 },
  toast:       (type) => ({
    position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
    background: type === 'success' ? '#16a34a' : '#dc2626',
    color: '#fff', borderRadius: 10, padding: '12px 20px', fontSize: 14,
    fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8,
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)', fontFamily: "'Poppins', sans-serif",
  }),
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal:        { background: '#fff', borderRadius: 16, padding: 24, width: 520, maxHeight: '80vh', overflowY: 'auto', fontFamily: "'Poppins', sans-serif" },
  modalHead:    { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  modalTitle:   { margin: 0, fontSize: 15, fontWeight: 700, color: '#091925' },
  templateBtn:  { background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px 16px', cursor: 'pointer', textAlign: 'left', fontFamily: "'Poppins', sans-serif", width: '100%', marginBottom: 8 },
};

// ─────────────────────────────────────────────────────────────────────────────
// Inline editable section preview (shown inside PDF extract result cards)
// ─────────────────────────────────────────────────────────────────────────────
function ExtractedSectionEditor({ section, idx, onUpdate }) {
  const [expanded,  setExpanded]  = useState(false);
  const [title,     setTitle]     = useState(section.title     || `Section ${idx + 1}`);
  const [pageRange, setPageRange] = useState(section.pageRange || '');
  const [quiz,      setQuiz]      = useState(section.quizQuestions || []);
  const [content,   setContent]   = useState(section.content   || '');

  // Push edits back up to parent so Apply uses updated data
  useEffect(() => {
    onUpdate(idx, { ...section, title, pageRange, content, quizQuestions: quiz });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, pageRange, content, quiz]);

  const updateQ = (i, field, val) =>
    setQuiz(p => p.map((q, qi) => qi === i ? { ...q, [field]: val } : q));
  const addQ    = () => setQuiz(p => [...p, { question: '', correctAnswer: true, pageRef: '' }]);
  const removeQ = (i) => setQuiz(p => p.filter((_, qi) => qi !== i));

  return (
    <div style={{ background: '#fff', border: '1.5px solid #bfdbfe', borderRadius: 10, marginBottom: 10, overflow: 'hidden' }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', cursor: 'pointer', background: expanded ? '#f0f9ff' : '#fff' }}
        onClick={() => setExpanded(v => !v)}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#2EABFE', fontFamily: "'Poppins', sans-serif" }}>
            SECTION {idx + 1} {pageRange && `· ${pageRange}`}
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', fontFamily: "'Poppins', sans-serif", marginTop: 2 }}>
            {title}
          </div>
          <div style={{ fontSize: 11, color: '#64748b', fontFamily: "'Poppins', sans-serif", marginTop: 2 }}>
            {content?.length || 0} chars · {quiz?.length || 0} quiz questions
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={e => { e.stopPropagation(); setExpanded(v => !v); }}
            style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 6, padding: '5px 10px', fontSize: 11, fontWeight: 600, color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontFamily: "'Poppins', sans-serif" }}
          >
            {expanded ? <FiEyeOff size={11} /> : <FiEye size={11} />}
            {expanded ? 'Collapse' : 'Preview & Edit'}
          </button>
        </div>
      </div>

      {/* Expanded editor */}
      {expanded && (
        <div style={{ borderTop: '1px solid #e0f2fe', padding: 16, background: '#f8fbff' }}>

          {/* Title + page range */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={S.label}>Section Title</label>
              <input
                style={S.input}
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Section title"
              />
            </div>
            <div>
              <label style={S.label}>Page Range</label>
              <input
                style={S.input}
                value={pageRange}
                onChange={e => setPageRange(e.target.value)}
                placeholder="e.g. Pages 1–9"
              />
            </div>
          </div>

          {/* Content preview / edit */}
          <div style={{ marginBottom: 16 }}>
            <label style={S.label}>Section Content (HTML)</label>
            <textarea
              rows={8}
              style={{ ...S.textarea, fontSize: 12, fontFamily: 'DM Mono, monospace', background: '#fff' }}
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="<p>Course content...</p>"
            />
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4, fontFamily: "'Poppins', sans-serif" }}>
              Raw HTML — will render properly in the TipTap editor once applied
            </div>
          </div>

          {/* Quiz questions */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <label style={{ ...S.label, margin: 0 }}>Quiz Questions ({quiz.length})</label>
              <button
                onClick={addQ}
                style={{ background: '#f0f9ff', color: '#2EABFE', border: '1px solid #2EABFE', borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontFamily: "'Poppins', sans-serif" }}
              >
                <FiPlus size={11} /> Add Question
              </button>
            </div>

            {quiz.length === 0 && (
              <div style={{ fontSize: 12, color: '#94a3b8', padding: '10px 0', fontFamily: "'Poppins', sans-serif" }}>
                No quiz questions detected — add them manually or check the PDF format.
              </div>
            )}

            {quiz.map((q, i) => (
              <div key={i} style={{ ...S.quizRow, background: '#fff', marginBottom: 8 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={S.qNum}>Q{i + 1}</span>
                  <div style={{ flex: 1 }}>
                    <textarea
                      rows={2}
                      style={{ ...S.textarea, fontSize: 12 }}
                      value={q.question}
                      onChange={e => updateQ(i, 'question', e.target.value)}
                      placeholder="True/False statement..."
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b' }}>Answer:</span>
                      <button style={S.answerBtn(q.correctAnswer === true,  true)}  onClick={() => updateQ(i, 'correctAnswer', true)}>TRUE</button>
                      <button style={S.answerBtn(q.correctAnswer === false, false)} onClick={() => updateQ(i, 'correctAnswer', false)}>FALSE</button>
                      <input
                        style={{ flex: 1, minWidth: 120, padding: '4px 8px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 11, fontFamily: "'Poppins', sans-serif" }}
                        value={q.pageRef}
                        onChange={e => updateQ(i, 'pageRef', e.target.value)}
                        placeholder="Page ref"
                      />
                    </div>
                  </div>
                  <button style={S.delBtn} onClick={() => removeQ(i)}><FiTrash2 size={13} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function CourseContentPage() {
  const [courses,         setCourses]         = useState([]);
  const [selectedCourse,  setSelectedCourse]  = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [loading,         setLoading]         = useState(false);
  const [saving,          setSaving]          = useState(false);
  const [toast,           setToast]           = useState(null);
  const [showModal,       setShowModal]       = useState(false);

  const [secTitle,   setSecTitle]   = useState('');
  const [secRange,   setSecRange]   = useState('');
  const [secContent, setSecContent] = useState('');
  const [secQuiz,    setSecQuiz]    = useState([]);

  const [pdfUploading, setPdfUploading] = useState(false);
  const [pdfResult,    setPdfResult]    = useState(null);
  const [pdfError,     setPdfError]     = useState('');
  const [applyingIdx,  setApplyingIdx]  = useState(null);

  // Local editable copy of extracted sections (editable before Apply)
  const [editedSections, setEditedSections] = useState([]);

  useEffect(() => { fetchCourses(); }, []);

  // Keep editedSections in sync when pdfResult changes
  useEffect(() => {
    if (pdfResult?.sections) {
      setEditedSections(pdfResult.sections.map(s => ({ ...s })));
    }
  }, [pdfResult]);

  const token = () => localStorage.getItem('adminToken');

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/api/course-content`, { headers: { Authorization: `Bearer ${token()}` } });
      const data = await res.json();
      setCourses(Array.isArray(data) ? data : []);
    } catch { showToast('Failed to load courses', 'error'); }
    setLoading(false);
  };

  const fetchCourseDetail = async (examName) => {
    try {
      const res  = await fetch(`${API}/api/course-content/${encodeURIComponent(examName)}`, { headers: { Authorization: `Bearer ${token()}` } });
      const data = await res.json();
      setSelectedCourse(data);
      setSelectedSection(null);
    } catch { showToast('Failed to load course', 'error'); }
  };

  const selectSection = (section) => {
    setSelectedSection(section);
    setSecTitle(section.title     || '');
    setSecRange(section.pageRange || '');
    setSecContent(section.content || '');
    setSecQuiz(section.quiz?.length ? section.quiz : [
      { question: '', correctAnswer: true,  pageRef: '' },
      { question: '', correctAnswer: true,  pageRef: '' },
      { question: '', correctAnswer: false, pageRef: '' },
      { question: '', correctAnswer: true,  pageRef: '' },
      { question: '', correctAnswer: false, pageRef: '' },
    ]);
  };

  const saveSection = async () => {
    if (!selectedCourse || !selectedSection) return;
    setSaving(true);
    try {
      const res = await fetch(
        `${API}/api/course-content/${encodeURIComponent(selectedCourse.examName)}/sections/${selectedSection.sectionNumber}`,
        {
          method:  'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
          body:    JSON.stringify({ title: secTitle, pageRange: secRange, content: secContent, quiz: secQuiz }),
        }
      );
      const updated = await res.json();
      setSelectedCourse(updated);
      const sec = updated.sections?.find(s => s.sectionNumber === selectedSection.sectionNumber);
      if (sec) setSelectedSection(sec);
      showToast('Section saved!', 'success');
    } catch { showToast('Failed to save', 'error'); }
    setSaving(false);
  };

  const handlePdfUpload = async (file) => {
    if (!selectedCourse) return;
    if (!file || file.type !== 'application/pdf') { setPdfError('Please select a valid PDF file.'); return; }
    setPdfUploading(true);
    setPdfResult(null);
    setPdfError('');
    try {
      const formData = new FormData();
      formData.append('pdf', file);
      const response = await fetch(`${API}/api/course-content/extract-pdf`, {
        method: 'POST', headers: { Authorization: `Bearer ${token()}` }, body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to process PDF');
      if (!data.sections?.length) throw new Error('No sections found in PDF');
      setPdfResult(data);
      showToast(`✅ Found ${data.sections.length} sections!`, 'success');
    } catch (err) {
      setPdfError(err.message || 'Failed to process PDF');
      showToast('Failed to process PDF', 'error');
    } finally {
      setPdfUploading(false);
    }
  };

  // Called by ExtractedSectionEditor whenever admin edits a section
  const handleSectionEdit = (idx, updatedSection) => {
    setEditedSections(prev => prev.map((s, i) => i === idx ? updatedSection : s));
  };

  const applyPdfSection = async (extractedSection, targetSectionNumber) => {
    if (!selectedCourse) return;
    setApplyingIdx(targetSectionNumber);
    try {
      const res = await fetch(
        `${API}/api/course-content/${encodeURIComponent(selectedCourse.examName)}/sections/${targetSectionNumber}`,
        {
          method:  'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
          body:    JSON.stringify({
            title:     extractedSection.title,
            pageRange: extractedSection.pageRange,
            content:   extractedSection.content,
            quiz:      extractedSection.quizQuestions || [],
          }),
        }
      );
      if (!res.ok) throw new Error('Save failed');
      const updated = await res.json();
      setSelectedCourse(updated);
      showToast(`Section ${targetSectionNumber} saved!`, 'success');
    } catch {
      showToast(`Failed to save Section ${targetSectionNumber}`, 'error');
    } finally {
      setApplyingIdx(null);
    }
  };

  const applyAllSections = async () => {
    if (!editedSections.length) return;
    for (let i = 0; i < editedSections.length; i++) {
      await applyPdfSection(editedSections[i], i + 1);
    }
    setPdfResult(null);
    showToast('All sections saved!', 'success');
  };

  const createCourse = async (template) => {
    try {
      const res = await fetch(`${API}/api/course-content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({
          ...template,
          sections: [
            { sectionNumber: 1, title: 'Section 1', pageRange: '', content: '', quiz: [] },
            { sectionNumber: 2, title: 'Section 2', pageRange: '', content: '', quiz: [] },
            { sectionNumber: 3, title: 'Section 3', pageRange: '', content: '', quiz: [] },
          ],
        }),
      });
      if (!res.ok) { const e = await res.json(); showToast(e.message || 'Failed', 'error'); return; }
      showToast('Course created!', 'success');
      setShowModal(false);
      fetchCourses();
    } catch { showToast('Failed to create', 'error'); }
  };

  const updateQ  = (i, f, v) => setSecQuiz(p => p.map((q, idx) => idx === i ? { ...q, [f]: v } : q));
  const addQ     = ()        => setSecQuiz(p => [...p, { question: '', correctAnswer: true, pageRef: '' }]);
  const removeQ  = (i)       => setSecQuiz(p => p.filter((_, idx) => idx !== i));
  const showToast = (msg, type) => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const existingNames      = courses.map(c => c.examName);
  const availableTemplates = COURSE_TEMPLATES.filter(t => !existingNames.includes(t.examName));
  const sectionIsComplete  = (s) => {
    const full = selectedCourse?.sections?.find(x => x.sectionNumber === s.sectionNumber);
    return full && full.content?.length > 20 && full.quiz?.length > 0;
  };

  return (
    <AppLayout>
      <div style={S.root}>

        {/* SIDEBAR */}
        <aside style={S.sidebar}>
          <div style={S.sideHead}>
            <span style={S.sideTitle}><FiBook size={15} color="#2EABFE" /> Course Content</span>
            <button style={S.addBtn} onClick={() => setShowModal(true)}>
              <FiPlus size={12} /> Add
            </button>
          </div>
          <div style={S.sideList}>
            {loading && <p style={{ padding: 16, color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>Loading...</p>}
            {!loading && courses.length === 0 && (
              <p style={{ padding: 16, color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>No courses yet. Click Add.</p>
            )}
            {courses.map(c => (
              <CourseItem
                key={c.examName}
                course={c}
                isSelected={selectedCourse?.examName === c.examName}
                selectedSection={selectedSection}
                fullCourse={selectedCourse?.examName === c.examName ? selectedCourse : null}
                onSelect={() => fetchCourseDetail(c.examName)}
                onSelectSection={selectSection}
              />
            ))}
          </div>
        </aside>

        {/* MAIN */}
        <div style={S.main}>
          <div style={S.topBar}>
            <div>
              <h2 style={S.topTitle}>
                {selectedSection
                  ? `${selectedCourse?.examName} — ${selectedSection.title}`
                  : selectedCourse
                  ? selectedCourse.examName
                  : 'Course Content Manager'}
              </h2>
              {selectedSection && <p style={S.topSub}>{selectedSection.pageRange || 'No page range set'}</p>}
              {selectedCourse && !selectedSection && (
                <p style={S.topSub}>
                  {selectedCourse.unlockHours
                    ? `Unlocks after ${UNLOCK_LABEL[selectedCourse.unlockHours] || selectedCourse.unlockHours + 'hrs'} from enrollment`
                    : ''}
                </p>
              )}
            </div>
            {selectedSection && (
              <button style={{ ...S.saveBtn, opacity: saving ? 0.7 : 1 }} onClick={saveSection} disabled={saving}>
                <FiSave size={14} /> {saving ? 'Saving...' : 'Save Section'}
              </button>
            )}
            {selectedSection && (
              <button
                onClick={() => setSelectedSection(null)}
                style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 14px', fontSize: 12, color: '#64748b', cursor: 'pointer', marginLeft: 8, display: 'flex', alignItems: 'center', gap: 4, fontFamily: "'Poppins', sans-serif" }}
              >
                <FiChevronRight size={13} /> Back to Overview
              </button>
            )}
          </div>

          <div style={S.body}>

            {/* Empty */}
            {!selectedCourse && (
              <div style={S.emptyState}>
                <FiBook size={52} />
                <p style={{ fontSize: 15, fontWeight: 500 }}>Select a course from the sidebar</p>
                <p style={{ fontSize: 13 }}>Or click Add to create a new course</p>
              </div>
            )}

            {/* Course overview */}
            {selectedCourse && !selectedSection && (
              <div>
                {/* Info card */}
                <div style={S.card}>
                  <p style={S.cardTitle}><FiBook size={14} color="#2EABFE" /> Course Overview</p>
                  <div style={S.grid2}>
                    <div>
                      <label style={S.label}>Exam Name</label>
                      <p style={{ fontSize: 14, color: '#0f172a', fontWeight: 500 }}>{selectedCourse.examName}</p>
                    </div>
                    <div>
                      <label style={S.label}>Unlock After</label>
                      <p style={{ fontSize: 14, color: '#0f172a', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <FiClock size={13} color="#2EABFE" />
                        {UNLOCK_LABEL[selectedCourse.unlockHours] || `${selectedCourse.unlockHours}hrs`} from enrollment
                      </p>
                    </div>
                  </div>
                </div>

                {/* PDF Upload card */}
                <div style={{ ...S.card, border: '2px dashed #bfdbfe', background: '#f0f9ff', marginBottom: 20 }}>
                  <p style={{ ...S.cardTitle, color: '#1d4ed8' }}>
                    <FiUploadCloud size={16} color="#2EABFE" />
                    Auto-fill from PDF Booklet
                    <span style={{ fontSize: 11, fontWeight: 400, color: '#64748b' }}>
                      Upload the full booklet — AI will split it into sections automatically
                    </span>
                  </p>

                  {!pdfResult && (
                    <label style={{
                      display: 'inline-flex', alignItems: 'center', gap: 8,
                      background: pdfUploading ? '#e0f2fe' : '#2EABFE',
                      color: pdfUploading ? '#0369a1' : '#fff',
                      border: 'none', borderRadius: 8, padding: '10px 20px',
                      fontSize: 13, fontWeight: 600, cursor: pdfUploading ? 'not-allowed' : 'pointer',
                      fontFamily: "'Poppins', sans-serif",
                    }}>
                      <FiUploadCloud size={14} />
                      {pdfUploading ? 'Extracting sections...' : 'Upload PDF Booklet'}
                      <input type="file" accept="application/pdf" style={{ display: 'none' }} disabled={pdfUploading}
                        onChange={e => { if (e.target.files[0]) handlePdfUpload(e.target.files[0]); e.target.value = ''; }} />
                    </label>
                  )}

                  {pdfUploading && (
                    <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#0369a1', fontFamily: "'Poppins', sans-serif" }}>
                      <div style={{ width: 18, height: 18, border: '2px solid #bfdbfe', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
                      Reading PDF and extracting sections...
                    </div>
                  )}

                  {pdfError && (
                    <div style={{ marginTop: 10, color: '#dc2626', fontSize: 13, fontFamily: "'Poppins', sans-serif" }}>
                      ⚠️ {pdfError}
                    </div>
                  )}

                  {/* Results with inline edit */}
                  {pdfResult && editedSections.length > 0 && (
                    <div style={{ marginTop: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#15803d', fontFamily: "'Poppins', sans-serif" }}>
                          ✅ {pdfResult.sections.length} sections extracted — preview &amp; edit before applying
                        </span>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            onClick={() => { setPdfResult(null); setPdfError(''); setEditedSections([]); }}
                            style={{ background: '#fff', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: 7, padding: '6px 12px', fontSize: 12, cursor: 'pointer', fontFamily: "'Poppins', sans-serif" }}
                          >
                            Discard
                          </button>
                          <button
                            onClick={applyAllSections}
                            disabled={applyingIdx !== null}
                            style={{ background: '#16a34a', color: '#fff', border: 'none', borderRadius: 7, padding: '6px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'Poppins', sans-serif", opacity: applyingIdx !== null ? 0.6 : 1 }}
                          >
                            Apply All Sections
                          </button>
                        </div>
                      </div>

                      {/* Inline editable section cards */}
                      {editedSections.map((sec, idx) => (
                        <div key={idx}>
                          <ExtractedSectionEditor
                            section={sec}
                            idx={idx}
                            onUpdate={handleSectionEdit}
                          />
                          {/* Per-section apply button */}
                          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: -6, marginBottom: 12 }}>
                            <button
                              onClick={() => applyPdfSection(editedSections[idx], idx + 1)}
                              disabled={applyingIdx === idx + 1}
                              style={{
                                background: '#2EABFE', color: '#fff', border: 'none', borderRadius: 7,
                                padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                fontFamily: "'Poppins', sans-serif",
                                opacity: applyingIdx === idx + 1 ? 0.6 : 1,
                              }}
                            >
                              {applyingIdx === idx + 1 ? 'Saving...' : `Apply Section ${idx + 1}`}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Section status cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
                  {selectedCourse.sections?.sort((a, b) => a.sectionNumber - b.sectionNumber).map(s => {
                    const done = sectionIsComplete(s);
                    return (
                      <button
                        key={s.sectionNumber}
                        onClick={() => selectSection(s)}
                        style={{ background: '#fff', border: `2px solid ${done ? '#86efac' : '#e2e8f0'}`, borderRadius: 12, padding: 18, cursor: 'pointer', textAlign: 'left', fontFamily: "'Poppins', sans-serif" }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#2EABFE' }}>SECTION {s.sectionNumber}</span>
                          {done
                            ? <span style={{ fontSize: 11, background: '#dcfce7', color: '#16a34a', padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>✓ Complete</span>
                            : <span style={{ fontSize: 11, background: '#fef9c3', color: '#ca8a04', padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>Pending</span>
                          }
                        </div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', margin: '0 0 4px' }}>{s.title || `Section ${s.sectionNumber}`}</p>
                        <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>{s.pageRange || 'No page range'}</p>
                        <p style={{ fontSize: 11, color: '#94a3b8', margin: '6px 0 0' }}>{s.quiz?.length || 0} quiz questions</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Section editor (after clicking a section card) */}
            {selectedSection && (
              <div>
                <div style={S.card}>
                  <p style={S.cardTitle}><FiEdit2 size={14} color="#2EABFE" /> Section Info</p>
                  <div style={S.grid2}>
                    <div>
                      <label style={S.label}>Section Title</label>
                      <input style={S.input} value={secTitle} onChange={e => setSecTitle(e.target.value)} placeholder="e.g. Section 1" />
                    </div>
                    <div>
                      <label style={S.label}>Page Range</label>
                      <input style={S.input} value={secRange} onChange={e => setSecRange(e.target.value)} placeholder="e.g. Pages 1-17" />
                    </div>
                  </div>
                </div>

                <div style={S.card}>
                  <p style={S.cardTitle}>
                    📖 Section Content
                    <span style={{ fontSize: 12, fontWeight: 400, color: '#64748b' }}>Paste or type course material here</span>
                  </p>
                  <TipTapEditor value={secContent} onChange={setSecContent} />
                </div>

                <div style={S.card}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <p style={{ ...S.cardTitle, margin: 0 }}>
                      📝 Quiz Questions
                      <span style={{ fontSize: 12, fontWeight: 400, color: '#64748b', marginLeft: 6 }}>True/False — shown to student after reading</span>
                    </p>
                    <button
                      onClick={addQ}
                      style={{ background: '#f0f9ff', color: '#2EABFE', border: '1px solid #2EABFE', borderRadius: 8, padding: '6px 12px', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontFamily: "'Poppins', sans-serif" }}
                    >
                      <FiPlus size={12} /> Add Question
                    </button>
                  </div>
                  {secQuiz.map((q, i) => (
                    <div key={i} style={S.quizRow}>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                        <span style={S.qNum}>Q{i + 1}</span>
                        <div style={{ flex: 1 }}>
                          <textarea rows={2} style={S.textarea} value={q.question}
                            onChange={e => updateQ(i, 'question', e.target.value)} placeholder="Enter True/False statement..." />
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Correct Answer:</span>
                            <button style={S.answerBtn(q.correctAnswer === true,  true)}  onClick={() => updateQ(i, 'correctAnswer', true)}>TRUE</button>
                            <button style={S.answerBtn(q.correctAnswer === false, false)} onClick={() => updateQ(i, 'correctAnswer', false)}>FALSE</button>
                            <input
                              style={{ flex: 1, minWidth: 140, padding: '4px 10px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 12, fontFamily: "'Poppins', sans-serif" }}
                              value={q.pageRef} onChange={e => updateQ(i, 'pageRef', e.target.value)} placeholder="Page ref (e.g. Page 2, Para 3)" />
                          </div>
                        </div>
                        <button style={S.delBtn} onClick={() => removeQ(i)}><FiTrash2 size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ADD COURSE MODAL */}
      {showModal && (
        <div style={S.modalOverlay}>
          <div style={S.modal}>
            <div style={S.modalHead}>
              <h3 style={S.modalTitle}>Add Course</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><FiX size={18} /></button>
            </div>
            {availableTemplates.length === 0
              ? <p style={{ fontSize: 14, color: '#64748b' }}>All courses have been added already.</p>
              : availableTemplates.map(t => (
                <button key={t.examName} style={S.templateBtn} onClick={() => createCourse(t)}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#091925' }}>{t.courseName}</div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FiClock size={10} /> Unlocks after {UNLOCK_LABEL[t.unlockHours]} · {t.examName}
                  </div>
                </button>
              ))
            }
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div style={S.toast(toast.type)}>
          {toast.type === 'success' ? <FiCheck size={15} /> : <FiAlertCircle size={15} />}
          {toast.msg}
        </div>
      )}
    </AppLayout>
  );
}

// ── TipTap Editor ─────────────────────────────────────────────────────────────
function TipTapEditor({ value, onChange }) {
  const editor = useEditor({
    extensions: [StarterKit, Underline, TextAlign.configure({ types: ['heading', 'paragraph'] })],
    content: value || '',
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '', false);
    }
  }, [value]);

  if (!editor) return null;

  const toolbarBtn = (active, onClick, children, title) => (
    <button title={title} onClick={onClick} style={{
      background: active ? '#2EABFE' : '#f1f5f9', color: active ? '#fff' : '#475569',
      border: 'none', borderRadius: 6, padding: '5px 9px', cursor: 'pointer',
      fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3,
    }}>
      {children}
    </button>
  );

  return (
    <div>
      <style>{`
        .tiptap-editor .ProseMirror { min-height: 420px; padding: 16px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px; font-family: 'Poppins', sans-serif; font-size: 13px; line-height: 1.8; color: #0f172a; outline: none; background: #fafafa; }
        .tiptap-editor .ProseMirror p { margin: 0 0 10px; }
        .tiptap-editor .ProseMirror h1 { font-size: 18px; font-weight: 700; margin: 16px 0 8px; }
        .tiptap-editor .ProseMirror h2 { font-size: 15px; font-weight: 700; margin: 14px 0 6px; }
        .tiptap-editor .ProseMirror h3 { font-size: 13px; font-weight: 700; margin: 12px 0 4px; }
        .tiptap-editor .ProseMirror ul, .tiptap-editor .ProseMirror ol { padding-left: 20px; margin: 0 0 10px; }
        .tiptap-editor .ProseMirror li { margin-bottom: 4px; }
        .tiptap-editor .ProseMirror blockquote { border-left: 3px solid #2EABFE; padding-left: 12px; color: #475569; margin: 10px 0; }
        .tiptap-editor .ProseMirror:focus { border-color: #2EABFE; background: #fff; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', padding: '8px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px 8px 0 0' }}>
        {toolbarBtn(editor.isActive('bold'),      () => editor.chain().focus().toggleBold().run(),      <FiBold size={13} />,          'Bold')}
        {toolbarBtn(editor.isActive('italic'),    () => editor.chain().focus().toggleItalic().run(),    <FiItalic size={13} />,        'Italic')}
        {toolbarBtn(editor.isActive('underline'), () => editor.chain().focus().toggleUnderline().run(), <FiUnderlineIcon size={13} />, 'Underline')}
        <div style={{ width: 1, background: '#e2e8f0', margin: '0 4px' }} />
        {toolbarBtn(editor.isActive('heading', { level: 1 }), () => editor.chain().focus().toggleHeading({ level: 1 }).run(), 'H1', 'Heading 1')}
        {toolbarBtn(editor.isActive('heading', { level: 2 }), () => editor.chain().focus().toggleHeading({ level: 2 }).run(), 'H2', 'Heading 2')}
        {toolbarBtn(editor.isActive('heading', { level: 3 }), () => editor.chain().focus().toggleHeading({ level: 3 }).run(), 'H3', 'Heading 3')}
        <div style={{ width: 1, background: '#e2e8f0', margin: '0 4px' }} />
        {toolbarBtn(editor.isActive('bulletList'),  () => editor.chain().focus().toggleBulletList().run(),  <FiList size={13} />,  'Bullet List')}
        {toolbarBtn(editor.isActive('orderedList'), () => editor.chain().focus().toggleOrderedList().run(), '1.',                  'Numbered List')}
        {toolbarBtn(editor.isActive('blockquote'),  () => editor.chain().focus().toggleBlockquote().run(),  '❝',                  'Blockquote')}
      </div>
      <div className="tiptap-editor"><EditorContent editor={editor} /></div>
    </div>
  );
}

// ── Sidebar Course Item ───────────────────────────────────────────────────────
function CourseItem({ course, isSelected, selectedSection, fullCourse, onSelect, onSelectSection }) {
  const [expanded, setExpanded] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (isSelected) setExpanded(true); }, [isSelected]);
  const sectionComplete = (s) => s.content?.length > 20 && s.quiz?.length > 0;
  return (
    <div>
      <button
        onClick={() => { setExpanded(!expanded); onSelect(); }}
        style={{
          width: '100%', background: isSelected ? 'rgba(46,171,254,0.1)' : 'transparent',
          border: 'none', borderLeft: isSelected ? '3px solid #2EABFE' : '3px solid transparent',
          color: isSelected ? '#2EABFE' : 'rgba(255,255,255,0.65)',
          padding: '10px 14px', cursor: 'pointer', textAlign: 'left',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          fontSize: 12, fontFamily: "'Poppins', sans-serif", lineHeight: 1.4,
        }}
      >
        <span style={{ flex: 1 }}>{course.examName}</span>
        {expanded ? <FiChevronDown size={13} /> : <FiChevronRight size={13} />}
      </button>
      {expanded && fullCourse?.sections && (
        <div style={{ paddingLeft: 14 }}>
          {fullCourse.sections.sort((a, b) => a.sectionNumber - b.sectionNumber).map(s => {
            const isSelectedSec = selectedSection?.sectionNumber === s.sectionNumber;
            const done          = sectionComplete(s);
            return (
              <button key={s.sectionNumber} onClick={() => onSelectSection(s)} style={{
                width: '100%', background: isSelectedSec ? 'rgba(46,171,254,0.15)' : 'transparent',
                border: 'none', borderRadius: 6,
                color: isSelectedSec ? '#2EABFE' : 'rgba(255,255,255,0.5)',
                padding: '7px 10px', cursor: 'pointer', textAlign: 'left',
                fontSize: 11, fontFamily: "'Poppins', sans-serif",
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span style={{ fontSize: 10 }}>{done ? '✅' : '○'}</span>
                <span>{s.title || `Section ${s.sectionNumber}`}</span>
                {s.pageRange && <span style={{ marginLeft: 'auto', fontSize: 10, opacity: 0.5 }}>{s.pageRange}</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}