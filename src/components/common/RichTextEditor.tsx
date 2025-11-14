// src/components/common/RichTextEditor/EnhancedRichTextEditor.tsx
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import { useState, useEffect } from 'react'

interface EnhancedRichTextEditorProps {
  value: string
  onChange: (value: string) => void
  label?: string
  error?: string
  placeholder?: string
  height?: string
}

export default function EnhancedRichTextEditor({
  value,
  onChange,
  label,
  error,
  placeholder = 'Start typing...',
  height = 'min-h-[150px]'
}: EnhancedRichTextEditorProps) {
  const [isFocused, setIsFocused] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ['paragraph', 'heading'],
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onChange(html)
    },
    editorProps: {
       attributes: {
        class: `prose prose-sm max-w-none ${height} p-3 focus:outline-none ${
          error ? 'border-red-500' : isFocused ? 'border-blue-500' : 'border-gray-300'
        }`,
        placeholder: placeholder,
      },
    },
  })

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      // FIX: Remove the second parameter or use proper SetContentOptions
      editor.commands.setContent(value)
    }
  }, [editor, value])

  if (!editor) {
    return null
  }

  // Toolbar functions
  const toggleBold = () => editor.chain().focus().toggleBold().run()
  const toggleItalic = () => editor.chain().focus().toggleItalic().run()
  const toggleUnderline = () => editor.chain().focus().toggleUnderline().run()
  const toggleBulletList = () => editor.chain().focus().toggleBulletList().run()
  const toggleOrderedList = () => editor.chain().focus().toggleOrderedList().run()
  const setTextAlign = (align: 'left' | 'center' | 'right' | 'justify') => 
    editor.chain().focus().setTextAlign(align).run()

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      
      {/* Enhanced Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border border-gray-300 rounded-t-lg bg-gray-50">
        {/* Text Styles */}
        <button
          type="button"
          onClick={toggleBold}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive('bold') ? 'bg-gray-300' : ''
          }`}
          title="Bold"
        >
          <span className="font-bold text-sm">B</span>
        </button>
        
        <button
          type="button"
          onClick={toggleItalic}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive('italic') ? 'bg-gray-300' : ''
          }`}
          title="Italic"
        >
          <span className="italic text-sm">I</span>
        </button>
        
        <button
          type="button"
          onClick={toggleUnderline}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive('underline') ? 'bg-gray-300' : ''
          }`}
          title="Underline"
        >
          <span className="underline text-sm">U</span>
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Lists */}
        <button
          type="button"
          onClick={toggleBulletList}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive('bulletList') ? 'bg-gray-300' : ''
          }`}
          title="Bullet List"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M2 5a1 1 0 011-1h1a1 1 0 010 2H3a1 1 0 01-1-1zm0 5a1 1 0 011-1h1a1 1 0 110 2H3a1 1 0 01-1-1zm0 5a1 1 0 011-1h1a1 1 0 110 2H3a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        </button>
        
        <button
          type="button"
          onClick={toggleOrderedList}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive('orderedList') ? 'bg-gray-300' : ''
          }`}
          title="Numbered List"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M2 5a1 1 0 011-1h1a1 1 0 010 2H3a1 1 0 01-1-1zm0 5a1 1 0 011-1h1a1 1 0 110 2H3a1 1 0 01-1-1zm0 5a1 1 0 011-1h1a1 1 0 110 2H3a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Text Alignment */}
        <button
          type="button"
          onClick={() => setTextAlign('left')}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive({ textAlign: 'left' }) ? 'bg-gray-300' : ''
          }`}
          title="Align Left"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        </button>

        <button
          type="button"
          onClick={() => setTextAlign('center')}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive({ textAlign: 'center' }) ? 'bg-gray-300' : ''
          }`}
          title="Align Center"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm2 4a1 1 0 000 2h10a1 1 0 100-2H5zm-2 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        </button>

        <button
          type="button"
          onClick={() => setTextAlign('right')}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive({ textAlign: 'right' }) ? 'bg-gray-300' : ''
          }`}
          title="Align Right"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm4 4a1 1 0 000 2h8a1 1 0 100-2H7zm-4 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Editor Content */}
      <div
  className={`border border-t-0 rounded-b-lg transition-colors duration-200 ${
    error 
      ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' 
      : isFocused 
        ? 'border-[#91C73D] ring-2 ring-[#91C73D]/20' 
        : 'border-gray-300'
  } ${isFocused && !error ? 'focus:border-[#91C73D] focus:ring-2 focus:ring-[#91C73D]/20' : ''}`}
  onFocus={() => setIsFocused(true)}
  onBlur={() => setIsFocused(false)}
  tabIndex={0} 
>
  <EditorContent editor={editor} />
</div>

      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
    </div>
  )
}