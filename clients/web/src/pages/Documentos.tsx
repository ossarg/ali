import { useState } from 'react';
import { FileText, Search, Folder, MessageSquare, Send, ChevronRight, FileDown, MoreVertical, Bot } from 'lucide-react';
import { cn } from '../lib/utils';
import { MOCK_CASES } from '../data/mockData';

// Mock Document Tree
const MOCK_DOCS = [
  ...MOCK_CASES.map(c => ({
    id: `folder-${c.id}`,
    name: `Caso #${c.id} - ${c.title.split(' ')[0]}`,
    type: 'folder',
    children: [
      { id: `doc-${c.id}-1`, name: 'Contestación_Borrador.docx', type: 'file', content: `Borrador de contestación para el caso ${c.id}.\n\nHechos:\nEn la fecha del siniestro, el vehículo asegurado transitaba por...` },
      { id: `doc-${c.id}-2`, name: 'Póliza_Original.pdf', type: 'file', content: `[Documento PDF en visor: Póliza de ${c.title}]` },
    ]
  }))
];

type Message = { id: string; role: 'user' | 'agent'; content: string; time: string };

export default function Documentos() {
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    'folder-4421': true,
  });
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'agent', content: 'Hola. He revisado el borrador de la contestación. ¿Hay algún punto específico que quieras que modifique o verifique contra la póliza?', time: '10:45 AM' }
  ]);
  const [editorContent, setEditorContent] = useState('');

  const toggleFolder = (id: string) => {
    setExpandedFolders(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSelectDoc = (doc: any) => {
    setSelectedDoc(doc);
    setEditorContent(doc.content);
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    
    // Add User Message
    const newUserMsg: Message = { id: Date.now().toString(), role: 'user', content: chatMessage, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) };
    setMessages(prev => [...prev, newUserMsg]);
    setChatMessage('');

    // Simulate Agent Reply
    setTimeout(() => {
      const agentReply: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'agent', 
        content: `Estoy ajustando el documento basado en tu comentario. En un momento verás los cambios reflejados en el editor.`, 
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
      };
      setMessages(prev => [...prev, agentReply]);
    }, 1000);
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] -m-8 border-t border-[var(--color-border-dim)]">
      
      {/* 1. Left Panel: File Explorer */}
      <div className="w-64 bg-[var(--color-surface-sidebar)] border-r border-[var(--color-border-dim)] flex flex-col hide-scrollbar">
        <div className="p-4 border-b border-[var(--color-border-dim)]">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">Explorador de Casos</h2>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
            <input 
              type="text" 
              placeholder="Buscar archivo..." 
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-[var(--color-border-dim)] rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-primary)]"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2">
          {MOCK_DOCS.map(folder => (
            <div key={folder.id} className="mb-1">
              <button 
                onClick={() => toggleFolder(folder.id)}
                className="w-full flex items-center gap-1.5 px-2 py-1.5 text-xs text-[var(--color-sidebar-text)] hover:bg-[var(--color-sidebar-bg-hover)] rounded-md transition-colors"
              >
                <ChevronRight className={cn("w-3.5 h-3.5 transition-transform", expandedFolders[folder.id] && "rotate-90")} />
                <Folder className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
                <span className="font-medium truncate">{folder.name}</span>
              </button>
              
              {expandedFolders[folder.id] && (
                <div className="ml-5 mt-0.5 space-y-0.5 border-l border-[var(--color-border-dim)] pl-2">
                  {folder.children.map((file: any) => (
                    <button
                      key={file.id}
                      onClick={() => handleSelectDoc(file)}
                      className={cn(
                        "w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded-md transition-colors",
                        selectedDoc?.id === file.id 
                          ? "bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] font-medium" 
                          : "text-[var(--color-sidebar-text)] hover:bg-[var(--color-sidebar-bg-hover)]"
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

      {/* 2. Center Panel: Document Editor */}
      <div className="flex-1 bg-[var(--color-surface-bg)] flex flex-col min-w-0 relative">
        {selectedDoc ? (
          <>
            {/* Toolbar */}
            <div className="h-14 border-b border-[var(--color-border-dim)] bg-white/50 backdrop-blur-sm flex items-center justify-between px-6 shrink-0">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-indigo-500" />
                <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">{selectedDoc.name}</h2>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-1.5 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] rounded-md hover:bg-[var(--color-surface-card)] transition-colors">
                  <FileDown className="w-4 h-4" />
                </button>
                <button className="p-1.5 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] rounded-md hover:bg-[var(--color-surface-card)] transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Editor Area */}
            <div className="flex-1 overflow-y-auto p-8">
              <div className="max-w-3xl mx-auto bg-white border border-[var(--color-border-dim)] shadow-sm min-h-[800px] p-12 rounded-sm cursor-text focus-within:ring-2 focus-within:ring-[var(--color-brand-primary)]/20 transition-all">
                <textarea
                  value={editorContent}
                  onChange={e => setEditorContent(e.target.value)}
                  className="w-full h-full min-h-[600px] resize-none outline-none text-[var(--color-text-primary)] leading-loose"
                  spellCheck="false"
                />
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-card)] border border-[var(--color-border-dim)] flex items-center justify-center mb-4 shadow-sm">
              <FileText className="w-8 h-8 text-[var(--color-text-tertiary)]" />
            </div>
            <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-1">Ningún documento seleccionado</h3>
            <p className="text-sm text-[var(--color-text-secondary)] max-w-sm">
              Selecciona un borrador o documento del explorador a la izquierda para visualizarlo o editarlo.
            </p>
          </div>
        )}
      </div>

      {/* 3. Right Panel: AI Chat Sidebar */}
      <div className={cn(
        "w-80 bg-white border-l border-[var(--color-border-dim)] flex flex-col transition-all duration-300",
        !selectedDoc && "opacity-50 pointer-events-none grayscale"
      )}>
        <div className="p-4 border-b border-[var(--color-border-dim)] bg-[#f8fafc] flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 border border-indigo-200 shadow-sm">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Mike (IA)</h2>
            <p className="text-xs text-[var(--color-text-secondary)]">Asistente de Redacción</p>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[var(--color-surface-bg)]">
          {messages.map((msg) => (
            <div key={msg.id} className={cn("flex flex-col max-w-[90%]", msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start")}>
              <div className={cn(
                "p-3 rounded-2xl text-sm shadow-sm",
                msg.role === 'user' 
                  ? "bg-[var(--color-brand-primary)] text-white rounded-br-none" 
                  : "bg-white border border-[var(--color-border-dim)] text-[var(--color-text-primary)] rounded-bl-none"
              )}>
                {msg.content}
              </div>
              <span className="text-[10px] text-[var(--color-text-tertiary)] mt-1 font-medium px-1">{msg.time}</span>
            </div>
          ))}
        </div>

        {/* Chat Input */}
        <div className="p-4 bg-white border-t border-[var(--color-border-dim)]">
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
              placeholder="Pidele a Mike que modifique algo..."
              className="w-full bg-[var(--color-surface-bg)] border border-[var(--color-border-dim)] rounded-xl py-2.5 pl-3 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-primary)] resize-none"
              rows={2}
            />
            <button 
              onClick={handleSendMessage}
              disabled={!chatMessage.trim()}
              className="absolute right-2 bottom-2.5 p-1.5 bg-[var(--color-brand-primary)] text-white rounded-lg hover:bg-[#d44d1e] disabled:opacity-50 disabled:hover:bg-[var(--color-brand-primary)] transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-[10px] text-[var(--color-text-tertiary)] text-center mt-2">
            Mike analiza tu instrucción y sugiere cambios en vivo.
          </p>
        </div>
      </div>
      
    </div>
  );
}
