// App.stories.tsx
import type { Meta, StoryObj } from "@storybook/react-vite";
import { mocked } from "storybook/test";
import App from "./App";

// モジュールをインポート
import { sendToContentScript } from "../utils/messaging";
import { extensionEnabledStorage, targetLangStorage } from "../utils/storage";

const meta: Meta<typeof App> = {
  title: "Popup/App",
  component: App,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: "auto docs test",
      },
    },
  },
  // 各ストーリー実行前の設定
  beforeEach: async () => {
    // モック関数の戻り値を設定
    mocked(targetLangStorage.getValue).mockResolvedValue("ja");
    mocked(extensionEnabledStorage.getValue).mockResolvedValue(true);
    mocked(targetLangStorage.setValue).mockResolvedValue(undefined);
    mocked(extensionEnabledStorage.setValue).mockResolvedValue(undefined);
    mocked(sendToContentScript).mockResolvedValue({ isOk: () => true } as any);
  },
};

export default meta;
type Story = StoryObj<typeof App>;

export const Default: Story = {};
