import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const RegisterForm = () => {
  const { loginUser } = useContext(AuthContext)!;
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
  });

  const [phase, setPhase] = useState<"form" | "verify">("form");
  const [pendingEmail, setPendingEmail] = useState<string>("");
  const [pendingPassword, setPendingPassword] = useState<string>("");
  const [busy, setBusy] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const sendVerificationEmail = async (email: string) => {
    try {
      await fetch("http://localhost:8080/api/auth/send-verification-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch (e) {
      // Non-fatal for UI; user can retry
      console.warn("sendVerificationEmail failed", e);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMessage("");

    try {
      const res = await fetch("http://localhost:8080/api/auth/register/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Помилка реєстрації");
      }

      // Send verification email and redirect to dedicated page
      await sendVerificationEmail(form.email);
      // store creds for auto-login after verification (ephemeral)
      sessionStorage.setItem("verify_email", form.email);
      sessionStorage.setItem("verify_password", form.password);
      navigate(`/verify-pending?email=${encodeURIComponent(form.email)}`);
      return;
    } catch (err: any) {
      alert(err.message || "Помилка при реєстрації");
    } finally {
      setBusy(false);
    }
  };

  const handleResend = async () => {
    if (!pendingEmail) return;
    setBusy(true);
    setMessage("");
    try {
      await sendVerificationEmail(pendingEmail);
      setMessage("Лист з підтвердженням повторно надіслано.");
    } catch (e: any) {
      setMessage("Не вдалося надіслати лист. Спробуйте ще раз.");
    } finally {
      setBusy(false);
    }
  };

  const handleIverified = async () => {
    if (!pendingEmail) return;
    setBusy(true);
    setMessage("");
    try {
      const statusRes = await fetch(
        `http://localhost:8080/api/auth/verification-status?email=${encodeURIComponent(pendingEmail)}`
      );
      if (!statusRes.ok) throw new Error("Не вдалося перевірити статус верифікації");
      const status = await statusRes.json();
      if (status?.verified) {
        // Auto-login after verification
        const loginRes = await fetch("http://localhost:8080/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: pendingEmail, password: pendingPassword }),
        });
        if (!loginRes.ok) {
          // If login fails (e.g., password mismatch), just redirect to login page
          window.location.href = "/login";
          return;
        }
        const data = await loginRes.json();
        await loginUser(data); // expects token + meta
        window.location.href = "/dashboard";
      } else {
        setMessage("Email ще не підтверджено. Будь ласка, перевірте пошту та спробуйте знову.");
      }
    } catch (e: any) {
      setMessage(e?.message || "Помилка перевірки статусу");
    } finally {
      setBusy(false);
    }
  };

  if (phase === "verify") {
    return (
      <div>
        <h2>Підтвердження email</h2>
        <p>{message || "Ми надіслали лист на вашу пошту. Натисніть кнопку нижче після підтвердження."}</p>
        <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
          <button type="button" onClick={handleIverified} disabled={busy}>
            {busy ? "Перевіряємо..." : "Я підтвердив"}
          </button>
          <button type="button" onClick={handleResend} disabled={busy}>
            Надіслати лист ще раз
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleRegister}>
      <h2>Реєстрація</h2>
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="username"
        placeholder="Нікнейм"
        value={form.username}
        onChange={handleChange}
        required
      />
      <input
        type="password"
        name="password"
        placeholder="Пароль"
        value={form.password}
        onChange={handleChange}
        required
      />
      <button type="submit" disabled={busy}>{busy ? "Опрацьовуємо..." : "Зареєструватися"}</button>
    </form>
  );
};

export default RegisterForm;
