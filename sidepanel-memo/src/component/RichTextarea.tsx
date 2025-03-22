import { useEditor } from '@tiptap/react';
import { RichTextEditor, Link, getTaskListExtension } from '@mantine/tiptap';
import Highlight from '@tiptap/extension-highlight';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Superscript from '@tiptap/extension-superscript';
import Subscript from '@tiptap/extension-subscript';
import { Color } from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import TaskItem from '@tiptap/extension-task-item';
import TipTapTaskList from '@tiptap/extension-task-list';
import { useEffect } from 'react';
import { getStringByteLength } from '../utils/calculation';
import Placeholder from '@tiptap/extension-placeholder';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function CustomRichTextEditor({
  value,
  onChange,
}: RichTextEditorProps) {

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link,
      Superscript,
      Subscript,
      Highlight,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle,
      Color,
      getTaskListExtension(TipTapTaskList),
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: 'test-item',
        },
      }),
      Placeholder.configure({ placeholder: 'Input here...' })
    ],
    content: value,
    onUpdate: ({ editor }) => {
      // onChange(editor.getHTML());
      const maxBytes = 8 * 1024;
      const currentContent = editor.getHTML();
      const byteLength = getStringByteLength(currentContent);
      let truncatedContent = currentContent;
      // 8KBを超えている場合、バイト数を超えないように切り取る
      if (byteLength > maxBytes) {
        while (getStringByteLength(truncatedContent) > maxBytes) {
          truncatedContent = truncatedContent.slice(0, truncatedContent.length - 1);
        }
        editor.commands.setContent(truncatedContent);
      }
      onChange(truncatedContent);
    },
  });

  // valueが更新されたときにエディターの内容を変更 (content: valueは初回のみUIに反映されるため)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      // falseを設定
      editor.commands.setContent(value, false);
    }
  }, [value, editor]);

  return (
    <RichTextEditor editor={editor} ta={"left"} flex={"1"}>
      <RichTextEditor.Toolbar sticky stickyOffset={60}>
        <RichTextEditor.ColorPicker
          colors={[
            '#25262b',
            '#868e96',
            '#fa5252',
            '#e64980',
            '#be4bdb',
            '#7950f2',
            '#4c6ef5',
            '#228be6',
            '#15aabf',
            '#12b886',
            '#40c057',
            '#82c91e',
            '#fab005',
            '#fd7e14',
          ]}
        />
        <RichTextEditor.UnsetColor />
          
        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Bold />
          <RichTextEditor.Italic />
          <RichTextEditor.Underline />
          <RichTextEditor.Strikethrough />
          <RichTextEditor.ClearFormatting />
          <RichTextEditor.Highlight />
          <RichTextEditor.Code />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.H1 />
          <RichTextEditor.H2 />
          <RichTextEditor.H3 />
          <RichTextEditor.H4 />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Blockquote />
          <RichTextEditor.Hr />
          <RichTextEditor.BulletList />
          <RichTextEditor.OrderedList />
          <RichTextEditor.Subscript />
          <RichTextEditor.Superscript />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.TaskList />
          <RichTextEditor.TaskListLift />
          <RichTextEditor.TaskListSink />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Link />
          <RichTextEditor.Unlink />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.AlignLeft />
          <RichTextEditor.AlignCenter />
          <RichTextEditor.AlignJustify />
          <RichTextEditor.AlignRight />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Undo />
          <RichTextEditor.Redo />
        </RichTextEditor.ControlsGroup>
      </RichTextEditor.Toolbar>

      <RichTextEditor.Content />

    </RichTextEditor>
  );

}