export default function WatchfacePreview({ watchface }) {
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 text-white">
      {/* ICON */}
      <div className="flex items-center gap-4 mb-6">
        {watchface.files.find((f: any) => f.type === "icon") ? (
          <img
            src={watchface.files.find((f: any) => f.type === "icon").url}
            className="w-24 h-24 rounded-xl border border-gray-600"
          />
        ) : (
          <div className="w-24 h-24 rounded-xl border border-gray-700 bg-gray-800 flex items-center justify-center text-gray-500">
            ICON
          </div>
        )}

        <div>
          <h2 className="text-2xl font-semibold">{watchface.name}</h2>
          <p className="text-gray-400">slug: {watchface.slug}</p>
          <p className="text-green-400 text-lg font-bold mt-1">${watchface.price}</p>
        </div>
      </div>

      {/* BANNER */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Баннер</h3>
        {watchface.files.find((f: any) => f.type === "banner") ? (
          <img
            src={watchface.files.find((f: any) => f.type === "banner").url}
            className="w-full rounded-lg border border-gray-700"
          />
        ) : (
          <div className="w-full h-40 bg-gray-800 rounded-lg flex items-center justify-center text-gray-500">
            Нет баннера
          </div>
        )}
      </div>

      {/* DESCRIPTION */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Описание</h3>
        <p className="text-gray-300 whitespace-pre-line">{watchface.description}</p>
      </div>

      {/* SCREENSHOTS */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Скриншоты</h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {watchface.files
            .filter((f: any) => f.type === "screenshot")
            .map((f: any) => (
              <img
                key={f.id}
                src={f.url}
                className="w-full rounded-lg border border-gray-700"
              />
            ))}

          {watchface.files.filter((f: any) => f.type === "screenshot").length === 0 && (
            <div className="text-gray-500">Нет скриншотов</div>
          )}
        </div>
      </div>
    </div>
  );
}
