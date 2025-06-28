import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

interface TranslationPopupProps {
  text: string;
  position: { x: number; y: number };
  onClose: () => void;
}

// selection-translator/entrypoints/content/components/TranslationPopup.tsx

const PopupContainer = styled.div<{ x: number; y: number }>`
  position: absolute;
  left: ${props => props.x}px;
  top: ${props => props.y}px;
  z-index: 10000;
  
  /* popup背景色と同じグラデーション（不透明） */
  background: linear-gradient(135deg, #667eea, #764ba2);
  
  /* ボーダーとシャドウ */
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.15),
    0 0 0 1px rgba(255, 255, 255, 0.1) inset;
  
  /* テキストスタイル */
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
  
  padding: 12px 16px;
  max-width: 320px;
  min-width: 120px;
  word-wrap: break-word;
  
  /* アニメーション */
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
  animation: popupAppear 0.2s ease-out forwards;
  
  @keyframes popupAppear {
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
  
  /* ホバー効果 */
  &:hover {
    background: linear-gradient(135deg, #7488f0, #8b5bc7);
    border-color: rgba(255, 255, 255, 0.3);
  }
  
  /* レスポンシブ対応 */
  @media (max-width: 480px) {
    max-width: 280px;
    font-size: 13px;
    padding: 10px 14px;
  }
`;

const LoadingIndicator = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  
  &::after {
    content: '';
    width: 12px;
    height: 12px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top: 2px solid rgba(255, 255, 255, 0.8);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

// React.FCを使わずに関数コンポーネントとして定義
export function TranslationPopup(props: TranslationPopupProps) {
  const { text, position, onClose } = props;
  const popupRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (text && text !== "Translating...") {
      setIsLoading(false);
    }
  }, [text]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    // 少し遅らせてイベントリスナーを追加（ポップアップ作成時のクリックを避けるため）
    const timer = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [onClose]);

  return (
    <PopupContainer
      ref={popupRef}
      x={position.x}
      y={position.y}
    >
      {isLoading ? (
        <LoadingIndicator>
          Translating...
        </LoadingIndicator>
      ) : (
        text
      )}
    </PopupContainer>
  );
}