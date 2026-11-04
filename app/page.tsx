import Image from "next/image";
import Link from "next/link";
import { neon } from "@neondatabase/serverless";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import Logo from "../components/Logo";
import LiveChatWidget from "../components/LiveChatWidget";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-display",
});

const body = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-body",
});

const sql = neon(process.env.DATABASE_URL!);

async function getLinks() {
  try {
    // Ensure table exists with new columns
    await sql`ALTER TABLE site_links ADD COLUMN IF NOT EXISTS whatsapp_label TEXT NOT NULL DEFAULT 'Join Main Group'`;
    await sql`ALTER TABLE site_links ADD COLUMN IF NOT EXISTS telegram_label TEXT NOT NULL DEFAULT 'Public Channel'`;
    await sql`ALTER TABLE site_links ADD COLUMN IF NOT EXISTS whatsapp_url_2 TEXT NOT NULL DEFAULT ''`;
    await sql`ALTER TABLE site_links ADD COLUMN IF NOT EXISTS telegram_url_2 TEXT NOT NULL DEFAULT ''`;
    await sql`ALTER TABLE site_links ADD COLUMN IF NOT EXISTS whatsapp_label_2 TEXT NOT NULL DEFAULT 'VIP / Backup'`;
    await sql`ALTER TABLE site_links ADD COLUMN IF NOT EXISTS telegram_label_2 TEXT NOT NULL DEFAULT 'Private Signals'`;
    await sql`ALTER TABLE site_links ADD COLUMN IF NOT EXISTS whatsapp_enabled_2 BOOLEAN NOT NULL DEFAULT FALSE`;
    await sql`ALTER TABLE site_links ADD COLUMN IF NOT EXISTS telegram_enabled_2 BOOLEAN NOT NULL DEFAULT FALSE`;

    const rows = await sql`
      SELECT 
        whatsapp_url, telegram_url, livechat_url, agent_name,
        whatsapp_label, telegram_label,
        whatsapp_enabled, telegram_enabled, livechat_enabled,
        whatsapp_url_2, telegram_url_2,
        whatsapp_label_2, telegram_label_2,
        whatsapp_enabled_2, telegram_enabled_2
      FROM site_links WHERE id = 1
    `;

    const row = rows[0];

    return {
      whatsapp: row?.whatsapp_url || "",
      telegram: row?.telegram_url || "",
      livechat: row?.livechat_url || "",
      agentName: row?.agent_name || "",
      whatsappLabel: row?.whatsapp_label || "Join Main Group",
      telegramLabel: row?.telegram_label || "Public Channel",
      whatsappEnabled: row?.whatsapp_enabled ?? true,
      telegramEnabled: row?.telegram_enabled ?? true,
      livechatEnabled: row?.livechat_enabled ?? true,
      
      whatsappSecondary: row?.whatsapp_url_2 || "",
      telegramSecondary: row?.telegram_url_2 || "",
      whatsappSecondaryLabel: row?.whatsapp_label_2 || "VIP / Backup",
      telegramSecondaryLabel: row?.telegram_label_2 || "Private Signals",
      whatsappSecondaryEnabled: row?.whatsapp_enabled_2 ?? false,
      telegramSecondaryEnabled: row?.telegram_enabled_2 ?? false,
    };
  } catch (err) {
    console.error("getLinks failed:", err);
    return {
      whatsapp: "", telegram: "", livechat: "", agentName: "",
      whatsappLabel: "Join Main Group", telegramLabel: "Public Channel",
      whatsappEnabled: true, telegramEnabled: true, livechatEnabled: true,
      whatsappSecondary: "", telegramSecondary: "",
      whatsappSecondaryLabel: "VIP / Backup", telegramSecondaryLabel: "Private Signals",
      whatsappSecondaryEnabled: false, telegramSecondaryEnabled: false,
    };
  }
}

export const dynamic = "force-dynamic";

const theme = {
  bg: "#0A152E",
  gold: "#2dd4bf",
  text: "#e0f2f1",
  textMuted: "#A2C2BF",
  white: "#FFFFFF",
  whatsapp: "#25D366",
  telegram: "#229ED9",
};

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

export default async function Home() {
  const {
    whatsapp: WHATSAPP_URL,
    telegram: TELEGRAM_URL,
    livechat: LIVECHAT_URL,
    agentName: AGENT_NAME,
    whatsappLabel,
    telegramLabel,
    whatsappEnabled,
    telegramEnabled,
    livechatEnabled,
    whatsappSecondary,
    telegramSecondary,
    whatsappSecondaryLabel,
    telegramSecondaryLabel,
    whatsappSecondaryEnabled,
    telegramSecondaryEnabled,
  } = await getLinks();

  return (
    <main className={`${display.variable} ${body.variable}`}>
      <style dangerouslySetInnerHTML={{ __html: `
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        html, body { margin: 0; padding: 0; background: ${theme.bg}; }
        body { font-family: var(--font-body), sans-serif; color: ${theme.text}; }
        a { color: inherit; text-decoration: none; }
        
        .page { width: 100%; min-height: 100vh; overflow-x: hidden; background: ${theme.bg}; }
        
        /* ... Brand Bar, Hero, Intro Styles Same as Before ... */
        .brand-bar { background: ${theme.bg}; color: white; padding: 17px 20px; }
        .brand-bar-inner { width: min(100%, 760px); margin: 0 auto; display: flex; align-items: center; justify-content: space-between; gap: 20px; }
        .brand { display: flex; align-items: center; gap: 10px; }
        .hero { position: relative; width: 100%; background: ${theme.bg}; line-height: 0; }
        .hero-image { display: block; width: 100%; height: auto; object-fit: contain; }
        .intro { padding: 56px 22px 64px; background: ${theme.bg}; text-align: center; }
        .content-width { width: min(760px, 100%); margin: 0 auto; }
        .eyebrow { margin-bottom: 16px; color: ${theme.gold}; font-size: 10px; font-weight: 800; letter-spacing: 3px; text-transform: uppercase; }
        .intro h1 { margin: 0 auto; max-width: 680px; color: white; font-family: var(--font-display), serif; font-size: clamp(42px, 8vw, 65px); line-height: .98; font-weight: 600; }
        .intro h1 em { color: ${theme.gold}; font-style: italic; }
        .intro p { max-width: 625px; margin: 25px auto 0; color: ${theme.textMuted}; font-size: 14px; line-height: 1.9; }

        /* UPDATED CONTACT PILLS STYLES */
        .contact-pills-container {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 24px; /* Increased gap between groups */
          margin-top: 32px;
        }

        .contact-group {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .contact-pill {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 16px 32px;
          border-radius: 100px;
          font-size: 15px;
          font-weight: 700;
          letter-spacing: 0.2px;
          transition: transform .2s ease, box-shadow .2s ease;
          cursor: pointer;
        }

        .contact-pill:hover { transform: translateY(-2px); }
        .contact-pill.whatsapp { background: ${theme.whatsapp}; color: white; box-shadow: 0 6px 20px rgba(37,211,102,.25); }
        .contact-pill.telegram { background: ${theme.telegram}; color: white; box-shadow: 0 6px 20px rgba(34,158,217,.25); }
        
        .pill-icon { flex-shrink: 0; display: flex; align-items: center; }
        .pill-label { white-space: nowrap; }

        /* ALT LINK STYLE */
        .alt-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 600;
          color: ${theme.textMuted};
          opacity: 0.7;
          transition: opacity 0.2s ease, color 0.2s ease;
        }
        .alt-link:hover { opacity: 1; color: ${theme.white}; }
        .alt-link svg { width: 12px; height: 12px; fill: currentColor; }

        /* ... Pillars, Philosophy, Footer Styles Same as Before ... */
        .pillars { background: ${theme.bg}; color: white; padding: 75px 22px; }
        .section-width { width: min(900px, 100%); margin: 0 auto; }
        .dark-eyebrow { color: ${theme.gold}; font-size: 10px; font-weight: 800; letter-spacing: 3px; text-transform: uppercase; }
        .pillars-title { margin: 15px 0 42px; max-width: 620px; font-family: var(--font-display), serif; font-size: clamp(40px, 7vw, 58px); line-height: .98; font-weight: 600; }
        .pillar-grid { display: grid; grid-template-columns: repeat(3, 1fr); }
        .pillar { min-height: 285px; padding: 30px 25px; }
        .pillar-heading { display: flex; align-items: center; gap: 10px; margin: 0 0 12px; }
        .pillar-dot { width: 8px; height: 8px; flex-shrink: 0; border-radius: 50%; background: ${theme.gold}; }
        .pillar h2 { margin: 0; color: white; font-family: var(--font-display), serif; font-size: 31px; line-height: 1; font-weight: 600; }
        .pillar p { margin: 0; color: rgba(255,255,255,.55); font-size: 12.5px; line-height: 1.8; }
        .philosophy { background: ${theme.bg}; padding: 76px 22px; }
        .philosophy-grid { width: min(900px, 100%); margin: 0 auto; display: grid; grid-template-columns: .8fr 1.2fr; gap: 70px; align-items: start; }
        .philosophy h2 { margin: 14px 0 0; color: white; font-family: var(--font-display), serif; font-size: clamp(43px, 7vw, 63px); line-height: .92; font-weight: 600; }
        .philosophy h2 em { color: ${theme.gold}; font-style: italic; }
        .philosophy-copy { margin: 0 0 27px; color: ${theme.textMuted}; font-size: 14px; line-height: 1.9; }
        .principle { display: flex; gap: 14px; align-items: flex-start; padding: 16px 0; }
        .check { width: 19px; height: 19px; flex: 0 0 19px; border: 1px solid ${theme.gold}; border-radius: 50%; display: grid; place-items: center; color: ${theme.gold}; font-size: 10px; margin-top: 1px; }
        .principle span { color: ${theme.text}; font-size: 12px; line-height: 1.55; font-weight: 700; }
        footer { padding: 30px 22px; background: ${theme.bg}; text-align: center; }
        .footer-name { margin-bottom: 8px; color: ${theme.gold}; font-family: var(--font-display), serif; font-size: 21px; font-weight: 600; }
        .footer-copy { max-width: 600px; margin: 0 auto; color: rgba(255,255,255,.35); font-size: 9.5px; line-height: 1.7; }

        @media (max-width: 650px) {
          .brand-bar { padding: 14px 15px; }
          .brand-link { display: none; }
          .hero-fade-top, .hero-fade-bottom { height: 50px; }
          .intro { padding: 44px 20px 52px; }
          .contact-pills-container { flex-direction: column; align-items: stretch; gap: 16px; }
          .contact-group { width: 100%; }
          .contact-pill { width: 100%; justify-content: center; }
          .alt-link { justify-content: center; }
          .pillars { padding: 64px 20px; }
          .pillar-grid { display: block; }
          .pillar { min-height: auto; padding: 28px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
          .pillar:last-child { border-bottom: 0; }
          .philosophy { padding: 64px 20px; }
          .philosophy-grid { display: block; }
          .philosophy-copy-wrap { margin-top: 42px; }
        }
      `}} />

      <div className="page">
        <header className="brand-bar">
          <div className="brand-bar-inner">
            <Link href="/" className="brand"><Logo /></Link>
            <a href="#contact" className="brand-link" style={{color: theme.gold, textDecoration:'none', fontSize: 10, fontWeight: 800, letterSpacing: '1.5px'}}>Connect With Us</a>
          </div>
        </header>

        <section className="hero">
          <Image src="/banner.jpg" alt="Banner" width={1536} height={802} priority sizes="100vw" className="hero-image" />
        </section>

        <section className="intro" id="contact">
          <div className="content-width">
            <div className="eyebrow">Invest, earn, and Retire</div>
            <h1>Build wealth with <em>purpose.</em></h1>
            <p>The Smart Money Blueprint simplifies your path to financial growth through disciplined saving, informed investing, and long-term planning. For step-by-step guidance and trade support, connect with the TMB Team using the links below.</p>

            <div className="contact-pills-container">
              
              {/* WHATSAPP GROUP */}
              {(whatsappEnabled && WHATSAPP_URL) || (whatsappSecondaryEnabled && whatsappSecondary) ? (
                <div className="contact-group">
                  {whatsappEnabled && WHATSAPP_URL && (
                    <Link href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="contact-pill whatsapp">
                      <span className="pill-icon"><WhatsAppIcon size={20} /></span>
                      <span className="pill-label">{whatsappLabel}</span>
                    </Link>
                  )}
                  {whatsappSecondaryEnabled && whatsappSecondary && (
                    <Link href={whatsappSecondary} target="_blank" rel="noopener noreferrer" className="alt-link">
                      <WhatsAppIcon size={12} />
                      <span>{whatsappSecondaryLabel}</span>
                    </Link>
                  )}
                </div>
              ) : null}

              {/* TELEGRAM GROUP */}
              {(telegramEnabled && TELEGRAM_URL) || (telegramSecondaryEnabled && telegramSecondary) ? (
                <div className="contact-group">
                  {telegramEnabled && TELEGRAM_URL && (
                    <Link href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" className="contact-pill telegram">
                      <span className="pill-icon"><TelegramIcon size={20} /></span>
                      <span className="pill-label">{telegramLabel}</span>
                    </Link>
                  )}
                  {telegramSecondaryEnabled && telegramSecondary && (
                    <Link href={telegramSecondary} target="_blank" rel="noopener noreferrer" className="alt-link">
                      <TelegramIcon size={12} />
                      <span>{telegramSecondaryLabel}</span>
                    </Link>
                  )}
                </div>
              ) : null}

            </div>
          </div>
        </section>

        {livechatEnabled && LIVECHAT_URL && (
          <LiveChatWidget livechatUrl={LIVECHAT_URL} agentName={AGENT_NAME} />
        )}

        <section className="pillars">
           <div className="section-width">
            <div className="dark-eyebrow">The framework</div>
            <h2 className="pillars-title">Three pillars.<br/>One stronger financial future.</h2>
            <div className="pillar-grid">
              <article className="pillar">
                <div className="pillar-heading"><div className="pillar-dot"/><h2>Invest</h2></div>
                <p>Put your money to work with intention. Learn how to evaluate opportunities, manage risk, and build an investment strategy designed to grow your wealth over time.</p>
              </article>
              <article className="pillar">
                <div className="pillar-heading"><div className="pillar-dot"/><h2>Earn</h2></div>
                <p>Develop reliable income streams, invest strategically, and build the kind of financial momentum that compounds year after year.</p>
              </article>
              <article className="pillar">
                <div className="pillar-heading"><div className="pillar-dot"/><h2>Retire</h2></div>
                <p>Turn today's discipline into tomorrow's freedom. Plan for the future, build lasting wealth, and create a financial foundation that allows you to retire with confidence and choice.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="philosophy">
          <div className="philosophy-grid">
            <div>
              <div className="eyebrow philosophy-eyebrow">Our philosophy</div>
              <h2>Less noise.<br/>More <em>clarity.</em></h2>
            </div>
            <div className="philosophy-copy-wrap">
              <p className="philosophy-copy">Money can become complicated quickly. Our approach starts by bringing the conversation back to the things you can control: your goals, your habits, your time horizon, and the choices you make consistently.</p>
              <div className="principle"><div className="check">✓</div><span>Understand your starting point before planning your next move.</span></div>
              <div className="principle"><div className="check">✓</div><span>Build habits that remain useful through changing markets and circumstances.</span></div>
              <div className="principle"><div className="check">✓</div><span>Think long term rather than reacting to every short-term headline.</span></div>
              <div className="principle"><div className="check">✓</div><span>Keep your financial strategy aligned with the life you actually want.</span></div>
            </div>
          </div>
        </section>

        <footer>
          <div className="footer-name">TheSmartMoneyBlueprint</div>
          <p className="footer-copy">© {new Date().getFullYear()} TheSmartMoneyBlueprint. All rights reserved.<br/>Financial decisions should be considered in light of your individual position.</p>
        </footer>
      </div>
    </main>
  );
}
