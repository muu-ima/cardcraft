// frontend/types/card.ts

// 共通
export type BaseBlock = {
  id: string;
  type: 'text' | 'image' | 'icon';
  x: number;
  y: number;
  zIndex: number;
};

// テキスト
export type TextBlock = BaseBlock & {
  type: 'text';
  text: string;
  fontSize: number;
  color: string;
  fontFamily: string;
};

// 画像 or アイコン
export type ImageBlock = BaseBlock & {
  type: 'image' | 'icon';
  src: string;
  width: number;
  height: number;
};

export type Block = TextBlock | ImageBlock;

export type Card = {
  id?: number;
  name: string;     // 名刺タイトル
  template: string; // 背景画像
  blocks: Block[];
};
