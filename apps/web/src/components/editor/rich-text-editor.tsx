"use client";

import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Heading2,
  Italic,
  List,
  ListOrdered,
  Quote,
  Redo,
  Strikethrough,
  Undo,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  invalid?: boolean;
};

type ToolbarItem = {
  icon: LucideIcon;
  label: string;
  isActive?: (editor: Editor) => boolean;
  run: (editor: Editor) => void;
};

const toolbarItems: ToolbarItem[] = [
  {
    icon: Bold,
    label: "굵게",
    isActive: (e) => e.isActive("bold"),
    run: (e) => e.chain().focus().toggleBold().run(),
  },
  {
    icon: Italic,
    label: "기울임",
    isActive: (e) => e.isActive("italic"),
    run: (e) => e.chain().focus().toggleItalic().run(),
  },
  {
    icon: Strikethrough,
    label: "취소선",
    isActive: (e) => e.isActive("strike"),
    run: (e) => e.chain().focus().toggleStrike().run(),
  },
  {
    icon: Heading2,
    label: "소제목",
    isActive: (e) => e.isActive("heading", { level: 2 }),
    run: (e) => e.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    icon: List,
    label: "글머리 목록",
    isActive: (e) => e.isActive("bulletList"),
    run: (e) => e.chain().focus().toggleBulletList().run(),
  },
  {
    icon: ListOrdered,
    label: "번호 목록",
    isActive: (e) => e.isActive("orderedList"),
    run: (e) => e.chain().focus().toggleOrderedList().run(),
  },
  {
    icon: Quote,
    label: "인용",
    isActive: (e) => e.isActive("blockquote"),
    run: (e) => e.chain().focus().toggleBlockquote().run(),
  },
  { icon: Undo, label: "실행 취소", run: (e) => e.chain().focus().undo().run() },
  { icon: Redo, label: "다시 실행", run: (e) => e.chain().focus().redo().run() },
];

/**
 * 에디터 상단의 서식 버튼 모음.
 * @param props.editor Tiptap 에디터
 */
function Toolbar({ editor }: { editor: Editor }) {
  // 선택 영역이 바뀔 때만 활성 상태를 다시 계산한다
  const active = useEditorState({
    editor,
    selector: ({ editor: current }) =>
      toolbarItems.map((item) => item.isActive?.(current) ?? false),
  });

  return (
    <div className="flex flex-wrap gap-1 border-b p-1" role="toolbar" aria-label="서식">
      {toolbarItems.map((item, index) => (
        <Button
          key={item.label}
          type="button"
          variant={active[index] ? "secondary" : "ghost"}
          size="icon"
          aria-label={item.label}
          aria-pressed={active[index]}
          onClick={() => item.run(editor)}
        >
          <item.icon />
        </Button>
      ))}
    </div>
  );
}

/**
 * 게시글 본문용 리치 텍스트 에디터. HTML 문자열을 입출력한다.
 * 서버에서 허용 태그만 남기도록 다시 정제하므로 클라이언트 값은 신뢰하지 않는다.
 * @param props 값, 변경 핸들러, 오류 상태
 */
export function RichTextEditor({ value, onChange, invalid }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit.configure({ heading: { levels: [2, 3] } })],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: { class: "prose prose-sm dark:prose-invert max-w-none", "aria-label": "본문" },
    },
    onUpdate: ({ editor: current }) => onChange(current.getHTML()),
  });

  return (
    <div
      className={cn(
        "rounded-md border border-input shadow-xs focus-within:ring-[3px] focus-within:ring-ring/50",
        invalid && "border-destructive",
      )}
    >
      {editor ? <Toolbar editor={editor} /> : <div className="h-11 border-b" />}
      <EditorContent editor={editor} />
    </div>
  );
}
