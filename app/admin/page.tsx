"use client";

import { useEffect, useState } from "react";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Community links
  const [whatsapp, setWhatsapp] = useState("");
  const [telegram, setTelegram] = useState("");

  // Live chat links (two channels)
  const [livechat, setLivechat] = useState("");             // Telegram live chat
  const [livechatWhatsapp, setLivechatWhatsapp] = useState(""); // WhatsApp live chat
  const [agentName, setAgentName] = useState("");

  // Visibility toggles
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);
  const [telegramEnabled, setTelegramEnabled] = useState(true);
  const [livechatEnabled, setLivechatEnabled] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    if (!authed) return;
    fetch("/api/admin")
      .then((res) => res.json())
      .then((data) => {
        setWhatsapp(data.whatsapp || "");
        setTelegram(data.telegram || "");
        setLivechat(data.livechat || "");
        setLivechatWhatsapp(data.livechatWhatsapp || "");
        setAgentName(data.agentName || "");

        setWhatsappEnabled(data.whatsappEnabled !== false);
        setTelegramEnabled(data.telegramEnabled !== false);
        setLivechatEnabled(data.livechatEnabled !== false);

        setLoading(false);
      });
  }, [authed]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "login", password }),
    });
    const data = await res.json();
    if (data.success) {
      setAuthed(true);
    } else {
      setLoginError(data.error || "Login failed");
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveMessage("");
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "update",
        whatsapp,
        telegram,
        livechat,
        livechatWhatsapp,
        agentName,
        whatsappEnabled,
        telegramEnabled,
        livechatEnabled,
      }),
    });
    const data = await res.json();
    setSaving(false);
    setSaveMessage(data.success ? "Saved!" : data.error || "Failed to save");
  }

  const navy = "#111827";
  const navyLight = "#1a2234";
  const gold = "#34d399";
  const goldLight = "#6ee7b7";
  const text = "#e5e7eb";
  const textMuted = "#9ca3af";
  const line = "#374151";
  const error = "#EF4444";
  const success = "#25D366";
  const whatsappColor = "#25D366";
  const telegramColor = "#229ED9";
  const livechatColor = "#2dd4bf";

  const ToggleSwitch = ({
    checked,
    onChange,
    color,
  }: {
    checked: boolean;
    onChange: (val: boolean) => void;
    color: string;
  }) => (
    <div
      onClick={() => onChange(!checked)}
      style={{
        width: 36,
        height: 20,
        borderRadius: 10,
        background: checked ? color : line,
        position: "relative",
        cursor: "pointer",
        transition: "background 0.2s ease",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: 14,
          height: 14,
          borderRadius: "50%",
          background: "white",
          position: "absolute",
          top: 3,
          left: checked ? 19 : 3,
          transition: "left 0.2s ease",
          boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
        }}
      />
    </div>
  );

  // Shared input styling
  const inputStyle = (enabled: boolean): React.CSSProperties => ({
    width: "100%",
    padding: "10px 12px",
    borderRadius: 8,
    border: `1px solid ${line}`,
    background: navy,
    color: text,
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
    opacity: enabled ? 1 : 0.5,
    transition: "opacity 0.2s ease",
  });

  const labelStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    color: textMuted,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "1.5px",
    textTransform: "uppercase",
    marginBottom: 6,
  };

  // --- Login Screen ---
  if (!authed) {
    return (
      <div
        style={{
          minHeight: "100dvh",
          background: navy,
          padding: "32px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            maxWidth: 380,
            width: "100%",
            margin: "0 auto",
            background: navyLight,
            padding: "32px 24px",
            borderRadius: 12,
            border: `1px solid ${line}`,
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                border: `1px solid ${gold}`,
                color: goldLight,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
                fontFamily: "var(--font-display), serif",
                fontSize: 20,
                fontWeight: 700,
              }}
            >
              S
            </div>
            <h1
              style={{
                fontFamily: "var(--font-display), serif",
                color: text,
                fontSize: 24,
                margin: "0 0 6px",
                fontWeight: 600,
              }}
            >
              Admin Portal
            </h1>
            <p style={{ color: textMuted, fontSize: 13, margin: 0 }}>
              TheSmartMoneyBlueprint
            </p>
          </div>

          <form onSubmit={handleLogin}>
            <label
              style={{
                display: "block",
                color: textMuted,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 8,
                border: `1px solid ${line}`,
                background: navy,
                color: text,
                fontSize: 15,
                outline: "none",
                boxSizing: "border-box",
                marginBottom: 16,
              }}
            />

            {loginError && (
              <div
                style={{
                  padding: "10px 12px",
                  borderRadius: 8,
                  background: "rgba(239, 68, 68, 0.1)",
                  border: `1px solid rgba(239, 68, 68, 0.2)`,
                  color: error,
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 16,
                }}
              >
                {loginError}
              </div>
            )}

            <button
              type="submit"
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: 8,
                border: "none",
                background: gold,
                color: navy,
                fontWeight: 800,
                fontSize: 13,
                letterSpacing: "1px",
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              Authenticate
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- Dashboard ---
  return (
    <div
      style={{
        minHeight: "100dvh",
        background: navy,
        padding: "32px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          maxWidth: 480,
          width: "100%",
          margin: "0 auto",
          background: navyLight,
          padding: "28px 24px",
          borderRadius: 12,
          border: `1px solid ${line}`,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: `1px solid ${line}`,
            paddingBottom: 16,
            marginBottom: 20,
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                color: success,
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: success,
                }}
              />
              Authenticated
            </div>
            <h1
              style={{
                fontFamily: "var(--font-display), serif",
                color: text,
                fontSize: 22,
                margin: 0,
                fontWeight: 600,
              }}
            >
              Edit Community Links
            </h1>
          </div>

          <button
            onClick={() => setAuthed(false)}
            style={{
              background: "transparent",
              border: `1px solid ${line}`,
              color: textMuted,
              padding: "6px 12px",
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "1px",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            Lock
          </button>
        </div>

        {loading ? (
          <div
            style={{
              padding: "32px 0",
              textAlign: "center",
              color: textMuted,
              fontSize: 14,
            }}
          >
            <div
              style={{
                width: 20,
                height: 20,
                border: `2px solid ${line}`,
                borderTopColor: gold,
                borderRadius: "50%",
                margin: "0 auto 10px",
                animation: "spin 0.8s linear infinite",
              }}
            />
            <style
              dangerouslySetInnerHTML={{
                __html: `@keyframes spin { to { transform: rotate(360deg); } }`,
              }}
            />
            Retrieving database values...
          </div>
        ) : (
          <form onSubmit={handleSave}>
            {/* WhatsApp Group URL */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: whatsappColor,
                    }}
                  />
                  WhatsApp Group URL
                </div>
                <ToggleSwitch
                  checked={whatsappEnabled}
                  onChange={setWhatsappEnabled}
                  color={whatsappColor}
                />
              </label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="https://wa.link/..."
                style={inputStyle(whatsappEnabled)}
              />
            </div>

            {/* Telegram Channel URL */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: telegramColor,
                    }}
                  />
                  Telegram Channel URL
                </div>
                <ToggleSwitch
                  checked={telegramEnabled}
                  onChange={setTelegramEnabled}
                  color={telegramColor}
                />
              </label>
              <input
                type="text"
                value={telegram}
                onChange={(e) => setTelegram(e.target.value)}
                placeholder="https://t.me/..."
                style={inputStyle(telegramEnabled)}
              />
            </div>

            {/* ===== LIVE CHAT SECTION ===== */}
            <div
              style={{
                border: `1px solid ${line}`,
                borderRadius: 10,
                padding: 14,
                marginBottom: 16,
                background: "rgba(45, 212, 191, 0.03)",
              }}
            >
              {/* Section header with master toggle */}
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  color: livechatColor,
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  marginBottom: 12,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: livechatColor,
                    }}
                  />
                  Live Chat Widget
                </div>
                <ToggleSwitch
                  checked={livechatEnabled}
                  onChange={setLivechatEnabled}
                  color={livechatColor}
                />
              </label>

              {/* Live Chat Telegram URL */}
              <div style={{ marginBottom: 12 }}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    color: textMuted,
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "1.2px",
                    textTransform: "uppercase",
                    marginBottom: 5,
                  }}
                >
                  <span
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: telegramColor,
                    }}
                  />
                  Live Chat Telegram URL
                </label>
                <input
                  type="text"
                  value={livechat}
                  onChange={(e) => setLivechat(e.target.value)}
                  placeholder="https://t.me/..."
                  style={inputStyle(livechatEnabled)}
                />
              </div>

              {/* Live Chat WhatsApp URL */}
              <div style={{ marginBottom: 12 }}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    color: textMuted,
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "1.2px",
                    textTransform: "uppercase",
                    marginBottom: 5,
                  }}
                >
                  <span
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: whatsappColor,
                    }}
                  />
                  Live Chat WhatsApp URL
                </label>
                <input
                  type="text"
                  value={livechatWhatsapp}
                  onChange={(e) => setLivechatWhatsapp(e.target.value)}
                  placeholder="https://wa.me/..."
                  style={inputStyle(livechatEnabled)}
                />
              </div>

              {/* Agent Name */}
              <div>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    color: textMuted,
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "1.2px",
                    textTransform: "uppercase",
                    marginBottom: 5,
                  }}
                >
                  <span
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: livechatColor,
                    }}
                  />
                  Agent Name
                </label>
                <input
                  type="text"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  placeholder="Enter live chat agent name"
                  style={inputStyle(livechatEnabled)}
                />
              </div>
            </div>

            {/* Save Button */}
            <button
              type="submit"
              disabled={saving}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: 8,
                border: "none",
                background: gold,
                color: navy,
                fontWeight: 800,
                fontSize: 13,
                letterSpacing: "1px",
                textTransform: "uppercase",
                cursor: saving ? "default" : "pointer",
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving ? "Updating..." : "Save Changes"}
            </button>

            {saveMessage && (
              <div
                style={{
                  marginTop: 12,
                  padding: "12px",
                  borderRadius: 8,
                  background:
                    saveMessage === "Saved!"
                      ? "rgba(37, 211, 102, 0.1)"
                      : "rgba(239, 68, 68, 0.1)",
                  border: `1px solid ${
                    saveMessage === "Saved!"
                      ? "rgba(37, 211, 102, 0.2)"
                      : "rgba(239, 68, 68, 0.2)"
                  }`,
                  color: saveMessage === "Saved!" ? success : error,
                  fontSize: 13,
                  fontWeight: 700,
                  textAlign: "center",
                }}
              >
                {saveMessage === "Saved!"
                  ? "✓ Changes saved successfully"
                  : saveMessage}
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
