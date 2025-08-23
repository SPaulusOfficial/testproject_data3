import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import { marked } from 'marked';

import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Code,
  Highlighter,
  Palette
} from 'lucide-react';

// CSS for better code block handling
const editorStyles = `
  .ProseMirror {
    max-width: none !important;
    height: 60vh !important;
    min-height: 60vh !important;
    max-height: 60vh !important;
    overflow-y: auto !important;
    padding: 1rem !important;
  }
  
  .ProseMirror:focus {
    outline: none !important;
  }
  
  .ProseMirror pre {
    max-width: 100% !important;
    overflow-x: auto !important;
    white-space: pre-wrap !important;
    word-wrap: break-word !important;
  }
  
  .ProseMirror code {
    white-space: pre-wrap !important;
    word-wrap: break-word !important;
  }
  
  .ProseMirror blockquote {
    max-width: 100% !important;
  }
  
  .ProseMirror table {
    max-width: 100% !important;
    overflow-x: auto !important;
  }
  
  .ProseMirror p, .prose p, .markdown-content p {
    margin-bottom: 0.5rem !important;
  }
  
  .ProseMirror h1, .ProseMirror h2, .ProseMirror h3, .ProseMirror h4, .ProseMirror h5, .ProseMirror h6,
  .prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6,
  .markdown-content h1, .markdown-content h2, .markdown-content h3, .markdown-content h4, .markdown-content h5, .markdown-content h6 {
    margin-top: 1rem !important;
    margin-bottom: 0.5rem !important;
    font-weight: bold !important;
  }

  .markdown-content h1 {
    font-size: 2rem !important;
  }

  .markdown-content h2 {
    font-size: 1.5rem !important;
  }

  .markdown-content h3 {
    font-size: 1.25rem !important;
  }

  .markdown-content strong, .markdown-content b {
    font-weight: bold !important;
  }

  .markdown-content em, .markdown-content i {
    font-style: italic !important;
  }
  
  .ProseMirror a, .prose a, .markdown-content a {
    color: #2563eb !important;
    text-decoration: underline !important;
  }
  
  .ProseMirror a:hover, .prose a:hover, .markdown-content a:hover {
    color: #1d4ed8 !important;
  }
  
  .ProseMirror hr, .prose hr, .markdown-content hr {
    border: none !important;
    border-top: 1px solid #d1d5db !important;
    margin: 1rem 0 !important;
  }
  
  .ProseMirror code, .prose code, .markdown-content code {
    background-color: #f3f4f6 !important;
    padding: 0.125rem 0.25rem !important;
    border-radius: 0.25rem !important;
    font-family: 'Courier New', monospace !important;
    font-size: 0.875em !important;
  }
  
  .ProseMirror pre, .prose pre, .markdown-content pre {
    background-color: #f3f4f6 !important;
    padding: 1rem !important;
    border-radius: 0.5rem !important;
    overflow-x: auto !important;
    margin: 1rem 0 !important;
  }
  
  .ProseMirror blockquote, .prose blockquote, .markdown-content blockquote {
    border-left: 4px solid #d1d5db !important;
    padding-left: 1rem !important;
    margin: 1rem 0 !important;
    font-style: italic !important;
    color: #6b7280 !important;
  }
  
  .ProseMirror ul, .ProseMirror ol, .prose ul, .prose ol, .markdown-content ul, .markdown-content ol {
    padding-left: 1.5rem !important;
    margin: 0.5rem 0 !important;
  }
  
  .ProseMirror li, .prose li, .markdown-content li {
    margin: 0.25rem 0 !important;
  }
  

  
  /* Ensure scrollbar is always visible */
  .ProseMirror::-webkit-scrollbar, .prose::-webkit-scrollbar, .markdown-content::-webkit-scrollbar {
    width: 8px !important;
  }
  
  .ProseMirror::-webkit-scrollbar-track, .prose::-webkit-scrollbar-track, .markdown-content::-webkit-scrollbar-track {
    background: #f1f1f1 !important;
  }
  
  .ProseMirror::-webkit-scrollbar-thumb, .prose::-webkit-scrollbar-thumb, .markdown-content::-webkit-scrollbar-thumb {
    background: #888 !important;
    border-radius: 4px !important;
  }
  
  .ProseMirror::-webkit-scrollbar-thumb:hover, .prose::-webkit-scrollbar-thumb:hover, .markdown-content::-webkit-scrollbar-thumb:hover {
    background: #555 !important;
  }
  
  /* Container scrollbar styles */
  .editor-container::-webkit-scrollbar {
    width: 8px !important;
  }
  
  .editor-container::-webkit-scrollbar-track {
    background: #f1f1f1 !important;
  }
  
  .editor-container::-webkit-scrollbar-thumb {
    background: #888 !important;
    border-radius: 4px !important;
  }
  
  .editor-container::-webkit-scrollbar-thumb:hover {
    background: #555 !important;
  }
  
  .ProseMirror h1, .ProseMirror h2, .ProseMirror h3 {
    margin-top: 1.5rem !important;
    margin-bottom: 0.5rem !important;
  }
  
  .ProseMirror p {
    margin-bottom: 1rem !important;
  }
`;

interface WYSIWYGEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  size?: 'xsmall' | 'small' | 'normal';
  isMarkdown?: boolean;
  readOnly?: boolean;
  onEditorReady?: (editor: any) => void;
}

const WYSIWYGEditor: React.FC<WYSIWYGEditorProps> = ({
  content,
  onChange,
  placeholder = 'Start writing...',
  size = 'normal',
  isMarkdown = false,
  readOnly = false,
  onEditorReady
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable underline from StarterKit since we add it separately
        underline: false,
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Color,
      Highlight,
    ],
    content: isMarkdown ? marked.parse(content) as string : content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      // Always return HTML from the editor, let the parent handle conversion
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none max-w-none',
      },
    },
    editable: !readOnly,
  });

  // Size configuration
  const getSizeConfig = () => {
    switch (size) {
      case 'xsmall':
        return {
          toolbarPadding: 'p-1',
          buttonPadding: 'p-1',
          buttonIconSize: 'w-2.5 h-2.5',
          buttonGap: 'gap-0.5',
          sectionGap: 'gap-0.5',
          sectionPadding: 'pr-1'
        };
      case 'small':
        return {
          toolbarPadding: 'p-1.5',
          buttonPadding: 'p-1.5',
          buttonIconSize: 'w-3 h-3',
          buttonGap: 'gap-1',
          sectionGap: 'gap-1',
          sectionPadding: 'pr-1.5'
        };
      case 'normal':
      default:
        return {
          toolbarPadding: 'p-1.5',
          buttonPadding: 'p-1.5',
          buttonIconSize: 'w-3.5 h-3.5',
          buttonGap: 'gap-1',
          sectionGap: 'gap-1',
          sectionPadding: 'pr-2'
        };
    }
  };

  const sizeConfig = getSizeConfig();

  // Ensure editor is editable when not in read-only mode
  React.useEffect(() => {
    if (editor && !readOnly) {
      editor.setEditable(true);
    }
  }, [editor, readOnly]);

  // Notify parent when editor is ready
  React.useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);

  // Update editor content when content prop changes (only when editor is ready and content is different)
  React.useEffect(() => {
    if (editor && content && content.trim() !== '') {
      // Use a ref to track if we've already updated this content
      const currentContent = editor.getHTML();
      if (content !== currentContent) {
        // Use a timeout to prevent infinite loops
        const timeoutId = setTimeout(() => {
          if (editor && !editor.isDestroyed) {
            // If content is markdown, convert it to HTML before setting
            const contentToSet = isMarkdown ? marked.parse(content) as string : content;
            editor.commands.setContent(contentToSet);
          }
        }, 10);
        return () => clearTimeout(timeoutId);
      }
    }
  }, [editor, content, isMarkdown]);

  if (!editor) {
    return null;
  }

  // Read-only view for Markdown content
  if (readOnly && isMarkdown) {
    // Configure marked for better rendering
    marked.setOptions({
      breaks: true,
      gfm: true
    });

    // Debug: Log the content to see what we're dealing with
    console.log('🔍 WYSIWYGEditor - Read-only mode, content type:', typeof content);
    console.log('🔍 WYSIWYGEditor - Content preview:', content.substring(0, 200));
    console.log('🔍 WYSIWYGEditor - Content contains HTML:', content.includes('<'));
    console.log('🔍 WYSIWYGEditor - Content contains markdown:', content.includes('#'));

    return (
      <div className="flex flex-col h-full bg-white">
        <style>{editorStyles}</style>
        <div className="flex-1 h-0 overflow-hidden editor-container">
          <div 
            className="prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto max-w-none h-full overflow-y-auto markdown-content"
            style={{
              padding: '1rem',
              minHeight: '60vh',
              maxHeight: '60vh'
            }}
                            dangerouslySetInnerHTML={{
                  __html: isMarkdown ? marked.parse(content) as string : content
                }}
          />
        </div>
      </div>
    );
  }

  const MenuBar = () => {
    return (
      <div className={`border-b bg-gray-50 ${sizeConfig.toolbarPadding} flex flex-wrap ${sizeConfig.buttonGap} sticky top-0 z-10`}>
        {/* Text Formatting */}
        <div className={`flex items-center ${sizeConfig.sectionGap} border-r ${sizeConfig.sectionPadding}`}>
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={!editor.can().chain().focus().toggleBold().run()}
            className={`${sizeConfig.buttonPadding} rounded hover:bg-gray-200 ${editor.isActive('bold') ? 'bg-blue-100 text-blue-700' : 'text-gray-700'}`}
            title="Bold"
          >
            <Bold className={sizeConfig.buttonIconSize} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
            className={`${sizeConfig.buttonPadding} rounded hover:bg-gray-200 ${editor.isActive('italic') ? 'bg-blue-100 text-blue-700' : 'text-gray-700'}`}
            title="Italic"
          >
            <Italic className={sizeConfig.buttonIconSize} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`${sizeConfig.buttonPadding} rounded hover:bg-gray-200 ${editor.isActive('underline') ? 'bg-blue-100 text-blue-700' : 'text-gray-700'}`}
            title="Underline"
          >
            <UnderlineIcon className={sizeConfig.buttonIconSize} />
          </button>
        </div>

        {/* Headings */}
        <div className={`flex items-center ${sizeConfig.sectionGap} border-r ${sizeConfig.sectionPadding}`}>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`${sizeConfig.buttonPadding} rounded hover:bg-gray-200 ${editor.isActive('heading', { level: 1 }) ? 'bg-blue-100 text-blue-700' : 'text-gray-700'}`}
            title="Heading 1"
          >
            <Heading1 className={sizeConfig.buttonIconSize} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`${sizeConfig.buttonPadding} rounded hover:bg-gray-200 ${editor.isActive('heading', { level: 2 }) ? 'bg-blue-100 text-blue-700' : 'text-gray-700'}`}
            title="Heading 2"
          >
            <Heading2 className={sizeConfig.buttonIconSize} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`${sizeConfig.buttonPadding} rounded hover:bg-gray-200 ${editor.isActive('heading', { level: 3 }) ? 'bg-blue-100 text-blue-700' : 'text-gray-700'}`}
            title="Heading 3"
          >
            <Heading3 className={sizeConfig.buttonIconSize} />
          </button>
        </div>

        {/* Lists */}
        <div className={`flex items-center ${sizeConfig.sectionGap} border-r ${sizeConfig.sectionPadding}`}>
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`${sizeConfig.buttonPadding} rounded hover:bg-gray-200 ${editor.isActive('bulletList') ? 'bg-blue-100 text-blue-700' : 'text-gray-700'}`}
            title="Bullet List"
          >
            <List className={sizeConfig.buttonIconSize} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`${sizeConfig.buttonPadding} rounded hover:bg-gray-200 ${editor.isActive('orderedList') ? 'bg-blue-100 text-blue-700' : 'text-gray-700'}`}
            title="Numbered List"
          >
            <ListOrdered className={sizeConfig.buttonIconSize} />
          </button>
        </div>

        {/* Alignment */}
        <div className={`flex items-center ${sizeConfig.sectionGap} border-r ${sizeConfig.sectionPadding}`}>
          <button
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`${sizeConfig.buttonPadding} rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'left' }) ? 'bg-blue-100 text-blue-700' : 'text-gray-700'}`}
            title="Align Left"
          >
            <AlignLeft className={sizeConfig.buttonIconSize} />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`${sizeConfig.buttonPadding} rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'center' }) ? 'bg-blue-100 text-blue-700' : 'text-gray-700'}`}
            title="Align Center"
          >
            <AlignCenter className={sizeConfig.buttonIconSize} />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`${sizeConfig.buttonPadding} rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'right' }) ? 'bg-blue-100 text-blue-700' : 'text-gray-700'}`}
            title="Align Right"
          >
            <AlignRight className={sizeConfig.buttonIconSize} />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            className={`${sizeConfig.buttonPadding} rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'justify' }) ? 'bg-blue-100 text-blue-700' : 'text-gray-700'}`}
            title="Justify"
          >
            <AlignJustify className={sizeConfig.buttonIconSize} />
          </button>
        </div>

        {/* Block Elements */}
        <div className={`flex items-center ${sizeConfig.sectionGap} border-r ${sizeConfig.sectionPadding}`}>
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`${sizeConfig.buttonPadding} rounded hover:bg-gray-200 ${editor.isActive('blockquote') ? 'bg-blue-100 text-blue-700' : 'text-gray-700'}`}
            title="Quote"
          >
            <Quote className={sizeConfig.buttonIconSize} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`${sizeConfig.buttonPadding} rounded hover:bg-gray-200 ${editor.isActive('codeBlock') ? 'bg-blue-100 text-blue-700' : 'text-gray-700'}`}
            title="Code Block"
          >
            <Code className={sizeConfig.buttonIconSize} />
          </button>
        </div>

        {/* Highlight */}
        <div className={`flex items-center ${sizeConfig.sectionGap}`}>
          <button
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            className={`${sizeConfig.buttonPadding} rounded hover:bg-gray-200 ${editor.isActive('highlight') ? 'bg-blue-100 text-blue-700' : 'text-gray-700'}`}
            title="Highlight"
          >
            <Highlighter className={sizeConfig.buttonIconSize} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <style>{editorStyles}</style>
      <MenuBar />
      <div className="flex-1 h-0 overflow-hidden editor-container">
        <EditorContent 
          editor={editor} 
          className="focus:outline-none prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto max-w-none"
          placeholder={placeholder}
        />
      </div>
    </div>
  );
};

export default WYSIWYGEditor;
