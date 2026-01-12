import type { Meta, StoryObj } from "@storybook/react";
import { DomSelectorOverlay } from "./DomSelectorOverlay";

const meta: Meta<typeof DomSelectorOverlay> = {
  title: "Content/DomSelectorOverlay",
  component: DomSelectorOverlay,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: "DOM要素を選択する際に表示されるオーバーレイコンポーネント",
      },
    },
  },
  argTypes: {
    style: {
      description: "オーバーレイの位置とサイズ",
    },
    translating: {
      description: "翻訳中かどうか",
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof DomSelectorOverlay>;

export const Default: Story = {
  args: {
    style: {
      top: 0,
      left: 0,
      width: 300,
      height: 40,
      opacity: 1,
    },
    translating: false,
  },
};

export const Translating: Story = {
  args: {
    style: {
      top: 0,
      left: 0,
      width: 300,
      height: 40,
      opacity: 1,
    },
    translating: true,
  },
};

export const Hidden: Story = {
  args: {
    style: {
      top: 0,
      left: 0,
      width: 300,
      height: 40,
      opacity: 0,
    },
    translating: false,
  },
};
