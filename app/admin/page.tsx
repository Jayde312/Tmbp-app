"use client";

import { useEffect, useState, useCallback } from "react";
import styles from "./styles.module.css"; // Ensure you have the CSS module defined below

interface SiteLinksData {
  whatsapp: string;
  telegram: string;
  livechat: string;
  agentName: string;
  whatsappLabel: string;
  telegramLabel: string;
  whatsappEnabled: boolean;
  telegramEnabled: boolean;
  livechatEnabled: boolean;
  
  whatsappSecondary: string;
  telegramSecondary: string;
  whatsappSecondaryLabel: string;
  telegramSecondaryLabel: string;
  whatsappSecondaryEnabled: boolean;
  telegramSecondaryEnabled: boolean;
}

const COLORS = {
  NAVY: "#111827",
  GOLD: "#34d399",
  WHATSAPP: "#25D366",
  TELEGRAM: "#229ED9",
  LIVECHAT: "#2dd4bf",
};

// --- Sub-Components ---

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
 * Enhanced Input Field that supports both Value and Label inputs
 */
function LabeledInputGroup({
  idPrefix,
  platformName,
  url,
  onUrlChange,
  label,
  onLabelChange,
  enabled,
  onToggleChange,
  toggleColor,
  subLabelHint,
  placeholderUrl,
  placeholderLabel
}: {
  idPrefix: string;
  platformName: string;
  url: string;
  onUrlChange: (v: string) => void;
  label: string;
  onLabelChange: (v: string) => void;
  enabled?: boolean;
  onToggleChange?: (v: boolean) => void;
  toggleColor?: string;
  subLabelHint?: string;
  placeholderUrl: string;
  placeholderLabel: string;
}) {
  const isDisabledVisual = enabled !== undefined && !enabled;

  return (
    <div className={styles.inputGroup}>
      {/* Header Row with Platform Name and Toggle */}
      <div className={styles.labelRow}>
        <label className={styles.labelText}>
          {toggleColor && <span className={styles.dot} style={{ backgroundColor: toggleColor }} />}
          <span>{platformName}</span>
          {subLabelHint && <span style={{ fontSize: 10, color: '#6b7280', marginLeft: 4 }}>{subLabelHint}</span>}
        </label>
        {onToggleChange && toggleColor && (
          <ToggleSwitch 
            checked={!!enabled} 
            onChange={onToggleChange} 
            color={toggleColor} 
          />
        )}
      </div>

      {/* Two Inputs Side-by-Side or Stacked depending on screen size */}
      <div className={styles.dualInputRow}>
        <div className={styles.subInputGroup}>
          <input
            id={`${idPrefix}-url`}
            type="text"
            value={url}
            onChange={(e) => onUrlChange(e.target.value)}
            placeholder={placeholderUrl}
            className={`${styles.textInput} ${isDisabledVisual ? styles.disabled : ""}`}
            disabled={isDisabledVisual}
          />
        </div>
        
        <div className={styles.subInputGroup}>
          <input
            id={`${idPrefix}-label`}
            type="text"
            value={label}
            onChange={(e) => onLabelChange(e.target.value)}
            placeholder={placeholderLabel}
            className={`${styles.textInput} ${isDisabledVisual ? styles.disabled : ""}`}
            disabled={isDisabledVisual}
            title="Button Text / Link Label"
          />
        </div>
      </div>
    </div>
  );
}

function SectionDivider({ title }: { title: string }) {
  return (
    <div className={styles.sectionHeader}>
      <span className={styles.sectionTitle}>{title}</span>
      <div className={styles.sectionLine} />
    </div>
  );
}

// --- Main Page Component ---

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{type: 'success'|'error', msg: string}|null>(null);

  const [formData, setFormData] = useState<SiteLinksData>({
    whatsapp: "",
    telegram: "",
    livechat: "",
    agentName: "",
    whatsappLabel: "Join Main Group",
    telegramLabel: "Public Channel",
    whatsappEnabled: true,
    telegramEnabled: true,
    livechatEnabled: true,
    
    whatsappSecondary: "",
    telegramSecondary: "",
    whatsappSecondaryLabel: "VIP / Backup",
    telegramSecondaryLabel: "Private Signals",
    whatsappSecondaryEnabled: false,
    telegramSecondaryEnabled: false,
  });

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
          whatsappLabel: data.whatsappLabel || "Join Main Group",
          telegramLabel: data.telegramLabel || "Public Channel",
          whatsappEnabled: data.whatsappEnabled ?? true,
          telegramEnabled: data.telegramEnabled ?? true,
          livechatEnabled: data.livechatEnabled ?? true,
          
          whatsappSecondary: data.whatsappSecondary || "",
          telegramSecondary: data.telegramSecondary || "",
          whatsappSecondaryLabel: data.whatsappSecondaryLabel || "VIP / Backup",
          telegramSecondaryLabel: data.telegramSecondaryLabel || "Private Signals",
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setSaving(true); 
    
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
          ...formData,
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
              
              {/* ================= GROUP 1: WHATSAPP ================= */}
              <SectionDivider title="WhatsApp Channels" />
              <div className={styles.groupContainer}>
                
                {/* Primary WhatsApp */}
                <LabeledInputGroup
                  idPrefix="wa-primary"
                  platformName="Primary Group"
                  url={formData.whatsapp}
                  onUrlChange={(v) => updateField('whatsapp', v)}
                  label={formData.whatsappLabel}
                  onLabelChange={(v) => updateField('whatsappLabel', v)}
                  enabled={formData.whatsappEnabled}
                  onToggleChange={(v) => updateField('whatsappEnabled', v)}
                  toggleColor={COLORS.WHATSAPP}
                  placeholderUrl="https://wa.link/..."
                  placeholderLabel="Button Text (e.g. Join Now)"
                />

                {/* Secondary WhatsApp */}
                <LabeledInputGroup
                  idPrefix="wa-secondary"
                  platformName="Secondary Group"
                  subLabelHint="(Optional)"
                  url={formData.whatsappSecondary}
                  onUrlChange={(v) => updateField('whatsappSecondary', v)}
                  label={formData.whatsappSecondaryLabel}
                  onLabelChange={(v) => updateField('whatsappSecondaryLabel', v)}
                  enabled={formData.whatsappSecondaryEnabled}
                  onToggleChange={(v) => updateField('whatsappSecondaryEnabled', v)}
                  toggleColor={COLORS.WHATSAPP}
                  placeholderUrl="https://wa.link/... (Backup/VIP)"
                  placeholderLabel="Alt Text (e.g. VIP Access)"
                />
              </div>

              {/* ================= GROUP 2: TELEGRAM ================= */}
              <SectionDivider title="Telegram Channels" />
              <div className={styles.groupContainer}>
                 
                {/* Primary Telegram */}
                <LabeledInputGroup
                  idPrefix="tg-primary"
                  platformName="Primary Channel"
                  url={formData.telegram}
                  onUrlChange={(v) => updateField('telegram', v)}
                  label={formData.telegramLabel}
                  onLabelChange={(v) => updateField('telegramLabel', v)}
                  enabled={formData.telegramEnabled}
                  onToggleChange={(v) => updateField('telegramEnabled', v)}
                  toggleColor={COLORS.TELEGRAM}
                  placeholderUrl="https://t.me/..."
                  placeholderLabel="Button Text (e.g. Public Feed)"
                />

                {/* Secondary Telegram */}
                <LabeledInputGroup
                  idPrefix="tg-secondary"
                  platformName="Secondary Channel"
                  subLabelHint="(Optional)"
                  url={formData.telegramSecondary}
                  onUrlChange={(v) => updateField('telegramSecondary', v)}
                  label={formData.telegramSecondaryLabel}
                  onLabelChange={(v) => updateField('telegramSecondaryLabel', v)}
                  enabled={formData.telegramSecondaryEnabled}
                  onToggleChange={(v) => updateField('telegramSecondaryEnabled', v)}
                  toggleColor={COLORS.TELEGRAM}
                  placeholderUrl="https://t.me/... (Private/Beta)"
                  placeholderLabel="Alt Text (e.g. Pro Signals)"
                />
              </div>

              {/* ================= GROUP 3: SUPPORT / LIVE CHAT ================= */}
              <SectionDivider title="Direct Support" />
              <div className={styles.groupContainer}>
                <div className={styles.inputGroup}>
                   <div className={styles.labelRow}>
                    <label className={styles.labelText}>
                      <span className={styles.dot} style={{ backgroundColor: COLORS.LIVECHAT }} />
                      Live Chat Link
                    </label>
                    <ToggleSwitch 
                        checked={formData.livechatEnabled} 
                        onChange={(v) => updateField('livechatEnabled', v)} 
                        color={COLORS.LIVECHAT} 
                    />
                  </div>
                  <input
                    type="text"
                    value={formData.livechat}
                    onChange={(e) => updateField('livechat', e.target.value)}
                    placeholder="https://t.me/... or external link"
                    className={`${styles.textInput} ${!formData.livechatEnabled ? styles.disabled : ""}`}
                    disabled={!formData.livechatEnabled}
                  />
                </div>

                <div className={styles.inputGroup}>
                   <label className={styles.labelText}>Agent Display Name</label>
                  <input
                    type="text"
                    value={formData.agentName}
                    onChange={(e) => updateField('agentName', e.target.value)}
                    placeholder="e.g., Sarah from Support"
                    className={`${styles.textInput} ${!formData.livechatEnabled ? styles.disabled : ""}`}
                    disabled={!formData.livechatEnabled}
                  />
                </div>
              </div>

              {/* Submit Area */}
              <div style={{ marginTop: 24 }}>
                <button
                  type="submit"
                  disabled={saving}
                  className={styles.submitBtn}
                >
                  {saving ? "Updating..." : "Save All Changes"}
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
