"use client";

import { useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { Bold, Italic, List, ListOrdered, Link2, Heading2, ImagePlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface TiptapEditorProps {
  content?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
}

const editorSurfaceClass =
  "prose-article min-h-[280px] max-w-none rounded-b-lg border border-t-0 border-border bg-background p-4 text-foreground focus:outline-none dark:bg-gray-950 dark:text-gray-100 [&_.ProseMirror]:min-h-[260px] [&_.ProseMirror]:text-foreground [&_.ProseMirror]:outline-none dark:[&_.ProseMirror]:text-gray-100";

export function TiptapEditor({
  content = "",
  onChange,
  placeholder = "Write your article content…",
}: TiptapEditorProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Image.configure({ inline: false }),
      Placeholder.configure({ placeholder }),
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor: e }) => onChange?.(e.getHTML()),
    editorProps: {
      attributes: {
        class: editorSurfaceClass,
      },
    },
  });

  async function uploadAndInsertImage(file: File) {
    if (!editor) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "worldview/articles");
      formData.append("resourceType", "image");

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Image upload failed");
        return;
      }
      editor.chain().focus().setImage({ src: data.url, alt: file.name }).run();
      toast.success("Image inserted");
    } catch {
      toast.error("Image upload failed");
    } finally {
      setUploading(false);
    }
  }

  if (!editor) return null;

  const tools = [
    { icon: Bold, action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive("bold") },
    { icon: Italic, action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive("italic") },
    {
      icon: Heading2,
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      active: editor.isActive("heading", { level: 2 }),
    },
    { icon: List, action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive("bulletList") },
    {
      icon: ListOrdered,
      action: () => editor.chain().focus().toggleOrderedList().run(),
      active: editor.isActive("orderedList"),
    },
    {
      icon: Link2,
      action: () => {
        const url = window.prompt("URL");
        if (url) editor.chain().focus().setLink({ href: url }).run();
      },
      active: editor.isActive("link"),
    },
  ];

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div className="flex flex-wrap gap-1 rounded-t-lg border-b border-border bg-muted p-2 dark:bg-gray-900">
        {tools.map(({ icon: Icon, action, active }, i) => (
          <Button
            key={i}
            type="button"
            variant="ghost"
            size="sm"
            onClick={action}
            className={cn(
              "text-foreground-muted dark:text-gray-200",
              active && "bg-[#2E2A86]/10 text-[#2E2A86] dark:bg-[#E8872A]/20 dark:text-[#E8872A]"
            )}
          >
            <Icon className="h-4 w-4" />
          </Button>
        ))}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={uploading}
          className="text-foreground-muted dark:text-gray-200"
          onClick={() => fileRef.current?.click()}
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) uploadAndInsertImage(file);
            e.target.value = "";
          }}
        />
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
