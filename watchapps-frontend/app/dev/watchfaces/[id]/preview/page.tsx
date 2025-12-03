import { API_URL } from "@/lib/api";
import { getUser } from "@/lib/auth";
import WatchfacePreview from "../edit/WatchfacePreview";

export default async function PreviewPage({ params }) {
  const user = await getUser();

  if (!user || user.role !== "developer") {
    return (
      <meta httpEquiv="refresh" content="0; url=/login?redirect=/dev/watchfaces/${params.id}/preview" />
    );
  }

  const res = await fetch(`${API_URL}/dev/watchfaces/${params.id}`, {
    method: "GET",
    credentials: "include",
  });

  const watchface = await res.json();

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Предпросмотр: {watchface.name}</h1>
      <WatchfacePreview watchface={watchface} />
    </div>
  );
}
