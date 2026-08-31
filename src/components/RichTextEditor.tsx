"use client";

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { Bold, Italic, Strikethrough, Underline as UnderlineIcon, Palette } from 'lucide-react'
import { useEffect } from 'react';

const COLORS = ['#000000', '#EF4444', '#3B82F6', '#10B981', '#F59E0B'];

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  placeholder?: string;
}

export function RichTextEditor({ value, onChange, readOnly = false, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
    ],
    content: value,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'tiptap-editor focus:outline-none min-h-[100px] p-3 text-sm text-slate-800' + (readOnly ? ' opacity-100 cursor-text' : ''),
      },
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) {
    return null;
  }

  // Parse if it's empty string or <p></p>
  const isEmpty = !value || value === '<p></p>';

  return (
    <div className={`border rounded-lg overflow-hidden ${readOnly ? 'bg-white border-slate-200' : 'bg-white border-slate-300 focus-within:ring-2 focus-within:ring-[#0064fa]/30 focus-within:border-[#0064fa]'}`}>
      <style dangerouslySetInnerHTML={{__html: `
        .tiptap-editor p { margin: 0; min-height: 1.5em; line-height: 1.6; }
        .tiptap-editor strong { font-weight: bold; }
        .tiptap-editor em { font-style: italic; }
        .tiptap-editor u { text-decoration: underline; }
        .tiptap-editor s { text-decoration: line-through; }
      `}} />

      {!readOnly && (
        <div className="flex flex-wrap items-center gap-1 p-2 border-b border-slate-200 bg-slate-50/50">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 rounded hover:bg-slate-200 ${editor.isActive('bold') ? 'bg-slate-200 text-[#0064fa]' : 'text-slate-600'}`}
            title="볼드"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded hover:bg-slate-200 ${editor.isActive('italic') ? 'bg-slate-200 text-[#0064fa]' : 'text-slate-600'}`}
            title="기울기"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-1.5 rounded hover:bg-slate-200 ${editor.isActive('underline') ? 'bg-slate-200 text-[#0064fa]' : 'text-slate-600'}`}
            title="하단선"
          >
            <UnderlineIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-1.5 rounded hover:bg-slate-200 ${editor.isActive('strike') ? 'bg-slate-200 text-[#0064fa]' : 'text-slate-600'}`}
            title="가로선"
          >
            <Strikethrough className="w-4 h-4" />
          </button>
          
          <div className="w-px h-4 bg-slate-300 mx-1"></div>
          
          <div className="flex items-center gap-1">
            <Palette className="w-4 h-4 text-slate-600 ml-1 mr-1" />
            {COLORS.map(color => (
              <button
                key={color}
                onClick={() => editor.chain().focus().setColor(color).run()}
                className={`w-4 h-4 rounded-full border border-slate-200 shadow-sm transition-transform hover:scale-110 ${editor.isActive('textStyle', { color }) ? 'ring-2 ring-offset-1 ring-slate-400' : ''}`}
                style={{ backgroundColor: color }}
                title="색상"
              />
            ))}
          </div>
        </div>
      )}
      
      <div className="relative">
        {readOnly && isEmpty && placeholder && (
          <div className="absolute inset-0 p-3 text-sm text-slate-400 pointer-events-none">{placeholder}</div>
        )}
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
