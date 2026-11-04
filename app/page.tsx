"use client";

import { useEffect, useState, useCallback } from "react";
import styles from "./styles.module.css"; // Import the CSS module created above

// --- Types & Interfaces ---
interface LinkConfig {
  url: string;
  enabled: boolean;
  label: string;
  placeholder: string;
  color: string;
}

interface SiteLinksData {
  whatsapp: string;
  telegram: string;
  livechat: string;
  agentName: string;
  whatsappEnabled: boolean;
  telegramEnabled: boolean;
  livechatEnabled: boolean;
  // Secondary fields added based on previous request
  whatsappSecondary: string;
  telegramSecondary: string;
  whatsappSecondaryEnabled: boolean;
  telegramSecondaryEnabled: boolean;
}

// --- Color Palette Constants ---
const COLORS = {
  NAVY: "#111827",
  GOLD: "#34d399",
  WHATSAPP: "#25D366",
  TELEGRAM: "#229ED9",
  LIVECHAT: "#2dd4bf",
};

// --- Sub-Components ---

/**
 * Reusable Toggle Switch
 */
function ToggleSwitch({ 
  checked, 
  onChange, 
  color 
}: { 
  checked: boolean; 
  onChange: (val: boolean) => void; 
  color: string;
}) {
  return (
    <div
      onClick={() => onChange(!checked)}
      style={{
        width: 36,
        height: 20,
        borderRadius: 10,
        background: checked ? color : "#374151",
        position: "relative",
        cursor: "pointer",
        transition: "background 0.2s ease",
        flexShrink: 0,
      }}
      role="switch"
      aria-checked={checked}
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onChange(!checked)}
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
}

/**
 * Reusable Input Field with Label and Toggle
 */
function LabeledInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  enabled,
  onToggleChange,
  toggleColor,
  disabledStyle = false
}: {
  id: string;
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  enabled?: boolean;
  onToggleChange?: (val: boolean) => void;
  toggleColor?: string;
  disabledStyle?: boolean;
}) {
  const isDisabledVisual = disabledStyle || (enabled !== undefined && !enabled);

  return (
    <div className={styles.inputGroup}>
      <div className={styles.labelRow}>
        <label htmlFor={id} className={styles.labelText}>
          {toggleColor && <span className={styles.dot} style={{ backgroundColor: toggleColor }} />}
          {label}
        </label>
        {onToggleChange && toggleColor && (
          <ToggleSwitch 
            checked={!!enabled} 
            onChange={onToggleChange} 
            color={toggleColor} 
          />
        )}
      </div>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${styles.textInput} ${isDisabledVisual ? styles.disabled : ""}`}
        disabled={isDisabledVisual}
      />
    </div>
  );
}

// --- Main Page Component ---

export default function AdminPage() {
  // State
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{type: 'success'|'error', msg: string}|null>(null);

  // Form Data State
  const [formData, setFormData] = useState<SiteLinksData>({
    whatsapp: "",
    telegram: "",
    livechat: "",
    agentName: "",
    whatsappEnabled: true,
    telegramEnabled: true,
    livechatEnabled: true,
    whatsappSecondary: "",
    telegramSecondary: "",
    whatsappSecondaryEnabled: false,
    telegramSecondaryEnabled: false,
  });

  // Effects
  useEffect(() => {
    if (!authed) return;
    
    const fetchData = async () => {
      try {
        const res = await fetch("/api/admin");
        const data = await res.json();
        
        setFormData({
          whatsapp: data.whatsapp || "",
          telegram: data.telegram || "",
          livechat: data.livechat || "",
          agentName: data.agentName || "",
          whatsappEnabled: data.whatsappEnabled ?? true,
          telegramEnabled: data.telegramEnabled ?? true,
          livechatEnabled: data.livechatEnabled ?? true,
          whatsappSecondary: data.whatsappSecondary || "",
          telegramSecondary: data.telegramSecondary || "",
          whatsappSecondaryEnabled: data.whatsappSecondaryEnabled ?? false,
          telegramSecondaryEnabled: data.telegramSecondaryEnabled ?? false,
        });
      } catch (err) {
        console.error("Failed to load config", err);
        setSaveMessage({ type: 'error', msg: "Failed to load configuration" });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authed]);

  // Handlers
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setSaving(true); // Reuse saving state for button feedback
    
    try {
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
    } catch {
      setLoginError("Network error");
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveMessage(null);

    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          ...formData, // Send all fields
        }),
      });
      const data = await res.json();
      
      if (data.success) {
        setSaveMessage({ type: 'success', msg: "Changes saved successfully" });
      } else {
        setSaveMessage({ type: 'error', msg: data.error || "Failed to save" });
      }
    } catch {
      setSaveMessage({ type: 'error', msg: "Network error" });
    } finally {
      setSaving(false);
    }
  };

  const updateField = useCallback((field: keyof SiteLinksData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Render Helpers
  if (!authed) {
    return (
      <div className={styles.container}>
        <div className={`${styles.card} ${styles.loginCard}`}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div className={styles.logoCircle}>S</div>
            <h1 className={styles.mainTitle} style={{ fontSize: 24, marginBottom: 6 }}>Admin Portal</h1>
            <p className={styles.subtitle}>TheSmartMoneyBlueprint</p>
          </div>

          <form onSubmit={handleLogin}>
             <div className={styles.inputGroup}>
                <label className={styles.labelText} style={{ justifyContent: 'flex-start' }}>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className={styles.textInput}
                />
             </div>

            {loginError && (
              <div className={`${styles.messageBox} ${styles.errorMsg}`} style={{ marginTop: 16 }}>
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className={styles.submitBtn}
              style={{ marginTop: 16 }}
            >
              {saving ? "Authenticating..." : "Authenticate"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* Header Section */}
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <div className={styles.statusBadge}>
              <span className={styles.dot} />
              Authenticated
            </div>
            <h1 className={styles.mainTitle}>Edit Community Links</h1>
          </div>
          <button onClick={() => setAuthed(false)} className={styles.lockBtn}>
            Lock
          </button>
        </div>

        {/* Body Section */}
        <div className={styles.formBody}>
          {loading ? (
            <div style={{ padding: "32px 0", textAlign: "center", color: "#9ca3af" }}>
              <div className={styles.loadingSpinner} />
              Retrieving database values...
            </div>
          ) : (
            <form onSubmit={handleSave}>
              
              {/* Primary WhatsApp */}
              <LabeledInput
                id="primary-whatsapp"
                label="Primary WhatsApp Group URL"
                value={formData.whatsapp}
                onChange={(v) => updateField('whatsapp', v)}
                placeholder="https://wa.link/..."
                enabled={formData.whatsappEnabled}
                onToggleChange={(v) => updateField('whatsappEnabled', v)}
                toggleColor={COLORS.WHATSAPP}
              />

              {/* Secondary WhatsApp */}
              <LabeledInput
                id="secondary-whatsapp"
                label="Secondary WhatsApp Group URL"
                value={formData.whatsappSecondary}
                onChange={(v) => updateField('whatsappSecondary', v)}
                placeholder="https://wa.link/... (Optional)"
                enabled={formData.whatsappSecondaryEnabled}
                onToggleChange={(v) => updateField('whatsappSecondaryEnabled', v)}
                toggleColor={COLORS.WHATSAPP}
              />

               {/* Primary Telegram */}
               <LabeledInput
                id="primary-telegram"
                label="Primary Telegram Channel URL"
                value={formData.telegram}
                onChange={(v) => updateField('telegram', v)}
                placeholder="https://t.me/..."
                enabled={formData.telegramEnabled}
                onToggleChange={(v) => updateField('telegramEnabled', v)}
                toggleColor={COLORS.TELEGRAM}
              />

              {/* Secondary Telegram */}
              <LabeledInput
                id="secondary-telegram"
                label="Secondary Telegram Channel URL"
                value={formData.telegramSecondary}
                onChange={(v) => updateField('telegramSecondary', v)}
                placeholder="https://t.me/... (Optional)"
                enabled={formData.telegramSecondaryEnabled}
                onToggleChange={(v) => updateField('telegramSecondaryEnabled', v)}
                toggleColor={COLORS.TELEGRAM}
              />

              {/* Live Chat */}
              <LabeledInput
                id="livechat-url"
                label="Live Chat URL"
                value={formData.livechat}
                onChange={(v) => updateField('livechat', v)}
                placeholder="https://t.me/... (bot/group)"
                enabled={formData.livechatEnabled}
                onToggleChange={(v) => updateField('livechatEnabled', v)}
                toggleColor={COLORS.LIVECHAT}
              />

              {/* Agent Name */}
              <LabeledInput
                id="agent-name"
                label="Agent Display Name"
                value={formData.agentName}
                onChange={(v) => updateField('agentName', v)}
                placeholder="e.g., Support Bot Alpha"
                enabled={formData.livechatEnabled} // Tied to livechat visibility usually
                // No toggle here, just input
              />

              {/* Submit Area */}
              <div style={{ marginTop: 8 }}>
                <button
                  type="submit"
                  disabled={saving}
                  className={styles.submitBtn}
                >
                  {saving ? "Updating..." : "Save Changes"}
                </button>

                {saveMessage && (
                  <div className={`${styles.messageBox} ${saveMessage.type === 'success' ? styles.successMsg : styles.errorMsg}`}>
                    {saveMessage.msg}
                  </div>
                )}
              </div>

            </form>
          )}
        </div>
      </div>
    </div>
  );
}
