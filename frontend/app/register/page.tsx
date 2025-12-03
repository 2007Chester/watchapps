"use client";

import { useState, useEffect, useMemo } from "react";
import { apiFetch, API_URL } from "@/lib/api";

type EmailStatus = "idle" | "typing" | "checking" | "ok" | "error";

export default function RegisterUserPage() {
  const role = "user";

  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");

  const [email, setEmail] = useState("");
  const [emailStatus, setEmailStatus] = useState<EmailStatus>("idle");
  const [emailMessage, setEmailMessage] = useState(
    "Укажите email — он используется для входа."
  );

  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);

  const [acceptTerms, setAcceptTerms] = useState(false);
  const [termsError, setTermsError] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [attempted, setAttempted] = useState(false);

  // email format check
  const emailFormatValid = useMemo(() => {
    const r = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return r.test(email.trim());
  }, [email]);

  // validate name
  useEffect(() => {
    if (!name) return setNameError("Введите имя.");
    if (name.length < 2) return setNameError("Имя слишком короткое.");
    setNameError("");
  }, [name]);

  // email check debounce
  useEffect(() => {
    if (!email) {
      setEmailStatus("idle");
      setEmailMessage("Укажите email.");
      return;
    }

    if (!emailFormatValid) {
      setEmailStatus("error");
      setEmailMessage("Неверный формат email.");
      return;
    }

    setEmailStatus("checking");
    setEmailMessage("Проверяем email…");

    let cancel = false;
    const timer = setTimeout(async () => {
      try {
        const res = await apiFetch("/auth/check-email", {
          method: "POST",
          body: JSON.stringify({ email, role }),
        });

        if (cancel) return;

        if (res.exists) {
          setEmailStatus("error");
          setEmailMessage("Email уже используется как пользователь.");
        } else if (res.exists_other) {
          setEmailStatus("ok");
          setEmailMessage("Email занят другой ролью — можно использовать.");
        } else {
          setEmailStatus("ok");
          setEmailMessage("Email доступен.");
        }
      } catch {
        if (!cancel) {
          setEmailStatus("error");
          setEmailMessage("Ошибка соединения.");
        }
      }
    }, 600);

    return () => {
      cancel = true;
      clearTimeout(timer);
    };
  }, [email, role, emailFormatValid]);

  // password rules
  useEffect(() => {
    if (!password && !password2) {
      setPasswordMessage("Минимум 6 символов.");
      return;
    }

    if (password.length < 6) {
      setPasswordMessage("Минимум 6 символов.");
      return;
    }

    if (password !== password2) {
      setPasswordMessage("Пароли не совпадают.");
      return;
    }

    setPasswordMessage("Пароли совпадают ✅");
  }, [password, password2]);

  const hasPasswordError =
    password.length < 6 || (password2 && password !== password2);

  const canSubmit =
    name &&
    !nameError &&
    emailFormatValid &&
    emailStatus !== "error" &&
    password &&
    password2 &&
    !hasPasswordError &&
    acceptTerms &&
    !loading;

  async function register() {
    setAttempted(true);

    if (!acceptTerms) {
      setTermsError("Вы должны принять условия.");
      return;
    }

    if (!canSubmit) return;

    setLoading(true);

    try {
      // Получаем CSRF cookie перед регистрацией
      const baseUrl = API_URL.replace('/api', '');
      await fetch(`${baseUrl}/sanctum/csrf-cookie`, {
        method: "GET",
        credentials: "include",
      });

      const res = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name,
          email,
          password,
          password_confirmation: password2,
          role,
        }),
      });

      if (res?.user) {
        setSuccess("Успешно! Перенаправляем…");
        setTimeout(() => (window.location.href = "/verify/send"), 1200);
      } else {
        alert("Ошибка регистрации.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert("Ошибка соединения.");
    }

    setLoading(false);
  }

  const emailColor =
    emailStatus === "checking"
      ? "text-blue-400"
      : emailStatus === "ok"
      ? "text-emerald-400"
      : emailStatus === "error"
      ? "text-red-400"
      : "text-white/40";

  const passColor =
    hasPasswordError && passwordMessage
      ? "text-red-400"
      : passwordMessage === "Пароли совпадают ✅"
      ? "text-emerald-400"
      : "text-white/40";

  return (
    <div className="min-h-screen bg-[#05060A] flex justify-center items-center p-6">
      <div className="max-w-md w-full bg-[#151823] border border-white/5 rounded-3xl p-8 shadow-xl">
        <h1 className="text-3xl text-white text-center mb-6 font-semibold">
          Регистрация пользователя
        </h1>

        {/* NAME */}
        <label className="text-white/60 text-sm">Имя</label>
        <input
          className="mt-1 w-full bg-[#10121A] text-white border border-white/10 rounded-xl px-4 py-3 focus:border-blue-500 outline-none"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ваше имя"
        />
        {nameError && <p className="text-red-400 text-xs mt-1">{nameError}</p>}

        {/* EMAIL */}
        <div className="mt-4">
          <label className="text-white/60 text-sm">Email</label>
          <input
            type="email"
            className="mt-1 w-full bg-[#10121A] text-white border border-white/10 rounded-xl px-4 py-3 focus:border-blue-500 outline-none"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailStatus("typing");
            }}
            placeholder="name@example.com"
          />
          <p className={`text-xs mt-1 ${emailColor}`}>{emailMessage}</p>
        </div>

        {/* PASSWORD */}
        <div className="mt-4">
          <label className="text-white/60 text-sm">Пароль</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="mt-1 w-full bg-[#10121A] text-white border border-white/10 rounded-xl px-4 py-3 pr-12 focus:border-blue-500 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Минимум 6 символов"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50"
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
        </div>

        {/* PASSWORD CONFIRM */}
        <div className="mt-4">
          <label className="text-white/60 text-sm">Подтверждение пароля</label>
          <div className="relative">
            <input
              type={showPassword2 ? "text" : "password"}
              className="mt-1 w-full bg-[#10121A] text-white border border-white/10 rounded-xl px-4 py-3 pr-12 focus:border-blue-500 outline-none"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              placeholder="Повторите пароль"
            />
            <button
              type="button"
              onClick={() => setShowPassword2(!showPassword2)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50"
            >
              {showPassword2 ? "🙈" : "👁️"}
            </button>
          </div>
          <p className={`text-xs mt-1 ${passColor}`}>{passwordMessage}</p>
        </div>

        {/* TERMS */}
        <div className="mt-5">
          <label className="flex gap-3 text-white/60 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="w-4 h-4 accent-blue-500"
            />
            <span>
              Я принимаю{" "}
              <a href="/terms" className="text-blue-400 underline">
                условия сервиса
              </a>
            </span>
          </label>

          {attempted && termsError && (
            <p className="text-red-400 text-xs mt-1">{termsError}</p>
          )}
        </div>

        {/* SUBMIT */}
        <button
          onClick={register}
          disabled={!canSubmit}
          className={`mt-6 w-full py-3 rounded-xl text-white font-semibold ${
            canSubmit
              ? "bg-blue-600 hover:bg-blue-500 active:scale-95"
              : "bg-white/10 text-white/40 cursor-not-allowed"
          }`}
        >
          {loading ? "Создаём аккаунт…" : "Зарегистрироваться"}
        </button>

        {success && (
          <p className="text-emerald-400 text-center text-sm mt-3">
            {success}
          </p>
        )}
      </div>
    </div>
  );
}
