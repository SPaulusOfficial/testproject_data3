import React, { useState, useCallback, useMemo, useEffect } from 'react'
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  Panel,
  useReactFlow,
  ReactFlowProvider,
  ConnectionMode,
  Handle,
  Position,
} from 'reactflow'
import 'reactflow/dist/style.css'
import dagre from 'dagre'
import { 
  Plus, 
  Save, 
  Download, 
  Upload, 
  RotateCcw, 
  LayoutGrid,
  Settings,
  Trash2,
  Copy,
  Edit3
} from 'lucide-react'

// Node Types
const nodeTypes = {
  default: DefaultNode,
  input: InputNode,
  output: OutputNode,
  process: ProcessNode,
  decision: DecisionNode,
}

// Custom Node Components
function DefaultNode({ data }: { data: any }) {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-gray-200 relative">
      <div className="flex items-center">
        <div className="rounded-full w-12 h-12 flex items-center justify-center bg-gray-100">
          <span className="text-gray-600 font-bold">{data.label}</span>
        </div>
        <div className="ml-2">
          <div className="text-lg font-bold">{data.label}</div>
          <div className="text-gray-500">{data.description}</div>
        </div>
      </div>
      {/* Connection handles */}
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-blue-500 border-2 border-white" />
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-blue-500 border-2 border-white" />
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-blue-500 border-2 border-white" />
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-blue-500 border-2 border-white" />
    </div>
  )
}

function InputNode({ data }: { data: any }) {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-green-50 border-2 border-green-200 relative">
      <div className="flex items-center">
        <div className="rounded-full w-12 h-12 flex items-center justify-center bg-green-100">
          <span className="text-green-600 font-bold">IN</span>
        </div>
        <div className="ml-2">
          <div className="text-lg font-bold text-green-800">{data.label}</div>
          <div className="text-green-600">{data.description}</div>
        </div>
      </div>
      {/* Connection handles - only output for input nodes */}
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-green-500 border-2 border-white" />
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-green-500 border-2 border-white" />
    </div>
  )
}

function OutputNode({ data }: { data: any }) {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-blue-50 border-2 border-blue-200 relative">
      <div className="flex items-center">
        <div className="rounded-full w-12 h-12 flex items-center justify-center bg-blue-100">
          <span className="text-blue-600 font-bold">OUT</span>
        </div>
        <div className="ml-2">
          <div className="text-lg font-bold text-blue-800">{data.label}</div>
          <div className="text-blue-600">{data.description}</div>
        </div>
      </div>
      {/* Connection handles - only input for output nodes */}
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-blue-500 border-2 border-white" />
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-blue-500 border-2 border-white" />
    </div>
  )
}

function ProcessNode({ data }: { data: any }) {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-purple-50 border-2 border-purple-200 relative">
      <div className="flex items-center">
        <div className="rounded-full w-12 h-12 flex items-center justify-center bg-purple-100">
          <span className="text-purple-600 font-bold">P</span>
        </div>
        <div className="ml-2">
          <div className="text-lg font-bold text-purple-800">{data.label}</div>
          <div className="text-purple-600">{data.description}</div>
        </div>
      </div>
      {/* Connection handles */}
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-purple-500 border-2 border-white" />
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-purple-500 border-2 border-white" />
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-purple-500 border-2 border-white" />
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-purple-500 border-2 border-white" />
    </div>
  )
}

function DecisionNode({ data }: { data: any }) {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-orange-50 border-2 border-orange-200 relative">
      <div className="flex items-center">
        <div className="rounded-full w-12 h-12 flex items-center justify-center bg-orange-100">
          <span className="text-orange-600 font-bold">?</span>
        </div>
        <div className="ml-2">
          <div className="text-lg font-bold text-orange-800">{data.label}</div>
          <div className="text-orange-600">{data.description}</div>
        </div>
      </div>
      {/* Connection handles */}
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-orange-500 border-2 border-white" />
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-orange-500 border-2 border-white" />
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-orange-500 border-2 border-white" />
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-orange-500 border-2 border-white" />
    </div>
  )
}

// Auto Layout Function
const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph()
  dagreGraph.setDefaultEdgeLabel(() => ({}))
  dagreGraph.setGraph({
    rankdir: direction,
    ranksep: 120, // vertikaler Abstand
    nodesep: 80   // horizontaler Abstand
  })

  // Add nodes to dagre graph
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 200, height: 100 })
  })

  // Add edges to dagre graph
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target)
  })

  // Calculate layout
  dagre.layout(dagreGraph)

  // Get positioned nodes
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id)
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWithPosition.width / 2,
        y: nodeWithPosition.y - nodeWithPosition.height / 2,
      },
    }
  })

  return { nodes: layoutedNodes, edges }
}

// Example Data for BPMN Process
const exampleNodes: Node[] = [
  {
    id: 'start',
    type: 'input',
    position: { x: 100, y: 100 },
    data: { label: 'Lead eingegeben', description: 'Start des Prozesses' },
  },
  {
    id: 'qualify',
    type: 'process',
    position: { x: 300, y: 100 },
    data: { label: 'Lead qualifizieren', description: 'Qualifizierung des Leads' },
  },
  {
    id: 'decision',
    type: 'decision',
    position: { x: 500, y: 100 },
    data: { label: 'Qualified Lead?', description: 'Entscheidungspunkt' },
  },
  {
    id: 'convert',
    type: 'process',
    position: { x: 700, y: 50 },
    data: { label: 'Lead zu Opportunity', description: 'Konvertierung' },
  },
  {
    id: 'nurture',
    type: 'process',
    position: { x: 700, y: 150 },
    data: { label: 'Lead nurturing', description: 'Lead-Pflege' },
  },
  {
    id: 'end',
    type: 'output',
    position: { x: 900, y: 100 },
    data: { label: 'Opportunity erstellt', description: 'Ende des Prozesses' },
  },
]

const exampleEdges: Edge[] = [
  { id: 'e1', source: 'start', target: 'qualify', type: 'smoothstep' },
  { id: 'e2', source: 'qualify', target: 'decision', type: 'smoothstep' },
  { id: 'e3', source: 'decision', target: 'convert', type: 'smoothstep' },
  { id: 'e4', source: 'decision', target: 'nurture', type: 'smoothstep' },
  { id: 'e5', source: 'convert', target: 'end', type: 'smoothstep' },
  { id: 'e6', source: 'nurture', target: 'end', type: 'smoothstep' },
]

// Main Diagram Editor Component
interface DiagramEditorProps {
  initialData?: { nodes: any[]; edges: any[] }
}

function DiagramEditorContent({ initialData }: DiagramEditorProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialData?.nodes ?? exampleNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialData?.edges ?? exampleEdges)
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [showNodeEditor, setShowNodeEditor] = useState(false)
  const [nodeData, setNodeData] = useState({ label: '', description: '', type: 'default' })
  const [connectionMode, setConnectionMode] = useState(false)
  const [textImportOpen, setTextImportOpen] = useState(false)
  const [textImportValue, setTextImportValue] = useState('')
  const [textImportError, setTextImportError] = useState('')
  
  const { fitView } = useReactFlow()

  // Übernehme initialData bei Änderung (force update)
  useEffect(() => {
    if (initialData && Array.isArray(initialData.nodes) && Array.isArray(initialData.edges)) {
      setNodes([...initialData.nodes]) // force new array
      setEdges([...initialData.edges])
    }
  }, [JSON.stringify(initialData), setNodes, setEdges])

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge: Edge = {
        id: `edge-${Date.now()}`,
        source: params.source!,
        target: params.target!,
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#3B82F6', strokeWidth: 2 },
      }
      setEdges((eds) => addEdge(newEdge, eds))
    },
    [setEdges]
  )

  const onLayout = useCallback(
    (direction: 'TB' | 'LR') => {
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        nodes,
        edges,
        direction
      )
      setNodes([...layoutedNodes])
      setEdges([...layoutedEdges])
      setTimeout(() => fitView(), 100)
    },
    [nodes, edges, setNodes, setEdges, fitView]
  )

  const addNode = useCallback(() => {
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: 'default',
      position: { x: 100, y: 100 },
      data: { label: 'New Node', description: 'Description' },
    }
    setNodes((nds) => nds.concat(newNode))
  }, [setNodes])

  const deleteSelectedNode = useCallback(() => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id))
      setEdges((eds) => eds.filter((edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id))
      setSelectedNode(null)
    }
  }, [selectedNode, setNodes, setEdges])

  const onNodeClick = useCallback((event: any, node: Node) => {
    setSelectedNode(node)
    setNodeData({
      label: node.data.label,
      description: node.data.description,
      type: node.type || 'default'
    })
    setShowNodeEditor(true)
  }, [])

  const updateNode = useCallback(() => {
    if (selectedNode) {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === selectedNode.id
            ? {
                ...node,
                type: nodeData.type,
                data: { label: nodeData.label, description: nodeData.description },
              }
            : node
        )
      )
      setShowNodeEditor(false)
      setSelectedNode(null)
    }
  }, [selectedNode, nodeData, setNodes])

  const exportDiagram = useCallback(() => {
    const diagramData = { nodes, edges }
    const dataStr = JSON.stringify(diagramData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'diagram.json'
    link.click()
    URL.revokeObjectURL(url)
  }, [nodes, edges])

  const importDiagram = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string)
          setNodes(data.nodes)
          setEdges(data.edges)
        } catch (error) {
          console.error('Error importing diagram:', error)
        }
      }
      reader.readAsText(file)
    }
  }, [setNodes, setEdges])

  const handleTextImport = useCallback(() => {
    setTextImportError('')
    try {
      const data = JSON.parse(textImportValue)
      if (!Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
        setTextImportError('JSON muss ein Objekt mit "nodes" und "edges" sein.')
        return
      }
      setNodes(data.nodes)
      setEdges(data.edges)
      setTextImportOpen(false)
      setTimeout(() => fitView(), 100)
    } catch (e) {
      setTextImportError('Ungültiges JSON: ' + (e as Error).message)
    }
  }, [textImportValue, setNodes, setEdges, fitView])

  const clearDiagram = useCallback(() => {
    setNodes([])
    setEdges([])
    setSelectedNode(null)
  }, [setNodes, setEdges])

  const loadExample = useCallback(() => {
    setNodes(exampleNodes)
    setEdges(exampleEdges)
    setTimeout(() => fitView(), 100)
  }, [setNodes, setEdges, fitView])

  return (
    <div className="h-screen w-full bg-gray-50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        className="bg-gray-50"
        connectionMode={ConnectionMode.Loose}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#3B82F6', strokeWidth: 2 },
        }}
        connectionLineStyle={{ stroke: '#3B82F6', strokeWidth: 2 }}
        snapToGrid={true}
        snapGrid={[15, 15]}
        connectOnClick={false}
        deleteKeyCode="Delete"
      >
        <Controls />
        <Background />
        <MiniMap />
        
        {/* Top Panel */}
        <Panel position="top-left" className="bg-white rounded-lg shadow-lg p-4 m-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={addNode}
              className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Node
            </button>
            
            <button
              onClick={() => setConnectionMode(!connectionMode)}
              className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                connectionMode 
                  ? 'bg-purple-600 text-white hover:bg-purple-700' 
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
            >
              <Settings className="w-4 h-4 mr-2" />
              {connectionMode ? 'Exit Connect' : 'Connect Mode'}
            </button>
            
            <button
              onClick={() => onLayout('TB')}
              className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <LayoutGrid className="w-4 h-4 mr-2" />
              Auto Layout
            </button>
            
            <button
              onClick={loadExample}
              className="flex items-center px-3 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Load Example
            </button>
            
            <button
              onClick={clearDiagram}
              className="flex items-center px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear
            </button>
            <button
              onClick={() => setTextImportOpen(true)}
              className="flex items-center px-3 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
            >
              <Upload className="w-4 h-4 mr-2" />
              Text Import
            </button>
          </div>
        </Panel>

        {/* Right Panel */}
        <Panel position="top-right" className="bg-white rounded-lg shadow-lg p-4 m-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={exportDiagram}
              className="flex items-center px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
            
            <label className="flex items-center px-3 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors cursor-pointer">
              <Upload className="w-4 h-4 mr-2" />
              Import
              <input
                type="file"
                accept=".json"
                onChange={importDiagram}
                className="hidden"
              />
            </label>
          </div>
        </Panel>
      </ReactFlow>

      {/* Node Editor Modal */}
      {showNodeEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-bold mb-4">Edit Node</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Label
                </label>
                <input
                  type="text"
                  value={nodeData.label}
                  onChange={(e) => setNodeData({ ...nodeData, label: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={nodeData.description}
                  onChange={(e) => setNodeData({ ...nodeData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={nodeData.type}
                  onChange={(e) => setNodeData({ ...nodeData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="default">Default</option>
                  <option value="input">Input</option>
                  <option value="output">Output</option>
                  <option value="process">Process</option>
                  <option value="decision">Decision</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowNodeEditor(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={updateNode}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

              {/* Selected Node Actions */}
        {selectedNode && !showNodeEditor && (
          <Panel position="bottom-left" className="bg-white rounded-lg shadow-lg p-4 m-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                Selected: {selectedNode.data.label}
              </span>
              <button
                onClick={() => setShowNodeEditor(true)}
                className="flex items-center px-2 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
              >
                <Edit3 className="w-3 h-3 mr-1" />
                Edit
              </button>
              <button
                onClick={deleteSelectedNode}
                className="flex items-center px-2 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Delete
              </button>
            </div>
          </Panel>
        )}

        {/* Connection Instructions */}
        {connectionMode && (
          <Panel position="bottom-right" className="bg-blue-50 border border-blue-200 rounded-lg p-4 m-4">
            <div className="text-sm text-blue-800">
              <div className="font-semibold mb-1">🔗 Verbindungsmodus aktiv</div>
              <div>• Klicken Sie auf einen farbigen Punkt und ziehen Sie zu einem anderen</div>
              <div>• Verbindungen werden automatisch erstellt</div>
              <div>• Klicken Sie "Exit Connect" um den Modus zu beenden</div>
              <div className="mt-2 text-xs text-blue-600">
                💡 Tipp: Die farbigen Punkte an den Nodes sind jetzt echte Verbindungspunkte
              </div>
            </div>
          </Panel>
        )}
      {/* Text Import Modal */}
      {textImportOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-lg font-bold mb-4">Diagramm per JSON-Text importieren</h3>
            <textarea
              className="w-full h-48 border border-gray-300 rounded p-2 font-mono text-xs mb-2"
              value={textImportValue}
              onChange={e => setTextImportValue(e.target.value)}
              placeholder="Füge hier dein Diagramm-JSON ein..."
              autoFocus
            />
            {textImportError && <div className="text-red-600 text-sm mb-2">{textImportError}</div>}
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => setTextImportOpen(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >Abbrechen</button>
              <button
                onClick={handleTextImport}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >Übernehmen</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Wrapper Component with ReactFlowProvider
export const DiagramEditor: React.FC<{ initialData?: { nodes: any[]; edges: any[] } }> = ({ initialData }) => {
  return (
    <ReactFlowProvider>
      <DiagramEditorContent initialData={initialData} />
    </ReactFlowProvider>
  )
} 