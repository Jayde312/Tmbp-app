"use client";

import { useEffect, useState, useCallback } from "react";
import styles from "./styles.module.css";

// --- Types & Interfaces ---
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

// Icons
function ChevronDown({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
    </svg>
  );
}

function WhatsAppIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.5 3.5A11.9 11.9 0 0 0 12.04 0C5.47 0 .13 5.34.13 11.91c0 2.1.55 4.15 1.6 5.96L.04 24l6.28-1.65a11.88 11.88 0 0 0 5.71 1.46h.01c6.56 0 11.9-5.34 11.9-11.9 0-3.18-1.24-6.18-3.44-8.41ZM12.04 21.8h-.01a9.88 9.88 0 0 1-5.04-1.38l-.36-.21-3.73.98 1-3.64-.24-.37a9.88 9.88 0 0 1-1.52-5.28C2.14 6.43 6.57 2 12.04 2c2.65 0 5.14 1.03 7.01 2.9a9.86 9.86 0 0 1 2.9 7c0 5.47-4.44 9.9-9.91 9.9Z" />
      <path d="M17.55 14.52c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.74-1.64-2.04-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.21 5.09 4.5.71.31 1.27.49 1.7.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z" />
    </svg>
  );
}

function TelegramIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M21.9 3.2 18.5 20c-.26 1.19-.97 1.48-1.97.92l-5.43-4-2.62 2.52c-.29.29-.53.53-1.09.53l.39-5.52 10.05-9.08c.44-.39-.1-.61-.68-.22L4.73 12.2l-5.38-1.68c-1.17-.37-1.19-1.17.24-1.73L20.62.81c.98-.36 1.84.24 1.28 2.39Z" />
    </svg>
  );
}

function LiveChatIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  );
}

// Sub-component: Toggle Switch
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
      onClick={(e) => { e.stopPropagation(); onChange(!checked); }} // Prevent accordion toggle on click
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

// Main Page Component
export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{type: 'success'|'error', msg: string}|null>(null);

  // Accordion State: Track which platforms are expanded
  const [expandedPlatforms, setExpandedPlatforms] = useState<Record<string, boolean>>({
    whatsapp: false,
    telegram: false,
    livechat: true, // Default open support section as it's smaller/simpler
  });

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

  const togglePlatform = (platform: string) => {
    setExpandedPlatforms(prev => ({
      ...prev,
      [platform]: !prev[platform]
    }));
  };

  // Helper to determine status text/color for the collapsed view
  const getStatusInfo = (primaryEnabled: boolean, secondaryEnabled: boolean) => {
    if (primaryEnabled && secondaryEnabled) return { text: "Both Active", color: COLORS.GOLD };
    if (primaryEnabled) return { text: "Primary Only", color: COLORS.GOLD };
    if (secondaryEnabled) return { text: "Secondary Only", color: "#fbbf24" }; // Amber
    return { text: "Disabled", color: "#6b7280" }; // Gray
  };

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
              
              {/* ================= WHATSAPP CARD ================= */}
              <div className={`${styles.platformCard} ${expandedPlatforms.whatsapp ? styles.active : ""}`}>
                <div className={styles.platformHeader} onClick={() => togglePlatform('whatsapp')}>
                  <div className={styles.platformInfo}>
                    <div className={styles.platformIconWrapper} style={{ color: COLORS.WHATSAPP }}>
                      <WhatsAppIcon size={18} />
                    </div>
                    <div className={styles.platformDetails}>
                      <span className={styles.platformName}>WhatsApp Groups</span>
                      <span className={styles.platformStatus}>
                        <span className={styles.statusDotSmall} style={{ backgroundColor: getStatusInfo(formData.whatsappEnabled, formData.whatsappSecondaryEnabled).color }} />
                        {getStatusInfo(formData.whatsappEnabled, formData.whatsappSecondaryEnabled).text}
                      </span>
                    </div>
                  </div>
                  <ChevronDown className={styles.chevron} />
                </div>

                <div className={styles.platformContent}>
                  {/* Primary Input */}
                  <div className={styles.inputGroup}>
                    <div className={styles.labelText}>
                      <span>Primary Group</span>
                      <ToggleSwitch 
                        checked={formData.whatsappEnabled} 
                        onChange={(v) => updateField('whatsappEnabled', v)} 
                        color={COLORS.WHATSAPP} 
                      />
                    </div>
                    <input
                      type="text"
                      value={formData.whatsapp}
                      onChange={(e) => updateField('whatsapp', e.target.value)}
                      placeholder="https://wa.link/..."
                      className={`${styles.textInput} ${!formData.whatsappEnabled ? styles.disabled : ""}`}
                      disabled={!formData.whatsappEnabled}
                    />
                     <input
                      type="text"
                      value={formData.whatsappLabel}
                      onChange={(e) => updateField('whatsappLabel', e.target.value)}
                      placeholder="Button Text (e.g. Join Now)"
                      className={`${styles.textInput} ${!formData.whatsappEnabled ? styles.disabled : ""}`}
                      disabled={!formData.whatsappEnabled}
                      style={{ marginTop: 4 }}
                    />
                  </div>

                  {/* Secondary Input */}
                  <div className={styles.inputGroup}>
                    <div className={styles.labelText}>
                      <span>Secondary / VIP Group</span>
                      <ToggleSwitch 
                        checked={formData.whatsappSecondaryEnabled} 
                        onChange={(v) => updateField('whatsappSecondaryEnabled', v)} 
                        color={COLORS.WHATSAPP} 
                      />
                    </div>
                    <input
                      type="text"
                      value={formData.whatsappSecondary}
                      onChange={(e) => updateField('whatsappSecondary', e.target.value)}
                      placeholder="https://wa.link/... (Optional)"
                      className={`${styles.textInput} ${!formData.whatsappSecondaryEnabled ? styles.disabled : ""}`}
                      disabled={!formData.whatsappSecondaryEnabled}
                    />
                     <input
                      type="text"
                      value={formData.whatsappSecondaryLabel}
                      onChange={(e) => updateField('whatsappSecondaryLabel', e.target.value)}
                      placeholder="Alt Text (e.g. VIP Access)"
                      className={`${styles.textInput} ${!formData.whatsappSecondaryEnabled ? styles.disabled : ""}`}
                      disabled={!formData.whatsappSecondaryEnabled}
                      style={{ marginTop: 4 }}
                    />
                  </div>
                </div>
              </div>

              {/* ================= TELEGRAM CARD ================= */}
              <div className={`${styles.platformCard} ${expandedPlatforms.telegram ? styles.active : ""}`}>
                <div className={styles.platformHeader} onClick={() => togglePlatform('telegram')}>
                  <div className={styles.platformInfo}>
                    <div className={styles.platformIconWrapper} style={{ color: COLORS.TELEGRAM }}>
                      <TelegramIcon size={18} />
                    </div>
                    <div className={styles.platformDetails}>
                      <span className={styles.platformName}>Telegram Channels</span>
                      <span className={styles.platformStatus}>
                         <span className={styles.statusDotSmall} style={{ backgroundColor: getStatusInfo(formData.telegramEnabled, formData.telegramSecondaryEnabled).color }} />
                        {getStatusInfo(formData.telegramEnabled, formData.telegramSecondaryEnabled).text}
                      </span>
                    </div>
                  </div>
                  <ChevronDown className={styles.chevron} />
                </div>

                <div className={styles.platformContent}>
                   {/* Primary Input */}
                   <div className={styles.inputGroup}>
                    <div className={styles.labelText}>
                      <span>Primary Channel</span>
                      <ToggleSwitch 
                        checked={formData.telegramEnabled} 
                        onChange={(v) => updateField('telegramEnabled', v)} 
                        color={COLORS.TELEGRAM} 
                      />
                    </div>
                    <input
                      type="text"
                      value={formData.telegram}
                      onChange={(e) => updateField('telegram', e.target.value)}
                      placeholder="https://t.me/..."
                      className={`${styles.textInput} ${!formData.telegramEnabled ? styles.disabled : ""}`}
                      disabled={!formData.telegramEnabled}
                    />
                     <input
                      type="text"
                      value={formData.telegramLabel}
                      onChange={(e) => updateField('telegramLabel', e.target.value)}
                      placeholder="Button Text (e.g. Public Feed)"
                      className={`${styles.textInput} ${!formData.telegramEnabled ? styles.disabled : ""}`}
                      disabled={!formData.telegramEnabled}
                      style={{ marginTop: 4 }}
                    />
                  </div>

                  {/* Secondary Input */}
                  <div className={styles.inputGroup}>
                    <div className={styles.labelText}>
                      <span>Secondary / Private Channel</span>
                      <ToggleSwitch 
                        checked={formData.telegramSecondaryEnabled} 
                        onChange={(v) => updateField('telegramSecondaryEnabled', v)} 
                        color={COLORS.TELEGRAM} 
                      />
                    </div>
                    <input
                      type="text"
                      value={formData.telegramSecondary}
                      onChange={(e) => updateField('telegramSecondary', e.target.value)}
                      placeholder="https://t.me/... (Optional)"
                      className={`${styles.textInput} ${!formData.telegramSecondaryEnabled ? styles.disabled : ""}`}
                      disabled={!formData.telegramSecondaryEnabled}
                    />
                     <input
                      type="text"
                      value={formData.telegramSecondaryLabel}
                      onChange={(e) => updateField('telegramSecondaryLabel', e.target.value)}
                      placeholder="Alt Text (e.g. Pro Signals)"
                      className={`${styles.textInput} ${!formData.telegramSecondaryEnabled ? styles.disabled : ""}`}
                      disabled={!formData.telegramSecondaryEnabled}
                      style={{ marginTop: 4 }}
                    />
                  </div>
                </div>
              </div>

              {/* ================= LIVE CHAT CARD ================= */}
              <div className={`${styles.platformCard} ${expandedPlatforms.livechat ? styles.active : ""}`}>
                <div className={styles.platformHeader} onClick={() => togglePlatform('livechat')}>
                  <div className={styles.platformInfo}>
                    <div className={styles.platformIconWrapper} style={{ color: COLORS.LIVECHAT }}>
                      <LiveChatIcon size={18} />
                    </div>
                    <div className={styles.platformDetails}>
                      <span className={styles.platformName}>Direct Support</span>
                      <span className={styles.platformStatus}>
                        <span className={styles.statusDotSmall} style={{ backgroundColor: formData.livechatEnabled ? COLORS.LIVECHAT : "#6b7280" }} />
                        {formData.livechatEnabled ? "Active" : "Disabled"}
                      </span>
                    </div>
                  </div>
                  <ChevronDown className={styles.chevron} />
                </div>

                <div className={styles.platformContent}>
                  <div className={styles.inputGroup}>
                    <div className={styles.labelText}>
                      <span>Live Chat Link</span>
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
                    <label className={styles.labelText}><span>Agent Display Name</span></label>
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
              </div>

              {/* Submit Area */}
              <div style={{ marginTop: 16 }}>
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
