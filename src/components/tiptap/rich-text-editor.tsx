import { type Editor, useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, List, ListOrdered, Quote, Minus, Heading1, Heading2,
         Undo, Redo, Eraser } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import React from 'react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

const MenuBar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) return null;

  const ToolbarButton = ({
    isActive = false,
    onClick,
    children,
    tooltip
  }: {
    isActive?: boolean;
    onClick: () => void;
    children: React.ReactNode;
    tooltip: string;
  }) => (
    <div className="relative group">
      <Button
        variant="ghost"
        size="icon"
        type="button"
        onClick={onClick}
        className={cn(
          "h-8 w-8 p-0 transition-colors duration-150",
          "hover:bg-zinc-100 dark:hover:bg-zinc-800",
          isActive && "bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100",
          "focus-visible:ring-1 focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-300"
        )}
      >
        {children}
      </Button>
      <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-zinc-900 dark:bg-zinc-100
                     text-zinc-100 dark:text-zinc-900 text-xs rounded opacity-0 pointer-events-none
                     group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap z-50">
        {tooltip}
      </span>
    </div>
  );

  const ToolbarGroup = ({ children }: { children: React.ReactNode }) => (
    <div className="flex items-center gap-0.5">{children}</div>
  );

  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 p-1.5 bg-white dark:bg-zinc-950
                    border-b border-zinc-200 dark:border-zinc-800">
      <ToolbarGroup>
        <ToolbarButton
          isActive={editor.isActive('heading', { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          tooltip="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          isActive={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          tooltip="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
      </ToolbarGroup>

      <Separator orientation="vertical" className="mx-0.5 h-6 bg-zinc-200 dark:bg-zinc-800" />

      <ToolbarGroup>
        <ToolbarButton
          isActive={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
          tooltip="Bold"
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          isActive={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          tooltip="Italic"
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
      </ToolbarGroup>

      <Separator orientation="vertical" className="mx-0.5 h-6 bg-zinc-200 dark:bg-zinc-800" />

      <ToolbarGroup>
        <ToolbarButton
          isActive={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          tooltip="Bullet List"
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          isActive={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          tooltip="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
      </ToolbarGroup>

      <Separator orientation="vertical" className="mx-0.5 h-6 bg-zinc-200 dark:bg-zinc-800" />

      <ToolbarGroup>
        <ToolbarButton
          isActive={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          tooltip="Quote"
        >
          <Quote className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          isActive={false}
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          tooltip="Horizontal Line"
        >
          <Minus className="h-4 w-4" />
        </ToolbarButton>
      </ToolbarGroup>

      <Separator orientation="vertical" className="mx-0.5 h-6 bg-zinc-200 dark:bg-zinc-800" />

      <ToolbarGroup>
        <ToolbarButton
          isActive={false}
          onClick={() => editor.chain().focus().undo().run()}
          tooltip="Undo"
        >
          <Undo className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          isActive={false}
          onClick={() => editor.chain().focus().redo().run()}
          tooltip="Redo"
        >
          <Redo className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          isActive={false}
          onClick={() => editor.chain().focus().clearContent().run()}
          tooltip="Clear"
        >
          <Eraser className="h-4 w-4" />
        </ToolbarButton>
      </ToolbarGroup>
    </div>
  );
};

const RichTextEditor = ({
  content,
  onChange,
  placeholder = 'Start writing...',
  className
}: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-zinc dark:prose-invert max-w-none focus:outline-none min-h-[200px]',
          'px-4 py-2 text-zinc-900 dark:text-zinc-100'
        ),
      },
    },
  });

  return (
    <div
      className={cn(
        'relative border rounded-lg',
        'bg-white dark:bg-zinc-950',
        'border-zinc-200 dark:border-zinc-800',
        'focus-within:ring-2 focus-within:ring-offset-0 focus-within:ring-zinc-400 dark:focus-within:ring-zinc-800',
        className
      )}
    >
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />

      <style jsx global>{`
        .ProseMirror {
          min-height: 200px;
          outline: none;
        }
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #a1a1aa;
          pointer-events: none;
          height: 0;
        }
        .ProseMirror blockquote {
          border-left: 2px solid #71717a;
          padding-left: 1rem;
          color: #71717a;
        }
        .ProseMirror h1 {
          font-size: 1.875rem;
          line-height: 2.25rem;
          font-weight: 700;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
        }
        .ProseMirror h2 {
          font-size: 1.5rem;
          line-height: 2rem;
          font-weight: 600;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
        }
        .ProseMirror p {
          margin-bottom: 0.75rem;
          line-height: 1.75;
        }
        .ProseMirror ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin-bottom: 0.75rem;
        }
        .ProseMirror ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
          margin-bottom: 0.75rem;
        }
        .ProseMirror hr {
          border: none;
          border-top: 2px solid #e4e4e7;
          margin: 1.5rem 0;
        }
        .dark .ProseMirror hr {
          border-top-color: #3f3f46;
        }
        .ProseMirror *::selection {
          background: #e4e4e7;
          color: #18181b;
        }
        .dark .ProseMirror *::selection {
          background: #3f3f46;
          color: #fafafa;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
