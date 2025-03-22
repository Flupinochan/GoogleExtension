// Googleアカウントで同期するsync storage
// 1. 拡張機能IDは、manifest.jsonのkeyで固定して同じである必要がある?
// 2. Googleアカウントで同期を有効化する必要がある
// 3. 機密データは保持しないこと

// 結果がない場合は空objectが返る
// get(key: string | string[]): Promise<items: object> // nullを渡すと全取得可能
// set(items: object): Promise<void>
// remove(key: string | string[]): Promise<void>

// getKeys(): Promise<keys: string[]>