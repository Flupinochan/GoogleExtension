import { useState, useEffect } from "react";
import { Button, Flex, Pagination, Progress, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { modals } from "@mantine/modals";
import { FaCheck, FaExclamation } from "react-icons/fa6";
import "@mantine/core/styles.css";
import '@mantine/tiptap/styles.css';
import "./App.css";
import { CustomRichTextEditor } from "./component/RichTextarea";
import { calculatePercentageOfMaxBytes } from "./utils/calculation";

// キーが作成日時、値がメモ内容となるObject
type Memo = Record<string, string>;

// chrome.storage.sync における保存用のキー
const STORAGE_KEY = "memos";

function App() {
  const [memos, setMemos] = useState<Memo>({});
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [currentProgress, setCurrentProgress] = useState<number>(0);
  const [page, setPage] = useState<number>(1);

  // Reload(GET)
  const fetchMemos = async () => {
    const notificationId = notifications.show({
      title: "Reloading...",
      message: "取得中",
      position: "top-center",
      loading: true,
      autoClose: false,
      withCloseButton: false,
    });
    let result;
    try {
      result = await chrome.storage.sync.get(STORAGE_KEY);
    } catch (error) {
      setTimeout(() => {
        notifications.update({
          title: "Initialize Failed!",
          message: `データ取得に失敗しました:\n ${error}`,
          position: "top-center",
          loading: false,
          autoClose: 5000,
          withCloseButton: true,
          color: "red",
          id: notificationId,
          icon: <FaExclamation size={18} />,
        });
      }, 1000);
      return;
    }
    const storedMemos: Memo = result[STORAGE_KEY] || {};
    setMemos(storedMemos);
    const keys = Object.keys(storedMemos).sort();
    if (keys.length > 0) {
      setSelectedKey(keys[0]);
      setPage(1);
      setCurrentProgress(calculatePercentageOfMaxBytes(storedMemos[keys[0]]));
    } else {
      setSelectedKey(null);
      setPage(0);
      setCurrentProgress(0);
    }
    setTimeout(() => {
      notifications.update({
        title: "Reload Completed!",
        message: "取得が完了しました",
        position: "top-center",
        loading: false,
        autoClose: 1000,
        withCloseButton: true,
        color: "teal",
        id: notificationId,
        icon: <FaCheck size={18} />,
      });
    }, 1000);
  };

  // 初回レンダリング時処理
  useEffect(() => {
    (async () => {
      await fetchMemos();
    })();
  }, []);

  // リアルタイムメモ更新
  const handleMemoChange = (newValue: string) => {
    if (!selectedKey) return;
    const updatedMemos = { ...memos, [selectedKey]: newValue };
    setMemos(updatedMemos);
    setCurrentProgress(calculatePercentageOfMaxBytes(newValue));
  };

  // New
  const handleNew = async () => {
    const createdAt = new Date().toISOString();
    const newMemoContent = "";
    const updatedMemos = { ...memos, [createdAt]: newMemoContent };
    await chrome.storage.sync.set({ [STORAGE_KEY]: updatedMemos });

    setMemos(updatedMemos);
    setSelectedKey(createdAt);
    const keys = Object.keys(updatedMemos).sort();
    // indexOfでIndexを取得
    setPage(keys.indexOf(createdAt) + 1);
    setCurrentProgress(0);
  };


  // Save
  const handleSave = async () => {
    if (!selectedKey) return;
    const notificationId = notifications.show({
      title: "Saving...",
      message: "保存中",
      position: "top-center",
      loading: true,
      autoClose: false,
      withCloseButton: false,
    });
    try {
      await chrome.storage.sync.set({ [STORAGE_KEY]: memos });
      setTimeout(() => {
        notifications.update({
          title: "Save Completed!",
          message: "保存が完了しました",
          position: "top-center",
          loading: false,
          autoClose: 1000,
          withCloseButton: true,
          color: "teal",
          id: notificationId,
          icon: <FaCheck size={18} />,
        });
      }, 1000);
    } catch (error) {
      setTimeout(() => {
        notifications.update({
          title: "Save Failed!",
          message: `保存に失敗しました:\n ${error}`,
          position: "top-center",
          loading: false,
          autoClose: 5000,
          withCloseButton: true,
          color: "red",
          id: notificationId,
          icon: <FaExclamation size={18} />,
        });
      }, 1000);
    }
  };

  // Delete
  const handleDelete = () => {
    modals.openConfirmModal({
      withCloseButton: false,
      children: (<Text size="sm">本当に削除しますか?</Text>),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      cancelProps: { variant: "light", color: "green" },
      size: "210px",
      onConfirm: async () => {
        if (!selectedKey) return;
        const notificationId = notifications.show({
          title: "Deleting...",
          message: "削除中",
          position: "top-center",
          loading: true,
          autoClose: false,
          withCloseButton: false,
        });
        const updatedMemos = { ...memos };
        delete updatedMemos[selectedKey];
        try {
          await chrome.storage.sync.set({ [STORAGE_KEY]: updatedMemos });
        } catch (error) {
          setTimeout(() => {
            notifications.update({
              title: "Delete Failed!",
              message: `データ削除に失敗しました:\n ${error}`,
              position: "top-center",
              loading: false,
              autoClose: 5000,
              withCloseButton: true,
              color: "red",
              id: notificationId,
              icon: <FaExclamation size={18} />,
            });
          }, 1000);
        }
        setMemos(updatedMemos);
        const keys = Object.keys(updatedMemos).sort();
        setSelectedKey(keys.length > 0 ? keys[0] : null);
        setPage(keys.length > 0 ? 1 : 0);
        setTimeout(() => {
          notifications.update({
            title: "Delete Completed!",
            message: "削除が完了しました",
            position: "top-center",
            loading: false,
            autoClose: 1000,
            withCloseButton: true,
            color: "teal",
            id: notificationId,
            icon: <FaCheck size={18} />,
          });
        }, 1000);
      },
      styles: {
        title: { textAlign: 'center' },
        body: {
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        },
      },
    });
  };

  // Pagination
  const handlePagination = (pageNumber: number) => {
    const keys = Object.keys(memos).sort();
    if (keys[pageNumber - 1]) {
      setSelectedKey(keys[pageNumber - 1]);
      const content = memos[keys[pageNumber - 1]];
      setCurrentProgress(calculatePercentageOfMaxBytes(content));
      setPage(pageNumber);
    }
  };

  // UI再レンダリング必要ないため、Stateで管理する必要なし
  const selectedContent = selectedKey ? memos[selectedKey] : "";
  const totalPages = Object.keys(memos).length;

  return (
    <Flex mih={"97vh"} h={"auto"} direction={"column"} gap={"14px"}>
      <Flex gap={"14px"} wrap={"wrap"}>
        <Button onClick={handleNew} color="blue" disabled={totalPages >= 10}>New</Button>
        <Button onClick={handleSave} color="green" disabled={!selectedKey}>Save</Button>
        <Button onClick={handleDelete} color="red" disabled={!selectedKey}>Delete</Button>
        <Button onClick={fetchMemos} color="yellow">Reload</Button>
      </Flex>
      {totalPages > 0 && (
        <Pagination
          value={page}
          total={totalPages}
          siblings={10}
          withControls={false}
          onChange={handlePagination}
        />
      )}
      <Progress
        value={currentProgress}
        size={"lg"}
        color={
          currentProgress > 90 ? "red" :
          currentProgress > 75 ? "orange" :
          currentProgress > 50 ? "yellow" : "violet"
        }
      />
      <CustomRichTextEditor value={selectedContent} onChange={handleMemoChange} />
    </Flex>
  );
}

export default App;
