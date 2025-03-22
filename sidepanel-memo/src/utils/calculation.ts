/**
 * 与えられた文字列のバイト数を返却
 * @param str - 対象文字列
 * @returns 対象文字列のバイト数
 */
export function getStringByteLength(str: string): number {
    const encoder = new TextEncoder();
    const encoded = encoder.encode(str);
    return encoded.length;
}

/**
 * 8KB（8192バイト = 100を基準として）割合を計算
 * @param str - 対象文字列
 * @returns 8KBに対する使用割合を整数で返却
 */
export function calculatePercentageOfMaxBytes(str: string): number {
    const maxBytes = 7 * 1024;
    const byteLength = getStringByteLength(str);
    const percentage = (byteLength / maxBytes) * 100;
    return Math.min(Math.floor(percentage), 100);
}
