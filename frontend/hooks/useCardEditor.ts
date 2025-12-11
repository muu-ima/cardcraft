// hooks/useCardEditor.ts
"use client";

import { useState, useEffect, useRef } from "react";
import type { Stage as KonvaStage } from "konva/lib/Stage";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

type TextPos = { x: number; y: number };

export function useCardEditor(editId: string | null) {
  const [name, setName] = useState("山田太郎");
  const [textPos, setTextPos] = useState<TextPos>({ x: 100, y: 300 });
  const [sending, setSending] = useState(false);

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
        // template を増やしたらここで反映
      } catch (e) {
        console.error(e);
      }
    })();
  }, [editId]);

  // ---- PNG ダウンロード ----
  const downloadPng = () => {
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
  const save = async () => {
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
        // 👇 ここを一旦ログ出すようにしておくと原因追いやすい
        console.error("save error:", res.status, await res.text());
        alert("保存に失敗しました");
        return;
      }

      const saved = await res.json();
      console.log("saved card:", saved);

      alert(isEdit ? "更新しました" : "保存しました");
    } catch (e) {
      console.error(e);
      alert("通信エラーが発生しました");
    } finally {
      setSending(false);
    }
  };

  return {
    name,
    setName,
    textPos,
    setTextPos,
    sending,
    save,
    downloadPng,
    stageRef,
  };
}
