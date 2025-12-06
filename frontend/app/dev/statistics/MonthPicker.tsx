"use client";

import { useState, useRef, useEffect } from "react";

type MonthPickerProps = {
  value: string; // Format: "YYYY-MM"
  onChange: (value: string) => void;
};

const MONTHS = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];

export default function MonthPicker({ value, onChange }: MonthPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(() => {
    const [year] = value.split("-");
    return parseInt(year) || new Date().getFullYear();
  });
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [year, month] = value.split("-").map(Number);
  const currentMonth = month - 1; // 0-based

  // Закрываем меню при клике вне его
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleMonthSelect = (monthIndex: number) => {
    const newValue = `${selectedYear}-${String(monthIndex + 1).padStart(2, "0")}`;
    onChange(newValue);
    setIsOpen(false);
  };

  const handleYearChange = (delta: number) => {
    setSelectedYear((prev) => prev + delta);
  };

  const formatDisplayValue = () => {
    return `${MONTHS[currentMonth]} ${year}`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Выберите месяц
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full sm:w-auto min-w-[200px] px-4 py-2.5 backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border border-white/20 dark:border-gray-700/30 rounded-lg text-gray-900 dark:text-white hover:bg-white/70 dark:hover:bg-gray-800/70 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm hover:shadow-md flex items-center justify-between gap-2"
      >
        <span className="font-medium">{formatDisplayValue()}</span>
        <svg
          className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full sm:w-auto min-w-[280px] backdrop-blur-2xl bg-white/80 dark:bg-gray-900/80 border border-white/20 dark:border-gray-700/30 rounded-xl shadow-xl overflow-hidden">
          {/* Заголовок с годом */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-white/50 dark:bg-gray-800/50">
            <button
              type="button"
              onClick={() => handleYearChange(-1)}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <svg
                className="w-5 h-5 text-gray-600 dark:text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              {selectedYear}
            </span>
            <button
              type="button"
              onClick={() => handleYearChange(1)}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <svg
                className="w-5 h-5 text-gray-600 dark:text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          {/* Список месяцев */}
          <div className="p-2 grid grid-cols-3 gap-1">
            {MONTHS.map((monthName, index) => {
              const isSelected = selectedYear === year && index === currentMonth;
              const isCurrentMonth =
                selectedYear === new Date().getFullYear() &&
                index === new Date().getMonth();

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleMonthSelect(index)}
                  className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-md"
                      : isCurrentMonth
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  {monthName}
                </button>
              );
            })}
          </div>

          {/* Быстрый выбор: текущий месяц */}
          <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-white/30 dark:bg-gray-800/30">
            <button
              type="button"
              onClick={() => {
                const now = new Date();
                const currentMonthValue = `${now.getFullYear()}-${String(
                  now.getMonth() + 1
                ).padStart(2, "0")}`;
                onChange(currentMonthValue);
                setSelectedYear(now.getFullYear());
                setIsOpen(false);
              }}
              className="w-full text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium py-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            >
              Текущий месяц
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

