import "@mantine/core/styles.css";
import '@mantine/tiptap/styles.css';
import "./App.css";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Flex, Pagination, Progress, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { modals } from "@mantine/modals";
import { FaCheck } from "react-icons/fa6";

import { IndexDBService, Memo } from "./utils/indexdb";
import { getFormattedDate } from "./utils/timeManagement";
import { CustomRichTextEditor } from "./component/RichTextarea";
import { calculatePercentageOfMaxBytes } from "./utils/calculation";

function App() {
  // 選択中のメモ
  const [memo, setMemo] = useState<Memo | null>(null);
  // 全メモ情報のリスト
  const [memoList, setMemoList] = useState<Memo[]>([]);
  // IndexDB
  const indexDB = useMemo(() => {return new IndexDBService("memoDB", "memoStore", 1);}, []);
  // Pagination
  const [page, setPage] = useState<number>(1);
  // Progress
  const [currentProgress, setCurrentProgress] = useState<number>(0);

  // Memoをリアルタイムで取得
  const handleMemoChange = (value: string) => { 
    if (memo) setMemo({ ...memo, memoContent: value });
  };


  // memo、memoList更新時の処理
  useEffect(() => {
    if (memo) {
      // // MemoListの更新
      // setMemoList((prevList) => prevList.map((m) => (m.memoId === memo.memoId ? memo: m)));
      // Paginationの更新
      const pageIndex = memoList.findIndex(m => m.memoId === memo.memoId);
      setPage(pageIndex + 1);
      // Progressの更新
      const updateProgressValue = calculatePercentageOfMaxBytes(memo.memoContent);
      setCurrentProgress(updateProgressValue);
    }
  }, [memo, memoList]);

  // Newボタン
  const handleNew = useCallback(async () => {
    const tmpMemo: Memo = {
      title: getFormattedDate(),
      createdAt: Date.now(),
      memoContent: "",
    }
    const memoId = await indexDB.set(tmpMemo);
    const newMemo: Memo = { ...tmpMemo, memoId: memoId };
    setMemoList((prevList) => {
      const newMemoList = [...prevList, newMemo]
      setPage(newMemoList.length);
      return newMemoList;
    });
    setMemo(newMemo);
  }, [indexDB]);

  // Saveボタン
  const handleSave = useCallback(async () => {
    if (memo) {
      const notificationsId = notifications.show({
        title: "Saving...",
        message: "保存中",
        position: "top-center",
        loading: true,
        autoClose: false,
        withCloseButton: false,
      });
      await indexDB.put(memo);
      setMemoList((prevList) => prevList.map((m) => (m.memoId === memo.memoId ? memo: m)));
      setTimeout(() => {
        notifications.update({
          title: "Save Completed!",
          message: "保存が完了しました",
          position: "top-center",
          loading: false,
          autoClose: 1000,
          withCloseButton: true,
          color: "teal",
          id: notificationsId,
          icon: <FaCheck size={18} />,
        });
      }, 1000);
    }
  }, [indexDB, memo]);

  // Deleteボタン
    const handleDelete = () => {
      modals.openConfirmModal({
        withCloseButton: false,
        children: (<Text size="sm" >本当に削除しますか?</Text>),
        labels: { confirm: 'Delete', cancel: 'Cancel' },
        confirmProps: { color: 'red' },
        cancelProps: { variant: "light", color: "green"},
        size: "210px",
        onConfirm: async () => {
          if (memo?.memoId !== undefined && memo?.memoId !== null) {
            const notificationsId = notifications.show({
              title: "Deleting...",
              message: "削除中",
              position: "top-center",
              loading: true,
              autoClose: false,
              withCloseButton: false,
            });
            await indexDB.delete(memo.memoId);
            setMemoList((prevList) => {return prevList.filter((element) => element.memoId !== memo.memoId);});
            setMemo(memoList.length > 0 ? memoList[0] : null);
            setTimeout(() => {
            notifications.update({
              title: "Delete Completed!",
              message: "削除が完了しました",
              position: "top-center",
              loading: false,
              autoClose: 1000,
              withCloseButton: true,
              color: "teal",
              id: notificationsId,
              icon: <FaCheck size={18} />,
            });
          }, 1000);
          }
        },
        styles: {
          title: {
            textAlign: 'center',
          },
          body: {
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          },
        },
      });
    };

  // Paginationボタン
  const handlePagination = (pageNumber: number) => setMemo(memoList[pageNumber - 1]);


  // レンダリング時処理
  useEffect(() => {
    // StorageからGET
    const fetchMemo = async () => {
      // メモ情報を取得
      await indexDB.open();
      const memoList = await indexDB.getAll();
      // IDでソート
      const sortedMemoList = memoList.sort((a, b) => a.memoId! - b.memoId!);
      setMemoList(sortedMemoList);
      // メモ選択
      if (memoList.length > 0) {
        setMemo(memoList[0])
      } else {
        await handleNew();
      }
    };
    fetchMemo();
  }, [indexDB, handleNew]);


  // 再レンダリング(UI更新)、関数の再生成のタイミング
  // 1. 親コンポーネント(useStateやuseReducer/useContext等)の変更による子コンポーネント(Pagination、Button)の再レンダリング
  // 2. コンポーネントに渡される各Propsの変更: styleやonClickなどによる自身のコンポーネントの再レンダリング
  // 3. コンポーネントが再レンダリングされるたびにコンポーネントが持つ関数も再生成

  // memo, memoList, indexDBの3つがあり、デフォルトではどれか1つでも更新されたら以下のreturnにある子コンポーネントは全て再レンダリングされる
  // onClickの関数をuseCallbackで再生成されるタイミングを減らす => Propsの変更回数が減る => 再レンダリングされる回数が減る
  // valueなどの値の場合は、useMemoを使用する
  return (
    <Flex mih={"97vh"} h={"auto"} direction={"column"} gap={"14px"}>
      <Flex gap={"14px"} wrap={"wrap"}>
        <Button onClick={handleNew} color="blue" disabled={memoList.length >= 10}>New</Button>
        <Button onClick={handleSave} color="green">Save</Button>
        <Button onClick={handleDelete} color="red">Delete</Button>
      </Flex>
      <Pagination value={page} total={memoList.length} siblings={memoList.length} withControls={false} onChange={handlePagination}/>
      <Progress value={currentProgress}  size={"lg"} color={currentProgress > 90 ? "red" : currentProgress > 75 ? "orange" : currentProgress > 50 ? "yellow" : "violet"}/>
      <CustomRichTextEditor value={memo?.memoContent || ""} onChange={handleMemoChange}/>
    </Flex>
  );
}

export default App;