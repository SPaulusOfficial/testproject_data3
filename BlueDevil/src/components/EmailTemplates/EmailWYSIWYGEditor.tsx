import React, { useState, useRef, useEffect } from 'react';
import { Bold, Italic, Underline, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, Link, Unlink } from 'lucide-react';
import './EmailWYSIWYGEditor.css';

interface EmailWYSIWYGEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

const EmailWYSIWYGEditor: React.FC<EmailWYSIWYGEditorProps> = ({
  content,
  onChange,
  placeholder = 'Enter content...',
  className = ''
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== content) {
      editorRef.current.innerHTML = content;
    }
  }, [content]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const removeLink = () => {
    execCommand('unlink');
  };

  const toolbarButtons = [
    { icon: Bold, command: 'bold', title: 'Bold' },
    { icon: Italic, command: 'italic', title: 'Italic' },
    { icon: Underline, command: 'underline', title: 'Underline' },
    { icon: List, command: 'insertUnorderedList', title: 'Bullet List' },
    { icon: ListOrdered, command: 'insertOrderedList', title: 'Numbered List' },
    { icon: AlignLeft, command: 'justifyLeft', title: 'Align Left' },
    { icon: AlignCenter, command: 'justifyCenter', title: 'Align Center' },
    { icon: AlignRight, command: 'justifyRight', title: 'Align Right' },
  ];

  return (
    <div className={`email-wysiwyg-editor border border-gray-300 rounded-md ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center space-x-1 p-2 border-b border-gray-200 bg-gray-50">
        {toolbarButtons.map((button) => (
          <button
            key={button.command}
            type="button"
            onClick={() => execCommand(button.command)}
            title={button.title}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded"
          >
            <button.icon className="w-4 h-4" />
          </button>
        ))}
        
        <div className="w-px h-6 bg-gray-300 mx-2" />
        
        <button
          type="button"
          onClick={insertLink}
          title="Insert Link"
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded"
        >
          <Link className="w-4 h-4" />
        </button>
        
        <button
          type="button"
          onClick={removeLink}
          title="Remove Link"
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded"
        >
          <Unlink className="w-4 h-4" />
        </button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`min-h-[200px] p-3 focus:outline-none ${
          isFocused ? 'ring-2 ring-blue-500' : ''
        }`}
        style={{ 
          fontFamily: 'Arial, sans-serif',
          fontSize: '14px',
          lineHeight: '1.5'
        }}
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
      />
    </div>
  );
};

export default EmailWYSIWYGEditor;
