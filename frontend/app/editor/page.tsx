"use client";

import { Stage, Layer, Text, Rect } from "react-konva";
import { TemplateImage } from "./TemplateImage";
import { useState, useRef } from "react";
import type { Stage as KonvaStage } from "konva/lib/Stage";

export default function Editor() {
  const [name, setName] = useState("山田太郎");
  const [textPos, setTextPos] = useState({ x: 100, y: 300 });

  // ★ 追加：送信中かどうか
  const [sending, setSending] = useState(false);

  const CARD_WIDTH = 800;
  const CARD_HEIGHT = 400;

  // Konva の Stage インスタンスを参照
  const stageRef = useRef<KonvaStage | null>(null);

  // ★ PNG ダウンロード
  const handleDownload = () => {
    const stage = stageRef.current;
    if (!stage) return;

    // 高解像度で取りたいので pixelRatio を 2 にしておく
    const dataURL = stage.toDataURL({
      pixelRatio: 2,
    });

    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "card.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ★ 追加：FastAPI にスナップショット送信
  const handleSendSnapshot = async () => {
    setSending(true);
    try {
      const res = await fetch("http://localhost:8000/snapshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          x: textPos.x,
          y: textPos.y,
          template: "cocco-bg-11.png",
        }),
      });

      const data = await res.json();
      console.log("snapshot response:", data);
      alert("スナップショット送信しました（まだ保存はしていません）");
    } catch (e) {
      console.error(e);
      alert("送信に失敗しました");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-6 flex flex-col items-center space-y-4">
      <h1 className="text-2xl font-bold">名刺エディタ（仮）</h1>

      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={9}
        className="border p-2 rounded w-64 text-center"
        placeholder="名前を入力（最大9文字）"
      />

      {/* ボタンを2つ並べる */}
      <div className="flex gap-2">
        {/* ★ PNG ダウンロードボタン */}
        <button
          onClick={handleDownload}
          className="px-4 py-2 rounded bg-blue-600 text-white text-sm shadow hover:bg-blue-700"
        >
          PNGとしてダウンロード
        </button>

        {/* ★ 追加：スナップショット送信ボタン */}
        <button
          onClick={handleSendSnapshot}
          disabled={sending}
          className="px-4 py-2 rounded bg-green-600 text-white text-sm shadow hover:bg-green-700 disabled:opacity-60"
        >
          {sending ? "送信中..." : "スナップショット送信"}
        </button>
      </div>

      <div
        className="bg-white shadow mt-4"
        style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
      >
        <Stage
          width={CARD_WIDTH}
          height={CARD_HEIGHT}
          ref={stageRef} // ★ ここ大事
        >
          <Layer>
            {/* 背景画像 */}
            <TemplateImage
              src="/cocco-bg-11.png"
              width={CARD_WIDTH}
              height={CARD_HEIGHT}
            />

            {/* テキスト（ドラッグで移動） */}
            <Text
              text={name}
              x={textPos.x}
              y={textPos.y}
              draggable
              onDragMove={(e) =>
                setTextPos({ x: e.target.x(), y: e.target.y() })
              }
              fontSize={36}
              fontStyle="bold"
              fill="black"
            />

            {/* 枠線 */}
            <Rect
              x={0}
              y={0}
              width={CARD_WIDTH}
              height={CARD_HEIGHT}
              stroke="black"
              strokeWidth={2}
              fillEnabled={false}
              listening={false}
            />
          </Layer>
        </Stage>
      </div>
    </div>
  );
}
