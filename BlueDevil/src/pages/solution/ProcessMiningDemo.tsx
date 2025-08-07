import React, { useState, useEffect } from 'react';
import { FiFolder, FiFileText, FiEdit2, FiTrash2, FiPlus, FiChevronDown, FiChevronRight, FiSettings, FiTrendingUp, FiAlertTriangle, FiZap, FiBarChart, FiTarget, FiClock, FiActivity } from 'react-icons/fi';
import { DiagramEditor } from '../../components/DiagramEditor';
import axios from 'axios';

// --- Typen für Ordner/Prozessstruktur ---
interface ProcessFolder {
  id: string;
  name: string;
  folders: ProcessFolder[];
  processes: ProcessMeta[];
}

interface ProcessMeta {
  id: string;
  name: string;
}

interface DiagramStep {
  id: string;
  name: string;
  type: 'start' | 'task' | 'decision' | 'end';
  x: number;
  y: number;
}

interface DiagramData {
  steps: DiagramStep[];
  flows: { from: string; to: string }[];
}

interface ProcessMetrics {
  avgDuration: number;
  throughput: number;
  bottlenecks: number;
  efficiency: number;
}

interface AIInsight {
  id: string;
  type: 'bottleneck' | 'optimization' | 'automation';
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  recommendation: string;
  savings: string;
}

// --- Mock-Daten für Demo ---
const initialFolders: ProcessFolder[] = [
  {
    id: 'root-sales',
    name: 'Sales-Prozesse',
    folders: [],
    processes: [
      { id: 'lead-to-opportunity', name: 'Lead zu Opportunity' },
      { id: 'opportunity-to-deal', name: 'Opportunity zu Deal' },
    ],
  },
  {
    id: 'root-support',
    name: 'Support-Prozesse',
    folders: [],
    processes: [
      { id: 'ticket-to-resolution', name: 'Ticket zu Lösung' },
    ],
  },
];

const initialDiagrams: Record<string, DiagramData> = {
  'lead-to-opportunity': {
    steps: [
      { id: 'start', name: 'Lead eingegeben', type: 'start', x: 50, y: 100 },
      { id: 'qualify', name: 'Lead qualifizieren', type: 'task', x: 200, y: 100 },
      { id: 'decision', name: 'Qualified Lead?', type: 'decision', x: 350, y: 100 },
      { id: 'convert', name: 'Lead zu Opportunity', type: 'task', x: 500, y: 50 },
      { id: 'nurture', name: 'Lead nurturing', type: 'task', x: 500, y: 150 },
      { id: 'end', name: 'Opportunity erstellt', type: 'end', x: 650, y: 100 },
    ],
    flows: [
      { from: 'start', to: 'qualify' },
      { from: 'qualify', to: 'decision' },
      { from: 'decision', to: 'convert' },
      { from: 'decision', to: 'nurture' },
      { from: 'convert', to: 'end' },
      { from: 'nurture', to: 'end' },
    ],
  },
  'opportunity-to-deal': {
    steps: [
      { id: 'start', name: 'Opportunity erstellt', type: 'start', x: 50, y: 100 },
      { id: 'discovery', name: 'Discovery Call', type: 'task', x: 200, y: 100 },
      { id: 'demo', name: 'Demo durchführen', type: 'task', x: 350, y: 100 },
      { id: 'proposal', name: 'Proposal erstellen', type: 'task', x: 500, y: 100 },
      { id: 'negotiation', name: 'Verhandlung', type: 'task', x: 650, y: 100 },
      { id: 'close', name: 'Deal abschließen', type: 'task', x: 800, y: 100 },
      { id: 'end', name: 'Deal gewonnen', type: 'end', x: 950, y: 100 },
    ],
    flows: [
      { from: 'start', to: 'discovery' },
      { from: 'discovery', to: 'demo' },
      { from: 'demo', to: 'proposal' },
      { from: 'proposal', to: 'negotiation' },
      { from: 'negotiation', to: 'close' },
      { from: 'close', to: 'end' },
    ],
  },
  'ticket-to-resolution': {
    steps: [
      { id: 'start', name: 'Ticket erstellt', type: 'start', x: 50, y: 100 },
      { id: 'assign', name: 'Ticket zuweisen', type: 'task', x: 200, y: 100 },
      { id: 'work', name: 'Bearbeitung', type: 'task', x: 350, y: 100 },
      { id: 'end', name: 'Ticket gelöst', type: 'end', x: 500, y: 100 },
    ],
    flows: [
      { from: 'start', to: 'assign' },
      { from: 'assign', to: 'work' },
      { from: 'work', to: 'end' },
    ],
  },
};

// --- Mock-Metriken und AI-Insights ---
const processMetrics: Record<string, ProcessMetrics> = {
  'lead-to-opportunity': {
    avgDuration: 8.5,
    throughput: 35,
    bottlenecks: 2,
    efficiency: 72,
  },
  'opportunity-to-deal': {
    avgDuration: 45.2,
    throughput: 12,
    bottlenecks: 3,
    efficiency: 65,
  },
  'ticket-to-resolution': {
    avgDuration: 2.1,
    throughput: 85,
    bottlenecks: 1,
    efficiency: 88,
  },
};

const aiInsights: Record<string, AIInsight[]> = {
  'lead-to-opportunity': [
    {
      id: '1',
      type: 'bottleneck',
      severity: 'high',
      title: 'Lead Qualifizierung ist Engpass',
      description: 'Durchschnittliche Bearbeitungszeit: 2.5 Tage bei 85% Durchlaufrate',
      recommendation: 'Implementierung von AI-basiertem Lead Scoring',
      savings: '€15.000/Jahr',
    },
    {
      id: '2',
      type: 'automation',
      severity: 'medium',
      title: 'Automatisierte Lead-Konvertierung',
      description: 'Manuelle Konvertierung von qualifizierten Leads',
      recommendation: 'Workflow-Automatisierung mit Approval-Gates',
      savings: '€8.500/Jahr',
    },
  ],
  'opportunity-to-deal': [
    {
      id: '1',
      type: 'bottleneck',
      severity: 'high',
      title: 'Proposal-Erstellung blockiert Deals',
      description: '4.5 Tage durchschnittliche Erstellungszeit',
      recommendation: 'AI-gestützte Proposal-Generierung mit Templates',
      savings: '€25.000/Jahr',
    },
  ],
  'ticket-to-resolution': [
    {
      id: '1',
      type: 'optimization',
      severity: 'medium',
      title: 'Ticket-Zuweisung optimierbar',
      description: 'Manuelle Zuweisung führt zu Verzögerungen',
      recommendation: 'AI-basierte automatische Ticket-Routing',
      savings: '€12.000/Jahr',
    },
  ],
};

const WEBHOOK_URL = 'http://localhost:5678/webhook-test/bc706961-5b3a-4634-9e5b-bd67800126e8';

function generateId(prefix: string) {
  return prefix + '-' + Math.random().toString(36).slice(2, 8);
}

// --- Modal-Komponente für Prozessgenerierung ---
function ProcessGenerateModal({ open, onClose, onGenerate, isLoading, error }: {
  open: boolean,
  onClose: () => void,
  onGenerate: (text: string, sources: string[]) => void,
  isLoading: boolean,
  error: string
}) {
  const [textInput, setTextInput] = useState('');
  const [sources, setSources] = useState<string[]>([]);
  const [newSource, setNewSource] = useState('');
  const [knowledgeSearch, setKnowledgeSearch] = useState('');
  const [knowledgeResults, setKnowledgeResults] = useState<string[]>([]);

  useEffect(() => {
    if (!open) {
      setTextInput('');
      setSources([]);
      setNewSource('');
      setKnowledgeSearch('');
      setKnowledgeResults([]);
    }
  }, [open]);

  const handleKnowledgeSearch = async () => {
    setKnowledgeResults([
      'https://wiki.example.com/prozess1',
      'https://dokumente.example.com/leitfaden.pdf',
      'https://intranet.example.com/ablaufbeschreibung'
    ].filter(link => link.includes(knowledgeSearch)));
  };
  const handleAddSource = (src: string) => {
    if (src && !sources.includes(src)) {
      setSources([...sources, src]);
      setNewSource('');
    }
  };
  const handleRemoveSource = (src: string) => setSources(sources.filter(s => s !== src));

  return open ? (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <h3 className="text-lg font-bold mb-4">Prozess generieren (KI-gestützt)</h3>
        <label className="block font-semibold mb-2">Prozessbeschreibung (Freitext):</label>
        <textarea
          className="w-full border rounded p-2 mb-2 min-h-[80px]"
          value={textInput}
          onChange={e => setTextInput(e.target.value)}
          placeholder="Beschreibe den Prozess in eigenen Worten..."
        />
        <div className="mb-2">
          <label className="block font-semibold mb-1">Quellen-Links:</label>
          <div className="flex gap-2 mb-2">
            <input
              className="flex-1 border rounded p-2"
              value={newSource}
              onChange={e => setNewSource(e.target.value)}
              placeholder="https://..."
              onKeyDown={e => { if (e.key === 'Enter') { handleAddSource(newSource); }}}
            />
            <button
              className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
              onClick={() => handleAddSource(newSource)}
            >Hinzufügen</button>
          </div>
          <ul className="mb-2">
            {sources.map(src => (
              <li key={src} className="flex items-center gap-2 text-sm mb-1">
                <a href={src} target="_blank" rel="noopener noreferrer" className="underline text-blue-700 flex-1">{src}</a>
                <button className="text-red-500 hover:underline" onClick={() => handleRemoveSource(src)}>Entfernen</button>
              </li>
            ))}
          </ul>
        </div>
        <div className="mb-2">
          <label className="block font-semibold mb-1">Knowledge-Suche (optional):</label>
          <div className="flex gap-2 mb-2">
            <input
              className="flex-1 border rounded p-2"
              value={knowledgeSearch}
              onChange={e => setKnowledgeSearch(e.target.value)}
              placeholder="Suchbegriff..."
            />
            <button
              className="bg-gray-600 text-white px-3 py-2 rounded hover:bg-gray-700"
              onClick={handleKnowledgeSearch}
            >Suchen</button>
          </div>
          {knowledgeResults.length > 0 && (
            <div className="mb-2">
              <div className="text-xs text-gray-500 mb-1">Suchergebnisse:</div>
              <ul>
                {knowledgeResults.map(link => (
                  <li key={link} className="flex items-center gap-2 text-xs mb-1">
                    <span className="flex-1">{link}</span>
                    <button className="text-blue-600 hover:underline" onClick={() => handleAddSource(link)}>Als Quelle übernehmen</button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        {error && <div className="text-red-600 mt-2">{error}</div>}
        <div className="flex justify-end gap-2 mt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >Abbrechen</button>
          <button
            onClick={() => onGenerate(textInput, sources)}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            disabled={isLoading || !textInput.trim()}
          >{isLoading ? 'Generiere...' : 'Prozess generieren'}</button>
        </div>
      </div>
    </div>
  ) : null;
}

const ProcessMiningDemo: React.FC = () => {
  const [folders, setFolders] = useState<ProcessFolder[]>(initialFolders);
  const [selectedProcessId, setSelectedProcessId] = useState<string>('lead-to-opportunity');
  const [sidebarAction, setSidebarAction] = useState<{ type: string; targetId?: string } | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [tab, setTab] = useState<'view' | 'edit'>('view');
  const [diagrams, setDiagrams] = useState<Record<string, DiagramData>>(initialDiagrams);
  const [draggedStep, setDraggedStep] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [sources, setSources] = useState<string[]>([]);
  const [newSource, setNewSource] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [diagramData, setDiagramData] = useState<any | null>(null);
  const [knowledgeSearch, setKnowledgeSearch] = useState('');
  const [knowledgeResults, setKnowledgeResults] = useState<string[]>([]);
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  // Dummy Knowledge Search (hier kann später echte Suche angebunden werden)
  const handleKnowledgeSearch = async () => {
    // Simuliere Suchergebnisse
    setKnowledgeResults([
      'https://wiki.example.com/prozess1',
      'https://dokumente.example.com/leitfaden.pdf',
      'https://intranet.example.com/ablaufbeschreibung'
    ].filter(link => link.includes(knowledgeSearch)));
  };

  const handleAddSource = (src: string) => {
    if (src && !sources.includes(src)) {
      setSources([...sources, src]);
      setNewSource('');
    }
  };
  const handleRemoveSource = (src: string) => setSources(sources.filter(s => s !== src));

  const handleGenerateProcess = async (text: string, sources: string[]) => {
    setIsLoading(true);
    setError('');
    if (typeof text !== 'string') {
      setError('Interner Fehler: Text ist kein String!');
      setIsLoading(false);
      return;
    }
    try {
      // Kombiniere Text und Quellen als Klartext
      let body = text.trim();
      if (sources.length > 0) {
        body += '\n\nQuellen:\n' + sources.map(s => '- ' + s).join('\n');
      }
      const res = await axios.post(WEBHOOK_URL, body, {
        headers: { 'Content-Type': 'text/plain' },
      });
      console.log('[API-Response]', res.data);

      // Diagramm-JSON aus content parsen
      let diagram = res.data;
      if (diagram?.message?.content) {
        try {
          diagram = JSON.parse(diagram.message.content);
        } catch (e) {
          setError('Fehler beim Parsen des Diagramm-JSON aus content!');
          setIsLoading(false);
          return;
        }
      }
      // Defensive: Füge Positionen hinzu, falls sie fehlen und mappe auf React Flow Format
      if (diagram?.nodes) {
        diagram.nodes = diagram.nodes.map((node: any, i: number) => ({
          id: node.id || `node-${i}`,
          type: mapNodeType(node.type),
          position: node.position && typeof node.position.x === 'number' && typeof node.position.y === 'number'
            ? node.position
            : { x: 100 + i * 100, y: 100 },
          data: {
            label: node.label || node.description || node.id || `Node ${i+1}`,
            description: node.description || ''
          }
        }));
      }
      if (diagram?.links) {
        diagram.edges = diagram.links.map((link: any, i: number) => ({
          id: link.id || `e${i}`,
          source: link.source,
          target: link.target,
          type: 'smoothstep',
          label: link.condition || undefined
        }));
        delete diagram.links;
      }
      function mapNodeType(type: string) {
        switch ((type || '').toLowerCase()) {
          case 'startevent': return 'input';
          case 'endevent': return 'output';
          case 'gateway':
          case 'parallelgateway': return 'decision';
          case 'usertask':
          case 'timerevent':
          case 'processtask':
            return 'process';
          default: return 'default';
        }
      }
      console.log('[DiagramEditor-prop nach Parsing]', diagram);
      setDiagramData(diagram);
    } catch (e: any) {
      setError(e?.response?.data || e.message || 'Fehler beim Generieren');
    } finally {
      setIsLoading(false);
    }
  };

  // Logge diagramData bei Änderung
  useEffect(() => {
    if (diagramData) {
      console.log('[DiagramEditor-prop]', diagramData);
    }
  }, [diagramData]);

  // --- Sidebar-Logik ---
  const renderFolder = (folder: ProcessFolder, depth = 0) => (
    <div key={folder.id} className={`mb-2 ml-${depth * 2}`}>
      <div className="flex items-center gap-1 group">
        <FiFolder className="text-blue-700" />
        <span className="font-semibold text-blue-900">{folder.name}</span>
        <button className="opacity-0 group-hover:opacity-100 text-xs text-blue-600 hover:underline" onClick={() => setSidebarAction({ type: 'rename-folder', targetId: folder.id })}><FiEdit2 /></button>
        <button className="opacity-0 group-hover:opacity-100 text-xs text-red-600 hover:underline" onClick={() => setSidebarAction({ type: 'delete-folder', targetId: folder.id })}><FiTrash2 /></button>
        <button className="opacity-0 group-hover:opacity-100 text-xs text-green-600 hover:underline" onClick={() => setSidebarAction({ type: 'add-process', targetId: folder.id })}><FiPlus /></button>
        <button className="opacity-0 group-hover:opacity-100 text-xs text-green-700 hover:underline" onClick={() => setSidebarAction({ type: 'add-folder', targetId: folder.id })}><FiFolder /></button>
      </div>
      <div className="ml-4 mt-1">
        {folder.processes.map(proc => (
          <div key={proc.id} className={`flex items-center gap-1 cursor-pointer px-2 py-1 rounded transition-all ${selectedProcessId === proc.id ? 'bg-blue-100 font-bold' : 'hover:bg-blue-50'}`}
            onClick={() => setSelectedProcessId(proc.id)}>
            <FiFileText className="text-gray-700" />
            <span>{proc.name}</span>
            <button className="opacity-0 group-hover:opacity-100 text-xs text-blue-600 hover:underline" onClick={e => { e.stopPropagation(); setSidebarAction({ type: 'rename-process', targetId: proc.id }); }}><FiEdit2 /></button>
            <button className="opacity-0 group-hover:opacity-100 text-xs text-red-600 hover:underline" onClick={e => { e.stopPropagation(); setSidebarAction({ type: 'delete-process', targetId: proc.id }); }}><FiTrash2 /></button>
          </div>
        ))}
        {folder.folders.map(f => renderFolder(f, depth + 1))}
      </div>
    </div>
  );

  // --- Sidebar-Aktionen ---
  const handleSidebarAction = () => {
    if (!sidebarAction) return;
    let newFolders = JSON.parse(JSON.stringify(folders));
    if (sidebarAction.type === 'add-process' && sidebarAction.targetId) {
      const name = inputValue.trim() || 'Neuer Prozess';
      const id = generateId('proc');
      const addProcess = (folders: ProcessFolder[]): boolean => {
        for (const folder of folders) {
          if (folder.id === sidebarAction.targetId) {
            folder.processes.push({ id, name });
            return true;
          }
          if (addProcess(folder.folders)) return true;
        }
        return false;
      };
      addProcess(newFolders);
      setFolders(newFolders);
      setSidebarAction(null);
      setInputValue('');
    }
    if (sidebarAction.type === 'add-folder' && sidebarAction.targetId) {
      const name = inputValue.trim() || 'Neuer Ordner';
      const id = generateId('folder');
      const addFolder = (folders: ProcessFolder[]): boolean => {
        for (const folder of folders) {
          if (folder.id === sidebarAction.targetId) {
            folder.folders.push({ id, name, folders: [], processes: [] });
            return true;
          }
          if (addFolder(folder.folders)) return true;
        }
        return false;
      };
      addFolder(newFolders);
      setFolders(newFolders);
      setSidebarAction(null);
      setInputValue('');
    }
    if (sidebarAction.type === 'rename-folder' && sidebarAction.targetId) {
      const rename = (folders: ProcessFolder[]): boolean => {
        for (const folder of folders) {
          if (folder.id === sidebarAction.targetId) {
            folder.name = inputValue.trim() || folder.name;
            return true;
          }
          if (rename(folder.folders)) return true;
        }
        return false;
      };
      rename(newFolders);
      setFolders(newFolders);
      setSidebarAction(null);
      setInputValue('');
    }
    if (sidebarAction.type === 'rename-process' && sidebarAction.targetId) {
      const rename = (folders: ProcessFolder[]): boolean => {
        for (const folder of folders) {
          for (const proc of folder.processes) {
            if (proc.id === sidebarAction.targetId) {
              proc.name = inputValue.trim() || proc.name;
              return true;
            }
          }
          if (rename(folder.folders)) return true;
        }
        return false;
      };
      rename(newFolders);
      setFolders(newFolders);
      setSidebarAction(null);
      setInputValue('');
    }
    if (sidebarAction.type === 'delete-folder' && sidebarAction.targetId) {
      const del = (folders: ProcessFolder[]): boolean => {
        for (let i = 0; i < folders.length; i++) {
          if (folders[i].id === sidebarAction.targetId) {
            folders.splice(i, 1);
            return true;
          }
          if (del(folders[i].folders)) return true;
        }
        return false;
      };
      del(newFolders);
      setFolders(newFolders);
      setSidebarAction(null);
    }
    if (sidebarAction.type === 'delete-process' && sidebarAction.targetId) {
      const del = (folders: ProcessFolder[]): boolean => {
        for (const folder of folders) {
          for (let i = 0; i < folder.processes.length; i++) {
            if (folder.processes[i].id === sidebarAction.targetId) {
              folder.processes.splice(i, 1);
              return true;
            }
          }
          if (del(folder.folders)) return true;
        }
        return false;
      };
      del(newFolders);
      setFolders(newFolders);
      setSidebarAction(null);
    }
  };

  // --- Diagramm-Editor-Logik ---
  const currentDiagram = diagrams[selectedProcessId];
  const setCurrentDiagram = (d: DiagramData) => setDiagrams({ ...diagrams, [selectedProcessId]: d });

  const handleStepDragStart = (id: string, e: React.MouseEvent) => {
    setDraggedStep(id);
    setDragOffset({ x: e.clientX, y: e.clientY });
  };
  const handleStepDrag = (e: React.MouseEvent) => {
    if (!draggedStep || !dragOffset) return;
    const dx = e.clientX - dragOffset.x;
    const dy = e.clientY - dragOffset.y;
    setDragOffset({ x: e.clientX, y: e.clientY });
    setCurrentDiagram({
      ...currentDiagram,
      steps: currentDiagram.steps.map(s =>
        s.id === draggedStep ? { ...s, x: s.x + dx, y: s.y + dy } : s
      ),
    });
  };
  const handleStepDragEnd = () => {
    setDraggedStep(null);
    setDragOffset(null);
  };

  const addStep = (type: DiagramStep['type']) => {
    const id = generateId('step');
    setCurrentDiagram({
      ...currentDiagram,
      steps: [
        ...currentDiagram.steps,
        { id, name: 'Neuer Schritt', type, x: 100, y: 200 },
      ],
    });
  };
  const deleteStep = (id: string) => {
    setCurrentDiagram({
      ...currentDiagram,
      steps: currentDiagram.steps.filter(s => s.id !== id),
      flows: currentDiagram.flows.filter(f => f.from !== id && f.to !== id),
    });
  };

  // --- AI-Analyse Simulation ---
  const runAIAnalysis = async () => {
    setIsAnalyzing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setAnalysisComplete(true);
    setIsAnalyzing(false);
  };

  // --- Aktuelle Daten ---
  const currentProcess = folders.flatMap(f => f.processes).find(p => p.id === selectedProcessId);
  const currentMetrics = processMetrics[selectedProcessId];
  const currentInsights = aiInsights[selectedProcessId] || [];

  // Extrahiere aktuelle Nodes für Step-Liste
  const currentNodes = (diagramData && diagramData.nodes) ? diagramData.nodes : (diagrams[selectedProcessId]?.steps ? diagrams[selectedProcessId].steps.map((step: any, i: number) => ({
    id: step.id || `step-${i}`,
    data: { label: step.name, description: step.type },
    type: step.type || 'default',
  })) : []);

  // Neue Handler für Modal
  const handleOpenGenerateModal = () => setShowGenerateModal(true);
  const handleCloseGenerateModal = () => setShowGenerateModal(false);
  const handleModalGenerate = async (text: string, sources: string[]) => {
    setShowGenerateModal(false);
    setTextInput(text); // für Konsistenz
    setSources(sources);
    await handleGenerateProcess(text, sources);
  };

  // --- Hauptbereich ---
  return (
    <div className="flex h-[90vh]">
      {/* Sidebar */}
      <div className="w-72 bg-gray-50 border-r p-4 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <span className="font-bold text-lg">Prozesse & Ordner</span>
          <button className="bg-blue-600 text-white px-2 py-1 rounded text-xs flex items-center gap-1" onClick={() => setSidebarAction({ type: 'add-folder' })}><FiPlus /> Ordner</button>
        </div>
        <div>{folders.map(f => renderFolder(f))}</div>
      </div>
      {/* Hauptbereich */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="flex gap-4 mb-4">
          <button className={`px-4 py-2 rounded-t ${tab === 'view' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`} onClick={() => setTab('view')}>Prozess-Ansicht</button>
          <button className={`px-4 py-2 rounded-t ${tab === 'edit' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`} onClick={() => setTab('edit')}>Diagramm-Editor</button>
        </div>
        {tab === 'view' && currentProcess && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">{currentProcess.name}</h1>
              <button 
                onClick={runAIAnalysis}
                disabled={isAnalyzing}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 flex items-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    AI analysiert...
                  </>
                ) : (
                  <>
                    <FiActivity />
                    AI-Analyse starten
                  </>
                )}
              </button>
            </div>

            {/* Metriken Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Durchschnittliche Dauer</p>
                    <p className="text-2xl font-bold text-blue-800">{currentMetrics?.avgDuration || 0} Tage</p>
                  </div>
                  <FiClock className="text-blue-500 text-xl" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 font-medium">Durchlaufrate</p>
                    <p className="text-2xl font-bold text-green-800">{currentMetrics?.throughput || 0}%</p>
                  </div>
                  <FiTrendingUp className="text-green-500 text-xl" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-600 font-medium">Engpässe</p>
                    <p className="text-2xl font-bold text-red-800">{currentMetrics?.bottlenecks || 0}</p>
                  </div>
                  <FiAlertTriangle className="text-red-500 text-xl" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600 font-medium">Effizienz</p>
                    <p className="text-2xl font-bold text-purple-800">{currentMetrics?.efficiency || 0}%</p>
                  </div>
                  <FiBarChart className="text-purple-500 text-xl" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Prozess-Visualisierung */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <FiBarChart />
                  Prozess-Visualisierung
                </h2>
                <div className="relative h-64 bg-gray-50 rounded border overflow-hidden">
                  {currentDiagram?.steps.map((step) => (
                    <div
                      key={step.id}
                      className={`absolute border-2 p-2 ${
                        step.type === 'start' || step.type === 'end' ? 'bg-gray-100 border-gray-400 rounded-full' :
                        step.type === 'decision' ? 'bg-yellow-100 border-yellow-400 rotate-45' :
                        'bg-blue-100 border-blue-400 rounded'
                      }`}
                      style={{ 
                        left: step.x * 0.3, 
                        top: step.y * 0.3, 
                        width: 80, 
                        height: 40,
                        transform: step.type === 'decision' ? 'rotate(45deg)' : undefined
                      }}
                    >
                      <div className="text-xs text-center font-medium" style={{ transform: step.type === 'decision' ? 'rotate(-45deg)' : undefined }}>
                        {step.name}
                      </div>
                    </div>
                  ))}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    {currentDiagram?.flows.map((flow, idx) => {
                      const from = currentDiagram.steps.find(s => s.id === flow.from);
                      const to = currentDiagram.steps.find(s => s.id === flow.to);
                      if (!from || !to) return null;
                      const x1 = from.x * 0.3 + 80;
                      const y1 = from.y * 0.3 + 20;
                      const x2 = to.x * 0.3;
                      const y2 = to.y * 0.3 + 20;
                      return (
                        <g key={idx}>
                          <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#3B82F6" strokeWidth="2" markerEnd="url(#arrowhead)" />
                        </g>
                      );
                    })}
                    <defs>
                      <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill="#3B82F6" />
                      </marker>
                    </defs>
                  </svg>
                </div>
              </div>

              {/* AI-Insights */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <FiZap />
                  AI-Insights
                </h2>
                {isAnalyzing && (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">AI analysiert Prozessdaten...</p>
                  </div>
                )}
                {analysisComplete && (
                  <div className="space-y-3">
                    {currentInsights.map((insight) => (
                      <div key={insight.id} className={`p-3 rounded border-l-4 ${
                        insight.severity === 'high' ? 'border-red-500 bg-red-50' :
                        insight.severity === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                        'border-blue-500 bg-blue-50'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-sm">{insight.title}</h3>
                          <span className={`text-xs px-2 py-1 rounded ${
                            insight.severity === 'high' ? 'bg-red-200 text-red-800' :
                            insight.severity === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                            'bg-blue-200 text-blue-800'
                          }`}>
                            {insight.severity}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{insight.description}</p>
                        <div className="text-xs">
                          <strong>Empfehlung:</strong> {insight.recommendation}
                        </div>
                        <div className="text-xs mt-1 text-green-700 font-semibold">
                          💰 {insight.savings}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {!isAnalyzing && !analysisComplete && (
                  <div className="text-center py-8 text-gray-500">
                    <FiZap className="text-4xl mx-auto mb-4 text-gray-300" />
                    <p>Klicken Sie auf "AI-Analyse starten" um Prozessoptimierungen zu erhalten</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {tab === 'edit' && (
          <div className="p-6 max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">BPMN Diagram Analysis (KI-gestützt)</h1>
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">Prozess-Editor</h2>
                <button
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-semibold"
                  onClick={handleOpenGenerateModal}
                >Prozess generieren</button>
              </div>
              <label className="block font-semibold mb-2">Prozessbeschreibung (Freitext):</label>
              <textarea
                className="w-full border rounded p-2 mb-2 min-h-[80px]"
                value={textInput}
                onChange={e => setTextInput(e.target.value)}
                placeholder="Beschreibe den Prozess in eigenen Worten..."
              />
              <div className="mb-2">
                <label className="block font-semibold mb-1">Quellen-Links:</label>
                <div className="flex gap-2 mb-2">
                  <input
                    className="flex-1 border rounded p-2"
                    value={newSource}
                    onChange={e => setNewSource(e.target.value)}
                    placeholder="https://..."
                    onKeyDown={e => { if (e.key === 'Enter') { handleAddSource(newSource); }}}
                  />
                  <button
                    className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
                    onClick={() => handleAddSource(newSource)}
                  >Hinzufügen</button>
                </div>
                <ul className="mb-2">
                  {sources.map(src => (
                    <li key={src} className="flex items-center gap-2 text-sm mb-1">
                      <a href={src} target="_blank" rel="noopener noreferrer" className="underline text-blue-700 flex-1">{src}</a>
                      <button className="text-red-500 hover:underline" onClick={() => handleRemoveSource(src)}>Entfernen</button>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mb-2">
                <label className="block font-semibold mb-1">Knowledge-Suche (optional):</label>
                <div className="flex gap-2 mb-2">
                  <input
                    className="flex-1 border rounded p-2"
                    value={knowledgeSearch}
                    onChange={e => setKnowledgeSearch(e.target.value)}
                    placeholder="Suchbegriff..."
                  />
                  <button
                    className="bg-gray-600 text-white px-3 py-2 rounded hover:bg-gray-700"
                    onClick={handleKnowledgeSearch}
                  >Suchen</button>
                </div>
                {knowledgeResults.length > 0 && (
                  <div className="mb-2">
                    <div className="text-xs text-gray-500 mb-1">Suchergebnisse:</div>
                    <ul>
                      {knowledgeResults.map(link => (
                        <li key={link} className="flex items-center gap-2 text-xs mb-1">
                          <span className="flex-1">{link}</span>
                          <button className="text-blue-600 hover:underline" onClick={() => handleAddSource(link)}>Als Quelle übernehmen</button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <button
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-semibold mt-2"
                onClick={() => handleModalGenerate(textInput, sources)}
                disabled={isLoading || !textInput.trim()}
              >{isLoading ? 'Generiere...' : 'Prozess generieren'}</button>
              {error && <div className="text-red-600 mt-2">{error}</div>}
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold mb-4">Diagramm-Editor</h2>
              {diagramData ? (
                <div className="h-[600px] border rounded-lg overflow-hidden">
                  <DiagramEditor key={JSON.stringify(diagramData)} initialData={diagramData} />
                </div>
              ) : (
                <div className="text-gray-400 italic">Noch kein Diagramm generiert.</div>
              )}
            </div>
          </div>
        )}
      </div>
      {/* Modal für Sidebar-Aktionen */}
      {sidebarAction && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="font-semibold mb-2">
              {sidebarAction.type === 'add-folder' && 'Neuen Ordner anlegen'}
              {sidebarAction.type === 'add-process' && 'Neuen Prozess anlegen'}
              {sidebarAction.type === 'rename-folder' && 'Ordner umbenennen'}
              {sidebarAction.type === 'rename-process' && 'Prozess umbenennen'}
              {sidebarAction.type === 'delete-folder' && 'Ordner löschen?'}
              {sidebarAction.type === 'delete-process' && 'Prozess löschen?'}
            </h3>
            {(sidebarAction.type === 'add-folder' || sidebarAction.type === 'add-process' || sidebarAction.type === 'rename-folder' || sidebarAction.type === 'rename-process') && (
              <input
                className="border rounded px-3 py-2 w-full mb-4"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder="Name eingeben"
                autoFocus
              />
            )}
            <div className="flex gap-2 justify-end">
              <button className="px-3 py-1 rounded bg-gray-200" onClick={() => { setSidebarAction(null); setInputValue(''); }}>Abbrechen</button>
              <button className="px-3 py-1 rounded bg-blue-600 text-white" onClick={handleSidebarAction}>OK</button>
            </div>
          </div>
        </div>
      )}
      {(tab === 'edit' || tab === 'view') && (
        <ProcessGenerateModal
          open={showGenerateModal}
          onClose={handleCloseGenerateModal}
          onGenerate={handleModalGenerate}
          isLoading={isLoading}
          error={error}
        />
      )}
    </div>
  );
};

export default ProcessMiningDemo; 