import React, { useState, useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Highlight from '@tiptap/extension-highlight'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { common, createLowlight } from 'lowlight'
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Quote, 
  Code, 
  Heading1, 
  Heading2, 
  Heading3,
  Undo,
  Redo,
  Eye,
  EyeOff,
  FileText,
  Type
} from 'lucide-react'

interface WYSIWYGEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  readOnly?: boolean
  className?: string
}

const WYSIWYGEditor: React.FC<WYSIWYGEditorProps> = ({
  content,
  onChange,
  placeholder = 'Beginnen Sie mit dem Schreiben...',
  readOnly = false,
  className = ''
}) => {
  const [showMarkdown, setShowMarkdown] = useState(false)

  const lowlight = createLowlight(common)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
      Highlight,
      CodeBlockLowlight.configure({
        lowlight,
      }),
    ],
    content,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      const markdown = editor.storage.markdown?.getMarkdown() || editor.getHTML()
      onChange(markdown)
    },
  })

  const toggleMarkdown = useCallback(() => {
    setShowMarkdown(!showMarkdown)
  }, [showMarkdown])

  if (!editor) {
    return null
  }

  const ToolbarButton = ({ 
    onClick, 
    active = false, 
    disabled = false, 
    children, 
    title 
  }: {
    onClick: () => void
    active?: boolean
    disabled?: boolean
    children: React.ReactNode
    title: string
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded-md transition-colors ${
        active 
          ? 'bg-digital-blue text-white' 
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  )

  const ToolbarDivider = () => (
    <div className="w-px h-6 bg-gray-300 mx-1" />
  )

  return (
    <div className={`border border-gray-300 rounded-lg overflow-hidden ${className}`}>
      {/* Toolbar */}
      {!readOnly && (
        <div className="bg-gray-50 border-b border-gray-200 p-2 flex items-center gap-1 flex-wrap">
          {/* Text Formatting */}
          <div className="flex items-center gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              active={editor.isActive('bold')}
              title="Fett (Ctrl+B)"
            >
              <Bold size={16} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              active={editor.isActive('italic')}
              title="Kursiv (Ctrl+I)"
            >
              <Italic size={16} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleCode().run()}
              active={editor.isActive('code')}
              title="Code"
            >
              <Code size={16} />
            </ToolbarButton>
          </div>

          <ToolbarDivider />

          {/* Headings */}
          <div className="flex items-center gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              active={editor.isActive('heading', { level: 1 })}
              title="Überschrift 1"
            >
              <Heading1 size={16} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              active={editor.isActive('heading', { level: 2 })}
              title="Überschrift 2"
            >
              <Heading2 size={16} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              active={editor.isActive('heading', { level: 3 })}
              title="Überschrift 3"
            >
              <Heading3 size={16} />
            </ToolbarButton>
          </div>

          <ToolbarDivider />

          {/* Lists */}
          <div className="flex items-center gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              active={editor.isActive('bulletList')}
              title="Aufzählungsliste"
            >
              <List size={16} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              active={editor.isActive('orderedList')}
              title="Nummerierte Liste"
            >
              <ListOrdered size={16} />
            </ToolbarButton>
          </div>

          <ToolbarDivider />

          {/* Block Elements */}
          <div className="flex items-center gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              active={editor.isActive('blockquote')}
              title="Zitat"
            >
              <Quote size={16} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              active={editor.isActive('codeBlock')}
              title="Code-Block"
            >
              <Code size={16} />
            </ToolbarButton>
          </div>

          <ToolbarDivider />

          {/* History */}
          <div className="flex items-center gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              title="Rückgängig (Ctrl+Z)"
            >
              <Undo size={16} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              title="Wiederholen (Ctrl+Y)"
            >
              <Redo size={16} />
            </ToolbarButton>
          </div>

          <div className="ml-auto flex items-center gap-1">
            <ToolbarButton
              onClick={toggleMarkdown}
              active={showMarkdown}
              title={showMarkdown ? 'Rich Text anzeigen' : 'Markdown anzeigen'}
            >
              {showMarkdown ? <Type size={16} /> : <FileText size={16} />}
            </ToolbarButton>
          </div>
        </div>
      )}

      {/* Editor Content */}
      <div className="relative">
        {showMarkdown ? (
          <div className="p-4 bg-gray-50 font-mono text-sm">
            <div className="text-xs text-gray-500 mb-2">Markdown Preview:</div>
            <pre className="whitespace-pre-wrap text-gray-800">{content}</pre>
          </div>
        ) : (
          <EditorContent 
            editor={editor} 
            className="prose prose-sm max-w-none p-4 min-h-[200px] focus:outline-none"
          />
        )}
      </div>
    </div>
  )
}

export default WYSIWYGEditor
