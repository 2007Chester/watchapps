export default function VerifySuccessPage() {
  return (
    <div className="min-h-screen bg-[#05060A] flex items-center justify-center px-4">
      <div className="bg-[#151823] p-8 rounded-3xl max-w-md w-full border border-white/10 shadow-xl">

        <h1 className="text-2xl font-semibold text-white text-center mb-4">
          Email подтверждён!
        </h1>

        <p className="text-white/60 text-sm text-center mb-6">
          Спасибо! Ваш email успешно подтверждён.
        </p>

        <a
          href="/dev/login"
          className="block w-full text-center py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-500 active:scale-95 transition"
        >
          Войти
        </a>
      </div>
    </div>
  );
}
