"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

export default function PaymentInfoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingForApproval, setSendingForApproval] = useState(false);
  const [uploadingContract, setUploadingContract] = useState(false);
  const [errors, setErrors] = useState<any>({});

  // Form fields
  const [cardNumber, setCardNumber] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [registrationAddress, setRegistrationAddress] = useState("");
  const [employmentType, setEmploymentType] = useState<"ИП" | "самозанятый">("ИП");
  const [dataVerified, setDataVerified] = useState(false);
  const [contractUploadId, setContractUploadId] = useState<number | null>(null);
  const [contractUrl, setContractUrl] = useState<string | null>(null);
  const [paymentSentForApproval, setPaymentSentForApproval] = useState(false);
  const [paymentApprovedByAdmin, setPaymentApprovedByAdmin] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const contractInputRef = useRef<HTMLInputElement>(null);

  // Load payment info
  useEffect(() => {
    loadPaymentInfo();
  }, []);

  async function loadPaymentInfo() {
    try {
      const data = await apiFetch("/dev/payment");
      if (data.payment_details) {
        setCardNumber(data.payment_details.card_number || "");
        setFullName(data.payment_details.full_name || "");
        setPhone(data.payment_details.phone || "");
        setRegistrationAddress(data.payment_details.registration_address || "");
        setEmploymentType(data.payment_details.employment_type || "ИП");
        setDataVerified(data.payment_details.data_verified || false);
      }
      setContractUploadId(data.contract_upload_id || null);
      setContractUrl(data.contract_url || null);
      setPaymentSentForApproval(data.payment_sent_for_approval || false);
      setPaymentApprovedByAdmin(data.payment_approved_by_admin || false);
      
      // Проверяем, все ли данные заполнены
      if (data.payment_details && 
          data.payment_details.card_number &&
          data.payment_details.full_name &&
          data.payment_details.phone &&
          data.payment_details.registration_address &&
          data.payment_details.employment_type) {
        setIsSaved(true);
      }
    } catch (error) {
      console.error("Error loading payment info:", error);
    } finally {
      setLoading(false);
    }
  }

  // Format card number with spaces (XXXX XXXX XXXX XXXX)
  function formatCardNumber(value: string): string {
    const cleaned = value.replace(/\s+/g, "");
    const match = cleaned.match(/.{1,4}/g);
    return match ? match.join(" ") : cleaned;
  }

  // Format phone number
  function formatPhone(value: string): string {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length <= 1) return cleaned;
    if (cleaned.length <= 4) return `+${cleaned}`;
    if (cleaned.length <= 7) return `+${cleaned.slice(0, 1)} (${cleaned.slice(1)}`;
    if (cleaned.length <= 9) return `+${cleaned.slice(0, 1)} (${cleaned.slice(1, 4)}) ${cleaned.slice(4)}`;
    return `+${cleaned.slice(0, 1)} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 9)}-${cleaned.slice(9, 11)}`;
  }

  async function handleSave() {
    setSaving(true);
    setErrors({});

    try {
      const response = await apiFetch("/dev/payment", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          card_number: cardNumber.replace(/\s+/g, ""),
          full_name: fullName,
          phone: phone,
          registration_address: registrationAddress,
          employment_type: employmentType,
          data_verified: dataVerified,
          contract_upload_id: contractUploadId,
        }),
      });

      if (response.success) {
        setIsSaved(true);
        if (response.contract_url) {
          setContractUrl(response.contract_url);
        }
        alert("Платежная информация сохранена");
      }
    } catch (error: any) {
      console.error("Error saving payment info:", error);
      if (error.errors) {
        setErrors(error.errors);
      } else {
        alert(error.message || "Ошибка сохранения платежной информации");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleContractUpload(file: File) {
    setUploadingContract(true);
    setErrors({ ...errors, contract: undefined });

    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadData = await apiFetch("/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadData || !uploadData.id) {
        throw new Error("Invalid upload response");
      }

      setContractUploadId(uploadData.id);
      setContractUrl(uploadData.url || null);
      
      // Автоматически сохраняем после загрузки договора
      try {
        const response = await apiFetch("/dev/payment", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            card_number: cardNumber.replace(/\s+/g, ""),
            full_name: fullName,
            phone: phone,
            registration_address: registrationAddress,
            employment_type: employmentType,
            data_verified: dataVerified,
            contract_upload_id: uploadData.id,
          }),
        });

        if (response.success) {
          setIsSaved(true);
        }
      } catch (saveError) {
        console.error("Error auto-saving after contract upload:", saveError);
      }
    } catch (error: any) {
      console.error("Error uploading contract:", error);
      let errorMessage = "Ошибка загрузки договора";
      
      if (error.errors && error.errors.file) {
        errorMessage = Array.isArray(error.errors.file) 
          ? error.errors.file[0] 
          : error.errors.file;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
      setErrors({ ...errors, contract: errorMessage });
    } finally {
      setUploadingContract(false);
    }
  }

  async function handleSendForApproval() {
    if (!dataVerified) {
      alert("Необходимо подтвердить корректность введенных данных");
      return;
    }

    if (!contractUploadId) {
      alert("Необходимо загрузить подписанный договор");
      return;
    }

    setSendingForApproval(true);

    try {
      const response = await apiFetch("/dev/payment/send-for-approval", {
        method: "POST",
      });

      if (response.success) {
        setPaymentSentForApproval(true);
        alert("Платежная информация отправлена на подтверждение администратору");
      }
    } catch (error: any) {
      console.error("Error sending for approval:", error);
      alert(error.message || "Ошибка отправки на подтверждение");
    } finally {
      setSendingForApproval(false);
    }
  }

  function handleCancel() {
    if (confirm("Вы уверены, что хотите отменить? Все несохраненные изменения будут потеряны.")) {
      router.push("/dev/dashboard");
    }
  }

  // Проверяем, можно ли отправить на подтверждение
  const canSendForApproval = isSaved && 
    cardNumber && 
    fullName && 
    phone && 
    registrationAddress && 
    employmentType && 
    dataVerified && 
    contractUploadId && 
    !paymentSentForApproval;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="backdrop-blur-2xl bg-white/60 dark:bg-gray-900/60 border border-white/20 dark:border-gray-800/30 rounded-2xl p-8 shadow-2xl shadow-black/10 dark:shadow-black/30">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Платежная информация
          </h1>

          {/* Описание */}
          <div className="mb-8 p-4 backdrop-blur-sm bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-800/50 rounded-xl">
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
              <strong>Важно:</strong> Указанные данные необходимы для перевода заработанных денег. 
              Деньги переводятся один раз в месяц на указанный счет.
            </p>
            <p className="text-sm text-red-600 dark:text-red-400 font-medium">
              ⚠️ Пожалуйста, тщательно проверяйте введенную платежную информацию, 
              так как в случае ошибки деньги могут уйти не по адресу.
            </p>
          </div>

          {/* Статус подтверждения */}
          {paymentSentForApproval && (
            <div className="mb-6 p-4 backdrop-blur-sm bg-yellow-50/50 dark:bg-yellow-900/20 border border-yellow-200/50 dark:border-yellow-800/50 rounded-xl">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                ✅ Платежная информация отправлена на подтверждение администратору. 
                Ожидайте подтверждения.
              </p>
            </div>
          )}

          {paymentApprovedByAdmin && (
            <div className="mb-6 p-4 backdrop-blur-sm bg-green-50/50 dark:bg-green-900/20 border border-green-200/50 dark:border-green-800/50 rounded-xl">
              <p className="text-sm text-green-800 dark:text-green-200">
                ✅ Платежная информация подтверждена администратором.
              </p>
            </div>
          )}

          <div className="space-y-6">
            {/* Card Number */}
            <div>
              <label className="text-gray-700 dark:text-gray-300 text-sm font-medium block mb-2">
                Номер карты <span className="text-red-600 dark:text-red-400">*</span>
              </label>
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => {
                  const formatted = formatCardNumber(e.target.value);
                  if (formatted.replace(/\s+/g, "").length <= 19) {
                    setCardNumber(formatted);
                    setErrors({ ...errors, card_number: undefined });
                  }
                }}
                placeholder="1234 5678 9012 3456"
                maxLength={19 + 3} // 19 digits + 3 spaces
                className={`w-full backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white border rounded-xl px-4 py-3 focus:ring-2 outline-none transition-all ${
                  errors.card_number
                    ? "border-red-400/50 focus:border-red-500 focus:ring-red-500/20"
                    : "border-white/30 dark:border-gray-700/30 focus:border-blue-400/50 focus:ring-blue-500/20"
                }`}
                required
              />
              {errors.card_number && (
                <p className="text-red-600 dark:text-red-400 text-xs mt-1">
                  {Array.isArray(errors.card_number) ? errors.card_number[0] : errors.card_number}
                </p>
              )}
            </div>

            {/* Full Name */}
            <div>
              <label className="text-gray-700 dark:text-gray-300 text-sm font-medium block mb-2">
                ФИО <span className="text-red-600 dark:text-red-400">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  setErrors({ ...errors, full_name: undefined });
                }}
                placeholder="Иванов Иван Иванович"
                maxLength={255}
                className={`w-full backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white border rounded-xl px-4 py-3 focus:ring-2 outline-none transition-all ${
                  errors.full_name
                    ? "border-red-400/50 focus:border-red-500 focus:ring-red-500/20"
                    : "border-white/30 dark:border-gray-700/30 focus:border-blue-400/50 focus:ring-blue-500/20"
                }`}
                required
              />
              {errors.full_name && (
                <p className="text-red-600 dark:text-red-400 text-xs mt-1">
                  {Array.isArray(errors.full_name) ? errors.full_name[0] : errors.full_name}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="text-gray-700 dark:text-gray-300 text-sm font-medium block mb-2">
                Номер телефона <span className="text-red-600 dark:text-red-400">*</span>
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => {
                  const formatted = formatPhone(e.target.value);
                  setPhone(formatted);
                  setErrors({ ...errors, phone: undefined });
                }}
                placeholder="+7 (999) 123-45-67"
                className={`w-full backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white border rounded-xl px-4 py-3 focus:ring-2 outline-none transition-all ${
                  errors.phone
                    ? "border-red-400/50 focus:border-red-500 focus:ring-red-500/20"
                    : "border-white/30 dark:border-gray-700/30 focus:border-blue-400/50 focus:ring-blue-500/20"
                }`}
                required
              />
              {errors.phone && (
                <p className="text-red-600 dark:text-red-400 text-xs mt-1">
                  {Array.isArray(errors.phone) ? errors.phone[0] : errors.phone}
                </p>
              )}
            </div>

            {/* Registration Address */}
            <div>
              <label className="text-gray-700 dark:text-gray-300 text-sm font-medium block mb-2">
                Адрес регистрации <span className="text-red-600 dark:text-red-400">*</span>
              </label>
              <textarea
                value={registrationAddress}
                onChange={(e) => {
                  setRegistrationAddress(e.target.value);
                  setErrors({ ...errors, registration_address: undefined });
                }}
                placeholder="г. Москва, ул. Примерная, д. 1, кв. 1"
                maxLength={500}
                rows={3}
                className={`w-full backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white border rounded-xl px-4 py-3 focus:ring-2 outline-none transition-all resize-none ${
                  errors.registration_address
                    ? "border-red-400/50 focus:border-red-500 focus:ring-red-500/20"
                    : "border-white/30 dark:border-gray-700/30 focus:border-blue-400/50 focus:ring-blue-500/20"
                }`}
                required
              />
              {errors.registration_address && (
                <p className="text-red-600 dark:text-red-400 text-xs mt-1">
                  {Array.isArray(errors.registration_address) ? errors.registration_address[0] : errors.registration_address}
                </p>
              )}
              <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                {registrationAddress.length}/500 символов
              </p>
            </div>

            {/* Employment Type */}
            <div>
              <label className="text-gray-700 dark:text-gray-300 text-sm font-medium block mb-2">
                Тип занятости <span className="text-red-600 dark:text-red-400">*</span>
              </label>
              <div className="flex gap-4">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="employmentType"
                    value="ИП"
                    checked={employmentType === "ИП"}
                    onChange={(e) => {
                      setEmploymentType(e.target.value as "ИП" | "самозанятый");
                      setErrors({ ...errors, employment_type: undefined });
                    }}
                    className="form-radio text-blue-600"
                  />
                  <span className="ml-2 text-gray-700 dark:text-gray-300">ИП</span>
                </label>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="employmentType"
                    value="самозанятый"
                    checked={employmentType === "самозанятый"}
                    onChange={(e) => {
                      setEmploymentType(e.target.value as "ИП" | "самозанятый");
                      setErrors({ ...errors, employment_type: undefined });
                    }}
                    className="form-radio text-blue-600"
                  />
                  <span className="ml-2 text-gray-700 dark:text-gray-300">Самозанятый</span>
                </label>
              </div>
              {errors.employment_type && (
                <p className="text-red-600 dark:text-red-400 text-xs mt-1">
                  {Array.isArray(errors.employment_type) ? errors.employment_type[0] : errors.employment_type}
                </p>
              )}
            </div>

            {/* Data Verification Checkbox */}
            <div className="p-4 backdrop-blur-sm bg-gray-50/50 dark:bg-gray-800/30 border border-gray-200/50 dark:border-gray-700/50 rounded-xl">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={dataVerified}
                  onChange={(e) => {
                    setDataVerified(e.target.checked);
                    setErrors({ ...errors, data_verified: undefined });
                  }}
                  className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500 rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Я проверил всю введенную информацию и подтверждаю корректность введенных данных
                </span>
              </label>
              {errors.data_verified && (
                <p className="text-red-600 dark:text-red-400 text-xs mt-2">
                  {Array.isArray(errors.data_verified) ? errors.data_verified[0] : errors.data_verified}
                </p>
              )}
            </div>

            {/* Contract Section */}
            <div>
              <label className="text-gray-700 dark:text-gray-300 text-sm font-medium block mb-2">
                Договор оферты
              </label>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      alert("Договор оферты будет добавлен позже");
                    }}
                    className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                  >
                    📄 Скачать договор оферты
                  </a>
                </div>
                <div>
                  <input
                    ref={contractInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleContractUpload(file);
                      }
                    }}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => contractInputRef.current?.click()}
                    disabled={uploadingContract || paymentSentForApproval}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                  >
                    {uploadingContract ? (
                      <>
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Загрузка...
                      </>
                    ) : (
                      "📎 Загрузить подписанный договор"
                    )}
                  </button>
                  {contractUrl && (
                    <div className="mt-2 flex items-center gap-2">
                      <a
                        href={contractUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Просмотреть загруженный договор
                      </a>
                    </div>
                  )}
                </div>
                {errors.contract && (
                  <p className="text-red-600 dark:text-red-400 text-xs mt-1">
                    {Array.isArray(errors.contract) ? errors.contract[0] : errors.contract}
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4 mt-8">
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || uploadingContract}
                  className={`flex-1 py-3 rounded-xl text-white font-semibold transition-all ${
                    saving || uploadingContract
                      ? "bg-gray-400/50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 cursor-not-allowed backdrop-blur-sm"
                      : "backdrop-blur-sm bg-gradient-to-r from-blue-500/90 to-purple-500/90 dark:from-blue-600/90 dark:to-purple-600/90 hover:from-blue-600 hover:to-purple-600 dark:hover:from-blue-500 dark:hover:to-purple-500 active:scale-95 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 border border-white/20"
                  }`}
                >
                  {saving ? "Сохранение..." : "Сохранить"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving || uploadingContract || sendingForApproval}
                  className={`flex-1 py-3 rounded-xl text-gray-700 dark:text-gray-300 backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 hover:bg-white/70 dark:hover:bg-gray-800/70 font-semibold transition-all active:scale-95 border border-white/30 dark:border-gray-700/30 shadow-md hover:shadow-lg ${
                    saving || uploadingContract || sendingForApproval ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  Отмена
                </button>
              </div>
              
              {/* Send for Approval Button */}
              <button
                type="button"
                onClick={handleSendForApproval}
                disabled={!canSendForApproval || sendingForApproval}
                className={`w-full py-3 rounded-xl text-white font-semibold transition-all ${
                  !canSendForApproval || sendingForApproval
                    ? "bg-gray-400/50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 cursor-not-allowed backdrop-blur-sm"
                    : "backdrop-blur-sm bg-gradient-to-r from-emerald-500/90 to-teal-500/90 dark:from-emerald-600/90 dark:to-teal-600/90 hover:from-emerald-600 hover:to-teal-600 dark:hover:from-emerald-500 dark:hover:to-teal-500 active:scale-95 shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 border border-white/20"
                }`}
              >
                {sendingForApproval ? "Отправка..." : "Отправить на подтверждение администратору"}
              </button>
              {!canSendForApproval && !paymentSentForApproval && (
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  Для отправки необходимо заполнить все поля, подтвердить данные, загрузить договор и сохранить изменения
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

