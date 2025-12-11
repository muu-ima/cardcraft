"use client";

import Link from "next/link";
import { useCards } from "@/hooks/useCards";

export default function CardsPage() {
  const { cards, loading, error, deletingId, deleteCard } = useCards();

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
                     onClick={() => deleteCard(card.id)}
                     disabled={deletingId === card.id}
                     className="rounded border border-red-300 px-3 py-1 text-xs
                      text-red-600 hover:bg-red-50 disabled:opacity-60"
                     >
                      {deletingId === card.id ? "削除中..." : "削除"}
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
