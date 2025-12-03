"use client";

import { useState } from "react";

export default function UploadZone({
  label,
  type,
  onUpload,
}: {
  label: string;
  type: string;
  onUpload: (file: File) => void;
}) {
  const [dragActive, setDragActive] = useState(false);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(false);

    const file = e.dataTransfer.files[0];
    if (file) onUpload(file);
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={handleDrop}
      className={`border-2 p-4 rounded-lg text-center cursor-pointer ${
        dragActive ? "border-blue-400 bg-blue-900/20" : "border-gray-700"
      }`}
    >
      <p className="text-gray-300">
        Загрузить <b>{label}</b> (Тип: {type})<br />
        Можно перетащить файл сюда
      </p>

      <input
        type="file"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onUpload(file);
        }}
      />
    </div>
  );
}
