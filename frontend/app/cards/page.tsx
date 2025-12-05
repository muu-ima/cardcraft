"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

type Card = {
  id: number;
  name: string;
  x: number;
  y: number;
  template: string;
};

export default function CardsPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingID, setDeletingId] = useState<number | null>(null);

  // ---- 一覧取得 ----
  useEffect(() => {
    const fetchCards = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const res = await fetch(`${API_BASE}/cards`, {
          // 毎回最新を欲しいので no-store
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error(`Failed: ${res.status}`);
        }

        const data: Card[] = await res.json();
        setCards(data);
      } catch (err) {
        console.error(err);
        setError("一覧の取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, []);

    // ---- 削除処理 ----
    const handleDelete = async(id: number) => {
      const ok = window.confirm("このスナップショットを削除しますか？");
      if (!ok) return;

      setDeletingId(id);
      try {
        const res = await fetch(`${API_BASE}/cards/${id}`, {
          method: "DELETE",
        });

        if(!res.ok && res.status !== 204) {
          throw new Error("削除に失敗しました");
        }

        // フロント側の一覧からも削除
        setCards((prev) => prev.filter((card) => card.id !==id));
      } catch (e) {
        console.error(e);
        alert("削除に失敗しました");
      } finally {
        setDeletingId(null);
      }
    };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">名刺スナップショット一覧</h1>

          <Link
            href="/editor"
            className="inline-flex items-center rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            新しい名刺を作る
          </Link>
        </div>

        {/* 状態表示 */}
        {loading && <p className="text-sm text-gray-500">読み込み中です...</p>}

        {error && (
          <p className="text-sm text-red-600 border border-red-200 bg-red-50 px-3 py-2 rounded">
            {error}
          </p>
        )}

        {/* 一覧本体 */}
        {!loading && !error && (
          <>
            {cards.length === 0 ? (
              <p className="text-sm text-gray-500">
                まだ保存されたスナップショットがありません。
              </p>
            ) : (
              <ul className="grid gap-4 md:grid-cols-2">
                {cards.map((card) => (
                  <li
                    key={card.id}
                    className="rounded border border-gray-200 bg-white p-4 shadow-sm flex flex-col justify-between"
                  >
                    <div className="space-y-1">
                      <div className="text-xs text-gray-400">ID: {card.id}</div>
                      <div className="text-lg font-semibold">
                        {card.name || "（名前なし）"}
                      </div>
                      <div className="text-xs text-gray-500">
                        テンプレート: {card.template}
                      </div>
                      <div className="text-xs text-gray-500">
                        位置: x={card.x}, y={card.y}
                      </div>
                    </div>

                    {/* 再編集用のリンクは後で実装する想定 */}
                    <div className="mt-3 flex justify-end">
                      <Link
                        href={`/editor?id=${card.id}`}
                        className="rounded border border-gray-300 px-3 py-1 text-xs text-gray-700 hover:bg-gray-50"
                      >
                        編集
                      </Link>
                     {/* 削除ボタン */}
                     <button
                     type="button"
                     onClick={() => handleDelete(card.id)}
                     disabled={deletingID === card.id}
                     className="rounded border border-red-300 px-3 py-1 text-xs
                      text-red-600 hover:bg-red-50 disabled:opacity-60"
                     >
                      {deletingID === card.id ? "削除中..." : "削除"}
                     </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </main>
  );
}
