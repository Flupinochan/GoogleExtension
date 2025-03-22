// IndexDBのデータ形式
export interface Memo{
  memoId?: number; // autoIncrementされるためMemo作成時は不要
  title: string;
  createdAt: number;
  memoContent: string;
}

/**
 * IndexDB操作クラス (Google拡張機能でない環境におけるテスト用)
 * IndexDBの操作はコールバック関数で次の処理に進む仕組みで扱いづらいため、Promiseでラップしてawaitで処理できるようにする
 */
export class IndexDBService {
  private db: IDBDatabase | null = null;
  private dbName: string;
  private storeName: string;
  private dbVersion: number;

  /**
   * コンストラクタ
   * @param dbName - データベース名
   * @param storeName - ストア(テーブル)名
   * @param dbVersion - データベースバージョン
   */
  constructor(dbName: string, storeName: string, dbVersion: number) {
    this.dbName = dbName;
    this.storeName = storeName;
    this.dbVersion = dbVersion;
  }


  /**
   * IndexDB初期化
   * @returns {Promise}
   */
  public open(): Promise<void>{
    return new Promise((resolve, reject) => {
      // IndexDB起動
      const dbOpenRequest = window.indexedDB.open(this.dbName, this.dbVersion);

      // keyPath作成(新規バージョンの場合のみ)
      dbOpenRequest.onupgradeneeded = (event) => {
        // DBセット1
        this.db = (event.target as IDBRequest).result;
        // storeが存在しない場合のみ作成
        if (!this.db?.objectStoreNames.contains(this.storeName)) {
          // memoIdは、GETする際に指定するkeyPath
          const store = this.db?.createObjectStore(this.storeName, { keyPath: "memoId", autoIncrement: true });
          // 検索用keyPathにIndexを作成
          store?.createIndex("titleIndex", "title", { unique: false });
          store?.createIndex("createdAtIndex", "createdAt", { unique: false });
          store?.createIndex("memoContent", "memoContent", { unique: false });
        }
      };

      // IndexDB起動成功(既存バージョンの場合)
      dbOpenRequest.onsuccess = (event: Event) => {
        // DBセット2
        this.db = (event.target as IDBRequest).result as IDBDatabase;
        resolve();
      }

      // IndexDB起動失敗
      dbOpenRequest.onerror = (event: Event) => {
        const error = (event.target as IDBRequest).error;
        console.error(`IndexDBの起動に失敗しました: ${error?.message}`);
        reject();
      }
    });
  }


  /**
   * IndexDBへのデータ追加
   * @param memo - memoIdを除くmemo、title、createdAt
   * @returns {Promise<number>} - 追加したメモ情報のmemoId
   */
  public set(memo: Omit<Memo, "memoId">): Promise<number> {
    return new Promise((resolve, reject) => {
      if (!this.db) this.open();

      // Transactionの作成およびStoreの取得
      const transaction = this.db?.transaction([this.storeName], "readwrite" );
      const store = transaction?.objectStore(this.storeName);

      // IndexDBに追加
      const dbOpenRequest = store?.add(memo);

      if (dbOpenRequest) {
        // データ追加成功
        dbOpenRequest.onsuccess = () => {
          const memoId = dbOpenRequest.result as number;
          // AutoIncrementされたmemoIdを返却
          resolve(memoId);
        };

        // データ追加失敗
        dbOpenRequest.onerror = (event: Event) => {
          reject(new Error(`IndexDBへのデータ追加に失敗しました: ${(event.target as IDBRequest).error}`));
        };
      } else {
        // データ追加失敗
        reject(new Error("IndexDBへのデータ追加に失敗しました"));
      }
    });
  }


  /**
   * IndexDBからのデータ取得
   * @param memoId - メモ情報を取得したいmemoId
   * @returns {Memo} - 取得したメモ情報
   */
  public get(memoId: number): Promise<Memo | undefined> {
    return new Promise((resolve, reject) => {
      if (!this.db) this.open();

      // Transactionの作成およびStoreの取得
      const transaction = this.db?.transaction([this.storeName], "readonly" );
      const store = transaction?.objectStore(this.storeName);

      // IndexDBからメモ情報取得
      const dbOpenRequest = store?.get(memoId);

      if (dbOpenRequest) {
        // データ取得成功
        dbOpenRequest.onsuccess = () => {
          const memo = dbOpenRequest.result as Memo;
          // メモ情報を返却
          resolve(memo);
        };

        // データ取得失敗
        dbOpenRequest.onerror = (event: Event) => {
          reject(new Error(`IndexDBからのデータ取得に失敗しました: ${(event.target as IDBRequest).error}`));
        };
      } else {
        // データ取得失敗
        reject(new Error("IndexDBからのデータ取得に失敗しました"));
      }
    });
  }


  /**
   * IndexDBのデータ更新
   * @param memo - 更新するメモ情報
   * @returns {Promise<number>} - 更新したメモ情報のmemoId
   */
  public put(memo: Memo): Promise<number> {
    return new Promise((resolve, reject) => {
      if (!this.db) this.open();

      // Transactionの作成およびStoreの取得
      const transaction = this.db?.transaction([this.storeName], "readwrite");
      const store = transaction?.objectStore(this.storeName);

      // memoIdが指定されたmemoを更新
      const dbOpenRequest = store?.put(memo);

      if (dbOpenRequest) {
        // データ更新成功
        dbOpenRequest.onsuccess = () => {
          const memoId = dbOpenRequest.result as number;
          // 更新されたmemoIdを返却
          resolve(memoId);
        };

        // データ更新失敗
        dbOpenRequest.onerror = (event: Event) => {
          reject(new Error(`IndexDBのデータ更新に失敗しました: ${(event.target as IDBRequest).error}`));
        };
      } else {
        // データ更新失敗
        reject(new Error("IndexDBのデータ更新に失敗しました"));
      }
    });
  }



  /**
   * IndexDBからのデータ削除
   * @param memoId - 削除するMemo情報のmemoId
   * @returns {Promise}
   */
  public delete(memoId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) this.open();

      // Transactionの作成およびStoreの取得
      const transaction = this.db?.transaction([this.storeName], "readwrite" );
      const store = transaction?.objectStore(this.storeName);

      // IndexDBからメモ情報を削除
      const dbOpenRequest = store?.delete(memoId);

      if (dbOpenRequest) {
        // データ削除成功
        dbOpenRequest.onsuccess = () => {
          resolve();
        };

        // データ削除失敗
        dbOpenRequest.onerror = (event: Event) => {
          reject(new Error(`IndexDBからのデータ削除に失敗しました: ${(event.target as IDBRequest).error}`));
        };
      } else {
        // データ取得失敗
        reject(new Error("IndexDBからのデータ削除に失敗しました"));
      }
    });
  }


  /**
   * IndexDBからの全データ取得
   * @returns {Memo[]} - 全メモ情報の配列
   */
  public getAll(): Promise<Memo[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) this.open();

      // Transactionの作成およびStoreの取得
      const transaction = this.db?.transaction([this.storeName], "readonly" );
      const store = transaction?.objectStore(this.storeName);

      // IndexDBから全メモ情報を削除
      const dbOpenRequest = store?.getAll();

      if (dbOpenRequest) {
        // 全データ取得成功
        dbOpenRequest.onsuccess = () => {
          const memoList = dbOpenRequest.result as Memo[];
          // 全メモ情報を返却
          resolve(memoList);
        };

        // 全データ取得失敗
        dbOpenRequest.onerror = (event: Event) => {
          reject(new Error(`IndexDBからの全データ取得に失敗しました: ${(event.target as IDBRequest).error}`));
        };
      } else {
        // 全データ取得失敗
        reject(new Error("IndexDBからの全データ取得に失敗しました"));
      }
    });
  }


  /**
   * IndexDBからの全データ削除
   * @returns {Promise}
   */
  public deleteAll(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) this.open();

      // Transactionの作成およびStoreの取得
      const transaction = this.db?.transaction([this.storeName], "readonly" );
      const store = transaction?.objectStore(this.storeName);

      // IndexDBから全てのメモ情報を削除
      const dbOpenRequest = store?.clear();

      if (dbOpenRequest) {
        // 全データ削除成功
        dbOpenRequest.onsuccess = () => {
          resolve();
        };

        // 全データ削除失敗
        dbOpenRequest.onerror = (event: Event) => {
          reject(new Error(`IndexDBからの全データ削除に失敗しました: ${(event.target as IDBRequest).error}`));
        };
      } else {
        // 全データ取得失敗
        reject(new Error("IndexDBからの全データ削除に失敗しました"));
      }
    });
  }


  /**
   * IndexDBの接続を切断
   */
  public close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

}
