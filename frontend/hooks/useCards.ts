// hooks/useCards.ts
"use client";

import { useState, useEffect, useCallback } from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export type Card = {
  id: number;
  name: string;
  x: number;
  y: number;
  template: string;
};

export function useCards() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // 一覧取得
  const fetchCards = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API_BASE}/cards`, {
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
  }, []);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  // 削除
  const deleteCard = useCallback(
    async (id: number) => {
      const ok = window.confirm("このスナップショットを削除しますか？");
      if (!ok) return;

      setDeletingId(id);
      try {
        const res = await fetch(`${API_BASE}/cards/${id}`, {
          method: "DELETE",
        });

        if (!res.ok && res.status !== 204) {
          throw new Error("削除に失敗しました");
        }

        setCards((prev) => prev.filter((card) => card.id !== id));
      } catch (e) {
        console.error(e);
        alert("削除に失敗しました");
      } finally {
        setDeletingId(null);
      }
    },
    []
  );

  return {
    cards,
    loading,
    error,
    deletingId,
    deleteCard,
    reload: fetchCards,
  };
}
