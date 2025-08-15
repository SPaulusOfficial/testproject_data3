import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
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
`;

interface WYSIWYGEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  size?: 'xsmall' | 'small' | 'normal';
}

const WYSIWYGEditor: React.FC<WYSIWYGEditorProps> = ({
  content,
  onChange,
  placeholder = 'Start writing...',
  size = 'normal'
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Color,
      Highlight,
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none max-w-none',
      },
    },
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

  if (!editor) {
    return null;
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
      <div className="flex-1 p-4 overflow-y-auto">
        <EditorContent 
          editor={editor} 
          className="focus:outline-none min-h-64"
          placeholder={placeholder}
        />
      </div>
    </div>
  );
};

export default WYSIWYGEditor;
