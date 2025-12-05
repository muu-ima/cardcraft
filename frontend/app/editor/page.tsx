// app/editor/page.tsx
"use client";

import { Stage, Layer, Text, Rect } from "react-konva";
import { TemplateImage } from "./TemplateImage";
import { useState, useEffect, useRef } from "react";
import type { Stage as KonvaStage } from "konva/lib/Stage";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export default function Editor() {
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");

  const [name, setName] = useState("山田太郎");
  const [textPos, setTextPos] = useState({ x: 100, y: 300 });
  const [sending, setSending] = useState(false);

  const CARD_WIDTH = 800;
  const CARD_HEIGHT = 400;

  const stageRef = useRef<KonvaStage | null>(null);

  // ---- 編集モードのとき、既存データを読み込む ----
  useEffect(() => {
    if (!editId) return;

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/cards/${editId}`);
        if (!res.ok) return; // 404 などは一旦無視

        const card = await res.json();
        setName(card.name);
        setTextPos({ x: card.x, y: card.y });
        // TODO: template も複数対応したらここで切り替え
      } catch (e) {
        console.error(e);
      }
    })();
  }, [editId]);

  // ---- PNG ダウンロード ----
  const handleDownload = () => {
    const stage = stageRef.current;
    if (!stage) return;

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

  // ---- 保存（新規 or 更新） ----
  const handleSave = async () => {
    setSending(true);
    try {
      const payload = {
        name,
        x: textPos.x,
        y: textPos.y,
        template: "cocco-bg-11.png",
      };

      const isEdit = Boolean(editId);

      const res = await fetch(
        isEdit ? `${API_BASE}/cards/${editId}` : `${API_BASE}/snapshot`,
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        alert("保存に失敗しました");
        return;
      }

      const saved = await res.json();
      console.log("saved card:", saved);

      alert(isEdit ? "更新しました" : "保存しました");
      // 好みで：保存後に一覧へ戻すなら
      // router.push("/cards");
    } catch (e) {
      console.error(e);
      alert("通信エラーが発生しました");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-6 flex flex-col items-center space-y-4">
      <h1 className="text-2xl font-bold">名刺エディタ（仮）</h1>

      <Link href="/cards" className="text-xs text-blue-600 hover:underline">
        保存済みスナップショット一覧を見る
      </Link>

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
        <button
          onClick={handleDownload}
          className="px-4 py-2 rounded bg-blue-600 text-white text-sm shadow hover:bg-blue-700"
        >
          PNGとしてダウンロード
        </button>

        <button
          onClick={handleSave}
          disabled={sending}
          className="px-4 py-2 rounded bg-green-600 text-white text-sm shadow hover:bg-green-700 disabled:opacity-60"
        >
          {sending ? "保存中..." : editId ? "更新する" : "保存する"}
        </button>
      </div>

      <div
        className="bg-white shadow mt-4"
        style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
      >
        <Stage width={CARD_WIDTH} height={CARD_HEIGHT} ref={stageRef}>
          <Layer>
            <TemplateImage
              src="/cocco-bg-11.png"
              width={CARD_WIDTH}
              height={CARD_HEIGHT}
            />
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
