import { notFound } from "next/navigation";

const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export default async function CardDetailPage ({
    params,
}: {
    params: { id:string};
}) {
    const res = await fetch(`${API_BASE}/cards/${params.id}`, {
        cache: "no-store",    
    });

    if(!res.ok) return notFound();

    const card =await res.json();

    return (
        <main>
            <h1>カード詳細</h1>
            <div>
                <p>ID: {card.id}</p>
                <p>名前: {card.name}</p>
                <p>位置: x={card.x}, y={card.y}</p>
                <p></p>
            </div>

            <a href={`/editor?id=${card.id}`}>編集する</a>
        </main>
    )
}