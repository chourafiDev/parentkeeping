"use client";

import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Heading2,
  Heading3,
  Italic,
  Link2,
  List,
  ListOrdered,
  Underline,
} from "lucide-react";
import { focusWithinRing } from "@/lib/focus-ring";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  id?: string;
  "aria-invalid"?: boolean;
}

/** Small WYSIWYG editor (Tiptap) that reads/writes HTML. */
export function RichTextEditor({
  value,
  onChange,
  onBlur,
  id,
  "aria-invalid": invalid,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: { openOnClick: false, autolink: true, defaultProtocol: "https" },
      }),
    ],
    content: value,
    immediatelyRender: false, // avoid SSR hydration mismatch
    editorProps: {
      attributes: {
        ...(id ? { id } : {}),
        class: "rich-text min-h-36 px-3 py-2 text-sm outline-none",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.isEmpty ? "" : editor.getHTML()),
    onBlur: () => onBlur?.(),
  });

  const state = useEditorState({
    editor,
    selector: ({ editor }) =>
      editor && {
        bold: editor.isActive("bold"),
        italic: editor.isActive("italic"),
        underline: editor.isActive("underline"),
        h2: editor.isActive("heading", { level: 2 }),
        h3: editor.isActive("heading", { level: 3 }),
        bullet: editor.isActive("bulletList"),
        ordered: editor.isActive("orderedList"),
        link: editor.isActive("link"),
      },
  });

  const setLink = () => {
    if (!editor) return;
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previous ?? "https://");
    if (url === null) return;
    if (url === "") editor.chain().focus().unsetLink().run();
    else editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const tools = [
    { label: "Heading 2", icon: Heading2, active: state?.h2, run: () => editor?.chain().focus().toggleHeading({ level: 2 }).run() },
    { label: "Heading 3", icon: Heading3, active: state?.h3, run: () => editor?.chain().focus().toggleHeading({ level: 3 }).run() },
    { label: "Bold", icon: Bold, active: state?.bold, run: () => editor?.chain().focus().toggleBold().run() },
    { label: "Italic", icon: Italic, active: state?.italic, run: () => editor?.chain().focus().toggleItalic().run() },
    { label: "Underline", icon: Underline, active: state?.underline, run: () => editor?.chain().focus().toggleUnderline().run() },
    { label: "Bullet list", icon: List, active: state?.bullet, run: () => editor?.chain().focus().toggleBulletList().run() },
    { label: "Numbered list", icon: ListOrdered, active: state?.ordered, run: () => editor?.chain().focus().toggleOrderedList().run() },
    { label: "Link", icon: Link2, active: state?.link, run: setLink },
  ];

  return (
    <div
      aria-invalid={invalid}
      className={cn("border-input aria-invalid:border-destructive overflow-hidden rounded-lg border", focusWithinRing)}
    >
      <div className="bg-muted/60 flex flex-wrap items-center gap-0.5 border-b px-1.5 py-1">
        {tools.map(({ label, icon: Icon, active, run }) => (
          <button
            key={label}
            type="button"
            title={label}
            aria-label={label}
            aria-pressed={!!active}
            onClick={run}
            className={cn(
              "text-muted-foreground hover:bg-background hover:text-foreground flex size-7 items-center justify-center rounded-md transition-colors",
              active && "bg-background text-foreground shadow-xs",
            )}
          >
            <Icon className="size-4" />
          </button>
        ))}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
