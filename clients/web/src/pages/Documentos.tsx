import { useState, useRef } from 'react';
import {
  FileText, Search, Folder, MessageSquare, Send, ChevronRight,
  FileDown, X, Eye, Pencil, Bot, MessageCircle,
  Bold, Italic, Underline, Highlighter, BookOpen,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { MOCK_CASES } from '../data/mockData';

// Stable mock document tree definition
const INITIAL_DOCS = MOCK_CASES.map(c => ({
  id: `folder-${c.id}`,
  name: `Caso #${c.id} - ${c.title.split(' ')[0]}`,
  type: 'folder' as const,
  children: [
    {
      id: `doc-${c.id}-1`,
      name: 'Contestación_Borrador.docx',
      type: 'file' as const,
      content: `Borrador de contestación para el caso ${c.id}.\n\nHechos:\nEn la fecha del siniestro, el vehículo asegurado transitaba por la Av. Corrientes al 2400 cuando fue impactado lateralmente por el rodado del demandante.\n\nDerecho:\nLa póliza contratada cubre los daños materiales y lesiones corporales conforme al artículo 109 de la Ley de Seguros 17.418. Sin embargo, conforme surge del acta de inspección, el vehículo asegurado presentaba...`,
    },
    {
      id: `doc-${c.id}-2`,
      name: 'Póliza_Original.pdf',
      type: 'file' as const,
      content: `[Vista previa de PDF: Póliza de ${c.title}]\n\nNúmero de Póliza: POL-${c.id}-2024\nVigencia: 01/01/2024 — 31/12/2024\nAsegurado: Libra Seguros S.A.\nCobertura: Responsabilidad Civil — hasta ARS 50.000.000\n\nCondiciones generales:\nArt. 1 — Objeto del seguro...\nArt. 2 — Exclusiones...`,
    },
  ],
}));

type DocFile = { id: string; name: string; type: 'file'; content: string };
type DocFolder = { id: string; name: string; type: 'folder'; children: DocFile[] };
type Message = { id: string; role: 'user' | 'agent'; content: string; time: string };

interface DocComment {
  id: string;
  selectedText?: string;
  text: string;
  timestamp: string;
}

function renderWithHighlights(text: string, highlights: string[]) {
  if (!highlights.length) return <>{text}</>;
  const escaped = highlights.map(h => h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const pattern = new RegExp(`(${escaped.join('|')})`, 'g');
  const parts = text.split(pattern);
  return (
    <>
      {parts.map((part, i) =>
        highlights.includes(part)
          ? <mark key={i} className="bg-yellow-200 dark:bg-yellow-400/30 rounded-sm px-0.5 not-italic">{part}</mark>
          : part
      )}
    </>
  );
}

export default function Documentos() {
  const [docTree, setDocTree] = useState<DocFolder[]>(() =>
    INITIAL_DOCS.map(f => ({ ...f, children: [...f.children] }))
  );
  const [selectedDoc, setSelectedDoc] = useState<DocFile | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({ 'folder-CAS-2024-001': true });
  const [chatMessage, setChatMessage] = useState('');
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'agent', content: 'Hola. Tengo visibilidad completa del expediente. ¿Hay algún punto específico que quieras revisar o verificar contra la póliza?', time: '10:45 AM' },
  ]);
  const [editorContent, setEditorContent] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [comments, setComments] = useState<DocComment[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [pendingSelection, setPendingSelection] = useState<string | null>(null);
  const [commentDraft, setCommentDraft] = useState('');
  const [selectionPos, setSelectionPos] = useState<{ top: number; left: number } | null>(null);
  const [highlights, setHighlights] = useState<string[]>([]);

  const contentRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const toggleFolder = (id: string) => {
    setExpandedFolders(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSelectDoc = (doc: DocFile) => {
    setSelectedDoc(doc);
    setEditorContent(doc.content);
    setEditMode(false);
    setPendingSelection(null);
    setSelectionPos(null);
    setHighlights([]);
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: chatMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, userMsg]);
    setChatMessage('');
    setTimeout(() => {
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        content: 'Analizando el expediente completo. En un momento tendrás los cambios o la información solicitada.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, reply]);
    }, 1000);
  };

  const handleTextSelection = () => {
    if (editMode) return;
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 3 && contentRef.current) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const containerRect = contentRef.current.getBoundingClientRect();
      setPendingSelection(selection.toString().trim());
      setSelectionPos({
        top: rect.bottom - containerRect.top + 8,
        left: Math.min(rect.left - containerRect.left, containerRect.width - 180),
      });
    } else {
      setPendingSelection(null);
      setSelectionPos(null);
    }
  };

  const handleAddComment = () => {
    if (!commentDraft.trim()) return;
    const now = new Date();
    setComments(prev => [...prev, {
      id: Date.now().toString(),
      selectedText: pendingSelection ?? undefined,
      text: commentDraft.trim(),
      timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }]);
    setCommentDraft('');
    setPendingSelection(null);
    setSelectionPos(null);
    setShowComments(true);
  };

  const handleHighlight = () => {
    if (!pendingSelection) return;
    setHighlights(prev => prev.includes(pendingSelection) ? prev : [...prev, pendingSelection]);
    setPendingSelection(null);
    setSelectionPos(null);
  };

  const applyMarkdown = (wrapper: string) => {
    const el = textareaRef.current;
    if (!el || !editMode) return;
    const { selectionStart: s, selectionEnd: e } = el;
    const sel = editorContent.slice(s, e);
    if (!sel) return;
    setEditorContent(p => p.slice(0, s) + wrapper + sel + wrapper + p.slice(e));
  };

  const handleGenerateNotas = () => {
    if (!selectedDoc) return;
    const fi = docTree.findIndex(f => f.children.some(c => c.id === selectedDoc.id));
    if (fi === -1) return;
    const folder = docTree[fi];
    const timestamp = new Date().toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    const noteLines: string[] = [
      `# Notas del Caso — ${folder.name}`,
      `Generadas: ${timestamp}`,
      '',
    ];

    if (highlights.length > 0) {
      noteLines.push(`## Texto Resaltado (${highlights.length})`);
      highlights.forEach((h, i) => noteLines.push(`${i + 1}. "${h}"`));
      noteLines.push('');
    }

    if (comments.length > 0) {
      noteLines.push(`## Comentarios (${comments.length})`);
      comments.forEach((c, i) => {
        noteLines.push(`### Comentario ${i + 1} · ${c.timestamp}`);
        if (c.selectedText) noteLines.push(`> "${c.selectedText}"`);
        noteLines.push(c.text);
        noteLines.push('');
      });
    }

    const userMessages = messages.filter(m => m.role === 'user');
    if (userMessages.length > 0) {
      noteLines.push(`## Conversación con Ali (${messages.length} mensajes)`);
      messages.forEach(m => {
        noteLines.push(`**${m.role === 'user' ? 'Admin' : 'Ali'}** · ${m.time}`);
        noteLines.push(m.content);
        noteLines.push('');
      });
    }

    const noteContent = noteLines.join('\n');
    const noteId = `notas-${folder.id}`;
    const noteDoc: DocFile = { id: noteId, name: 'Notas_del_Caso.md', type: 'file', content: noteContent };

    setDocTree(prev => prev.map((f, i) =>
      i === fi
        ? { ...f, children: f.children.filter(c => c.id !== noteId).concat(noteDoc) }
        : f
    ));
    // Also expand the folder
    setExpandedFolders(prev => ({ ...prev, [folder.id]: true }));
    handleSelectDoc(noteDoc);
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] -m-8 border-t border-[var(--color-border-dim)]">

      {/* 1. Left Panel: File Explorer */}
      <div className="w-64 bg-[var(--color-surface-sidebar)] border-r border-[var(--color-border-dim)] flex flex-col shrink-0">
        <div className="p-4 border-b border-[var(--color-border-dim)]">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">Explorador de Casos</h2>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
            <input
              type="text"
              placeholder="Buscar archivo..."
              className="w-full pl-8 pr-3 py-1.5 bg-[var(--color-surface-bg)] border border-[var(--color-border-dim)] rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-primary)] text-[var(--color-text-primary)]"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {docTree.map(folder => (
            <div key={folder.id} className="mb-1">
              <button
                onClick={() => toggleFolder(folder.id)}
                className="w-full flex items-center gap-1.5 px-2 py-1.5 text-xs text-[var(--color-sidebar-text)] hover:bg-[var(--color-sidebar-bg-hover)] rounded-md transition-colors"
              >
                <ChevronRight className={cn('w-3.5 h-3.5 transition-transform text-[var(--color-text-tertiary)]', expandedFolders[folder.id] && 'rotate-90')} />
                <Folder className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
                <span className="font-medium truncate">{folder.name}</span>
              </button>

              {expandedFolders[folder.id] && (
                <div className="ml-5 mt-0.5 space-y-0.5 border-l border-[var(--color-border-dim)] pl-2">
                  {folder.children.map((file) => (
                    <button
                      key={file.id}
                      onClick={() => handleSelectDoc(file)}
                      className={cn(
                        'w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded-md transition-colors',
                        selectedDoc?.id === file.id
                          ? 'bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] font-medium'
                          : 'text-[var(--color-sidebar-text)] hover:bg-[var(--color-sidebar-bg-hover)]'
                      )}
                    >
                      <FileText className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{file.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 2. Center Panel: Document Viewer/Editor */}
      <div className="flex-1 bg-[var(--color-surface-bg)] flex flex-col min-w-0 relative">
        {selectedDoc ? (
          <>
            {/* Toolbar Row 1: filename + actions */}
            <div className="h-12 border-b border-[var(--color-border-dim)] bg-[var(--color-surface-card)] flex items-center justify-between px-4 shrink-0 gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <FileText className="w-4 h-4 text-[var(--color-brand-primary)] shrink-0" />
                <h2 className="text-sm font-semibold text-[var(--color-text-primary)] truncate">{selectedDoc.name}</h2>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {/* Comments toggle */}
                <button
                  onClick={() => setShowComments(o => !o)}
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
                    showComments
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-bg)]'
                  )}
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  {comments.length > 0 && <span>{comments.length}</span>}
                </button>

                {/* View/Edit toggle */}
                <div className="flex bg-[var(--color-surface-bg)] rounded-md p-0.5 border border-[var(--color-border-dim)]">
                  <button
                    onClick={() => setEditMode(false)}
                    className={cn(
                      'px-2 py-0.5 text-xs rounded transition-all flex items-center gap-1',
                      !editMode ? 'bg-[var(--color-surface-card)] shadow-sm text-[var(--color-text-primary)]' : 'text-[var(--color-text-tertiary)]'
                    )}
                  >
                    <Eye className="w-3 h-3" /> Ver
                  </button>
                  <button
                    onClick={() => setEditMode(true)}
                    className={cn(
                      'px-2 py-0.5 text-xs rounded transition-all flex items-center gap-1',
                      editMode ? 'bg-[var(--color-surface-card)] shadow-sm text-[var(--color-text-primary)]' : 'text-[var(--color-text-tertiary)]'
                    )}
                  >
                    <Pencil className="w-3 h-3" /> Editar
                  </button>
                </div>

                <button className="p-1.5 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] rounded-md hover:bg-[var(--color-surface-bg)] transition-colors">
                  <FileDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Toolbar Row 2: Word-style formatting */}
            <div className="h-9 border-b border-[var(--color-border-dim)] bg-[var(--color-surface-bg)] flex items-center px-4 gap-0.5 shrink-0">
              {/* B / I / U — edit mode only */}
              {(['B', 'I', 'U'] as const).map((fmt) => {
                const wrappers = { B: '**', I: '_', U: '~~' };
                const icons = { B: Bold, I: Italic, U: Underline };
                const Icon = icons[fmt];
                return (
                  <button
                    key={fmt}
                    onClick={() => applyMarkdown(wrappers[fmt])}
                    disabled={!editMode}
                    title={editMode ? `Aplicar ${fmt === 'B' ? 'negrita' : fmt === 'I' ? 'cursiva' : 'tachado'}` : 'Disponible en modo Edición'}
                    className={cn(
                      'w-7 h-7 rounded flex items-center justify-center transition-colors',
                      editMode
                        ? 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-card)] hover:text-[var(--color-text-primary)]'
                        : 'text-[var(--color-text-tertiary)] opacity-40 cursor-not-allowed'
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </button>
                );
              })}

              {/* Separator */}
              <div className="w-px h-5 bg-[var(--color-border-dim)] mx-1.5" />

              {/* Highlight — view mode only */}
              <button
                onClick={handleHighlight}
                disabled={editMode || !pendingSelection}
                title={editMode ? 'Disponible en modo Vista' : pendingSelection ? 'Resaltar selección' : 'Seleccioná texto primero'}
                className={cn(
                  'flex items-center gap-1.5 px-2 h-7 rounded text-xs font-medium transition-colors',
                  !editMode && highlights.length > 0
                    ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                    : !editMode && pendingSelection
                    ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-200'
                    : 'text-[var(--color-text-tertiary)] opacity-50 cursor-not-allowed'
                )}
              >
                <Highlighter className="w-3.5 h-3.5" />
                <span>Resaltar</span>
                {highlights.length > 0 && (
                  <span className="text-[10px] bg-yellow-200 text-yellow-800 rounded-full px-1">{highlights.length}</span>
                )}
              </button>

              {/* Separator */}
              <div className="w-px h-5 bg-[var(--color-border-dim)] mx-1.5" />

              {/* Notas del Caso */}
              <button
                onClick={handleGenerateNotas}
                title="Generar Notas del Caso a partir de comentarios y chat"
                className="flex items-center gap-1.5 px-2 h-7 rounded text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-card)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Notas del Caso</span>
              </button>
            </div>

            {/* Comments strip */}
            <AnimatePresence>
              {showComments && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="overflow-hidden border-b border-[var(--color-border-dim)] bg-amber-50/50 dark:bg-amber-500/5"
                >
                  <div className="p-3 max-h-40 overflow-y-auto">
                    {comments.length === 0 ? (
                      <p className="text-xs text-[var(--color-text-tertiary)] text-center py-2">
                        Seleccioná texto en el documento para agregar un comentario.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {comments.map(c => (
                          <div key={c.id} className="bg-[var(--color-surface-card)] border border-amber-200 rounded-lg p-2.5 space-y-1">
                            {c.selectedText && (
                              <p className="text-[10px] text-[var(--color-text-secondary)] border-l-2 border-amber-400 pl-2 italic truncate">
                                "{c.selectedText}"
                              </p>
                            )}
                            <p className="text-xs text-[var(--color-text-primary)]">{c.text}</p>
                            <p className="text-[10px] text-[var(--color-text-tertiary)]">Admin · {c.timestamp}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Editor / Viewer Area */}
            <div className="flex-1 overflow-y-auto p-8 relative" ref={contentRef}>
              <div className="max-w-3xl mx-auto bg-[var(--color-surface-card)] border border-[var(--color-border-dim)] shadow-sm min-h-[800px] p-12 rounded-sm">
                {editMode ? (
                  <textarea
                    ref={textareaRef}
                    value={editorContent}
                    onChange={e => setEditorContent(e.target.value)}
                    className="w-full h-full min-h-[600px] resize-none outline-none text-[var(--color-text-primary)] leading-loose font-serif bg-transparent"
                    spellCheck="false"
                  />
                ) : (
                  <div
                    onMouseUp={handleTextSelection}
                    className="whitespace-pre-wrap text-[var(--color-text-primary)] leading-loose font-serif text-[15px] select-text"
                  >
                    {renderWithHighlights(editorContent, highlights)}
                  </div>
                )}
              </div>

              {/* Floating popover on text selection */}
              <AnimatePresence>
                {pendingSelection && selectionPos && !editMode && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.1 }}
                    className="absolute z-20 bg-[var(--color-surface-card)] border border-[var(--color-border-dim)] rounded-xl shadow-lg p-3 w-60"
                    style={{ top: selectionPos.top + 32, left: Math.max(selectionPos.left + 48, 0) }}
                  >
                    <p className="text-[10px] text-[var(--color-text-tertiary)] italic truncate mb-2">"{pendingSelection}"</p>
                    <textarea
                      value={commentDraft}
                      onChange={e => setCommentDraft(e.target.value)}
                      placeholder="Escribe un comentario..."
                      rows={2}
                      className="w-full text-xs bg-[var(--color-surface-bg)] border border-[var(--color-border-dim)] rounded-md px-2 py-1.5 resize-none outline-none focus:ring-1 focus:ring-[var(--color-brand-primary)] text-[var(--color-text-primary)]"
                      autoFocus
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={handleAddComment}
                        disabled={!commentDraft.trim()}
                        className="flex-1 py-1 text-xs font-medium rounded-md bg-[var(--color-brand-primary)] text-white hover:bg-[var(--color-brand-primary-hover)] disabled:opacity-50 transition-colors"
                      >
                        Comentar
                      </button>
                      <button
                        onClick={handleHighlight}
                        className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md bg-yellow-50 text-yellow-700 border border-yellow-200 hover:bg-yellow-100 transition-colors"
                      >
                        <Highlighter className="w-3 h-3" /> Resaltar
                      </button>
                      <button
                        onClick={() => { setPendingSelection(null); setSelectionPos(null); setCommentDraft(''); }}
                        className="px-2 py-1 text-xs rounded-md border border-[var(--color-border-dim)] text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-bg)]"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-card)] border border-[var(--color-border-dim)] flex items-center justify-center mb-4 shadow-sm">
              <FileText className="w-8 h-8 text-[var(--color-text-tertiary)]" />
            </div>
            <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-1">Ningún documento seleccionado</h3>
            <p className="text-sm text-[var(--color-text-secondary)] max-w-sm">
              Seleccioná un borrador o documento del explorador a la izquierda para visualizarlo o editarlo.
            </p>
          </div>
        )}

        {/* Floating Chat Toggle Button */}
        <button
          onClick={() => setChatOpen(o => !o)}
          className={cn(
            'fixed bottom-6 right-6 z-30 w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all',
            chatOpen
              ? 'bg-[var(--color-text-secondary)] text-white hover:bg-[var(--color-text-primary)]'
              : 'bg-[var(--color-brand-primary)] text-white hover:bg-[var(--color-brand-primary-hover)]'
          )}
          title={chatOpen ? 'Cerrar asistente' : 'Abrir asistente Ali'}
        >
          {chatOpen ? <X className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
        </button>
      </div>

      {/* 3. Right Panel: AI Chat Sidebar — Ali Sub-agente */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="bg-[var(--color-surface-card)] border-l border-[var(--color-border-dim)] flex flex-col overflow-hidden shrink-0"
            style={{ minWidth: 0 }}
          >
            <div className={cn(
              'flex flex-col h-full',
              !selectedDoc && 'opacity-50 pointer-events-none grayscale'
            )}>
              {/* Chat header */}
              <div className="p-4 border-b border-[var(--color-border-dim)] bg-[var(--color-surface-bg)] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-600 border border-indigo-200 dark:border-indigo-500/20 shadow-sm">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Ali (Sub-agente)</h2>
                    <p className="text-xs text-[var(--color-text-secondary)]">Sub-agente del Coordinador</p>
                  </div>
                </div>
                <button
                  onClick={() => setChatOpen(false)}
                  className="p-1 rounded-md text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-card)] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[var(--color-surface-bg)]">
                {messages.map((msg) => (
                  <div key={msg.id} className={cn('flex flex-col max-w-[90%]', msg.role === 'user' ? 'ml-auto items-end' : 'mr-auto items-start')}>
                    <div className={cn(
                      'p-3 rounded-2xl text-sm shadow-sm',
                      msg.role === 'user'
                        ? 'bg-[var(--color-brand-primary)] text-white rounded-br-none'
                        : 'bg-[var(--color-surface-card)] border border-[var(--color-border-dim)] text-[var(--color-text-primary)] rounded-bl-none'
                    )}>
                      {msg.content}
                    </div>
                    <span className="text-[10px] text-[var(--color-text-tertiary)] mt-1 font-medium px-1">{msg.time}</span>
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="p-4 bg-[var(--color-surface-card)] border-t border-[var(--color-border-dim)] shrink-0">
                <div className="relative">
                  <textarea
                    value={chatMessage}
                    onChange={e => setChatMessage(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Consultá a Ali sobre el expediente..."
                    className="w-full bg-[var(--color-surface-bg)] border border-[var(--color-border-dim)] rounded-xl py-2.5 pl-3 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-primary)] resize-none text-[var(--color-text-primary)]"
                    rows={2}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!chatMessage.trim()}
                    className="absolute right-2 bottom-2.5 p-1.5 bg-[var(--color-brand-primary)] text-white rounded-lg hover:bg-[var(--color-brand-primary-hover)] disabled:opacity-50 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[10px] text-[var(--color-text-tertiary)] text-center mt-2">
                  Ali tiene visibilidad completa del expediente y su historial.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
