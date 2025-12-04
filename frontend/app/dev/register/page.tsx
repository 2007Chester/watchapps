"use client";

import { useState, useEffect, useMemo } from "react";
import { apiFetch, API_URL } from "@/lib/api";

// Логируем API_URL для отладки
console.log('API_URL:', API_URL);

type EmailStatus = "idle" | "typing" | "checking" | "ok" | "error";

export default function RegisterDeveloperPage() {
  const role = "developer";

  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [email, setEmail] = useState("");
  const [emailStatus, setEmailStatus] = useState<EmailStatus>("idle");
  const [emailMessage, setEmailMessage] = useState(
    "Введите email разработчика."
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

  // Проверяем, авторизован ли пользователь
  useEffect(() => {
    async function checkAuth() {
      const token = typeof window !== 'undefined' ? localStorage.getItem("wa_token") : null;
      if (!token) {
        setCheckingAuth(false);
        return;
      }

      try {
        const user = await apiFetch("/auth/user");
        if (user) {
          const roles = user.roles || [];
          // Если пользователь авторизован, редиректим
          if (roles.includes("developer")) {
            // Редирект на dashboard или onboarding в зависимости от статуса
            if (user.onboarding_completed) {
              window.location.href = "/dev/dashboard";
            } else {
              window.location.href = "/dev/onboarding";
            }
          } else {
            // Если пользователь авторизован, но не разработчик, редиректим на главную
            window.location.href = "/";
          }
        }
      } catch (error) {
        // Если ошибка, значит не авторизован - продолжаем показывать форму регистрации
        console.log("User not authenticated");
      } finally {
        setCheckingAuth(false);
      }
    }

    checkAuth();
  }, []);

  // EMAIL FORMAT VALIDATION
  const emailFormatValid = useMemo(() => {
    const r = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return r.test(email.trim());
  }, [email]);

  // NAME VALIDATION
  useEffect(() => {
    if (!name) return setNameError("Введите имя.");
    if (name.length < 2) return setNameError("Имя слишком короткое.");
    setNameError("");
  }, [name]);

  // EMAIL CHECK WITH DEBOUNCE
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
        // Используем apiFetch для правильной обработки URL
        const data = await apiFetch("/auth/check-email", {
          method: "POST",
          body: JSON.stringify({ email, role }),
        });

        if (cancel) return;

        // Проверяем, что данные получены
        if (!data || typeof data !== 'object') {
          throw new Error("Неверный формат ответа от сервера");
        }

        // NEW CORRECT MULTI-ROLE LOGIC
        if (data.exists) {
          // role developer already exists
          setEmailStatus("error");
          setEmailMessage("Этот email уже зарегистрирован как разработчик.");
        } else if (data.exists_other) {
          // email exists as another role → allowed
          setEmailStatus("ok");
          setEmailMessage(
            "Email уже существует как пользователь — можно добавить роль разработчика."
          );
        } else {
          // email fully free
          setEmailStatus("ok");
          setEmailMessage("Email свободен — можно регистрировать!");
        }
      } catch (error) {
        if (!cancel) {
          setEmailStatus("error");
          let errorMessage = "Ошибка соединения";
          
          if (error instanceof Error) {
            errorMessage = error.message;
            console.error("Email check error:", error);
            console.error("Error name:", error.name);
            console.error("Error stack:", error.stack);
          } else {
            console.error("Unknown error:", error);
          }
          
          // Если это ошибка сети, даём более понятное сообщение
          if (errorMessage.includes("Failed to fetch") || errorMessage.includes("NetworkError")) {
            errorMessage = "Не удалось подключиться к серверу. Убедитесь, что backend запущен на http://localhost:8000";
          }
          
          setEmailMessage(errorMessage);
        }
      }
    }, 600);

    return () => {
      cancel = true;
      clearTimeout(timer);
    };
  }, [email, role, emailFormatValid]);

  // PASSWORD RULES
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
    email &&
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
      // 1. Получаем CSRF cookie для Sanctum (без /api, так как это не API route)
      // API_URL = "http://localhost:8000/api", нужно убрать "/api"
      const baseUrl = API_URL.endsWith('/api') ? API_URL.slice(0, -4) : API_URL.replace('/api', '');
      console.log('API_URL:', API_URL);
      console.log('baseUrl:', baseUrl);
      console.log('Getting CSRF cookie from:', `${baseUrl}/sanctum/csrf-cookie`);
      const csrfRes = await fetch(`${baseUrl}/sanctum/csrf-cookie`, {
        method: "GET",
        credentials: "include",
      });
      
      if (!csrfRes.ok) {
        console.error('CSRF cookie failed:', csrfRes.status, csrfRes.statusText);
        throw new Error(`Не удалось получить CSRF cookie (${csrfRes.status})`);
      }
      console.log('CSRF cookie received successfully');

      // 2. Выполняем регистрацию
      const registerUrl = `${API_URL}/auth/register`;
      console.log('Registering at:', registerUrl);
      const res = await fetch(registerUrl, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          password_confirmation: password2,
          role,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.message || "Ошибка регистрации.");
        setLoading(false);
        return;
      }

      const data = await res.json();

      if (data?.user) {
        setSuccess("Аккаунт разработчика успешно создан!");
        // Redirect to login after registration
        setTimeout(() => (window.location.href = "/dev/login"), 1200);
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
      ? "text-blue-600 dark:text-blue-400"
      : emailStatus === "ok"
      ? "text-emerald-600 dark:text-emerald-400"
      : emailStatus === "error"
      ? "text-red-600 dark:text-red-400"
      : "text-gray-500 dark:text-gray-400";

  const passColor =
    hasPasswordError && passwordMessage
      ? "text-red-600 dark:text-red-400"
      : passwordMessage === "Пароли совпадают ✅"
      ? "text-emerald-600 dark:text-emerald-400"
      : "text-gray-500 dark:text-gray-400";

  if (checkingAuth) {
    return (
      <div className="flex justify-center py-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-xl">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Проверка авторизации...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center py-4">
      <div className="max-w-md w-full backdrop-blur-2xl bg-white/60 dark:bg-gray-900/60 border border-white/20 dark:border-gray-800/30 rounded-3xl p-8 shadow-xl shadow-black/10 dark:shadow-black/30">
        <h1 className="text-3xl text-gray-900 dark:text-white text-center mb-6 font-semibold">
          Регистрация разработчика
        </h1>

        {/* NAME */}
        <label className="text-gray-700 dark:text-gray-300 text-sm">Имя</label>
        <input
          className="mt-1 w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-colors"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ваше имя"
        />
        {nameError && <p className="text-red-600 dark:text-red-400 text-xs mt-1">{nameError}</p>}

        {/* EMAIL */}
        <div className="mt-4">
          <label className="text-gray-700 dark:text-gray-300 text-sm">Email</label>
          <input
            type="email"
            className="mt-1 w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-colors"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailStatus("typing");
            }}
            placeholder="dev@example.com"
          />
          <p className={`text-xs mt-1 ${emailColor}`}>{emailMessage}</p>
        </div>

        {/* PASSWORD */}
        <div className="mt-4">
          <label className="text-gray-700 dark:text-gray-300 text-sm">Пароль</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="mt-1 w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 pr-12 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Минимум 6 символов"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
        </div>

        {/* PASSWORD CONFIRM */}
        <div className="mt-4">
          <label className="text-gray-700 dark:text-gray-300 text-sm">Подтверждение пароля</label>
          <div className="relative">
            <input
              type={showPassword2 ? "text" : "password"}
              className="mt-1 w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 pr-12 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-colors"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              placeholder="Повторите пароль"
            />
            <button
              type="button"
              onClick={() => setShowPassword2(!showPassword2)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              {showPassword2 ? "🙈" : "👁️"}
            </button>
          </div>

          <p className={`text-xs mt-1 ${passColor}`}>{passwordMessage}</p>
        </div>

        {/* TERMS */}
        <div className="mt-5">
          <label className="flex gap-3 text-gray-700 dark:text-gray-300 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="w-4 h-4 accent-blue-500"
            />
            <span>
              Я принимаю{" "}
              <a href="/terms" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline transition-colors">
                условия сервиса
              </a>
            </span>
          </label>

          {attempted && termsError && (
            <p className="text-red-600 dark:text-red-400 text-xs mt-1">{termsError}</p>
          )}
        </div>

        {/* SUBMIT */}
        <button
          onClick={register}
          disabled={!canSubmit}
          className={`mt-6 w-full py-3 rounded-xl text-white font-semibold transition-all ${
            canSubmit
              ? "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 active:scale-95 shadow-md hover:shadow-lg"
              : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
          }`}
        >
          {loading ? "Создаём аккаунт…" : "Зарегистрироваться"}
        </button>

        {success && (
          <p className="text-emerald-600 dark:text-emerald-400 text-center text-sm mt-3">
            {success}
          </p>
        )}

        {/* LOGIN LINK */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Уже есть аккаунт?{" "}
            <a
              href="/dev/login"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline transition-colors"
            >
              Войти
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
