import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import crypto from "crypto";

const sql = neon(process.env.DATABASE_URL!);

// Ensures the table exists and has all required columns including labels.
async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS site_links (
      id INT PRIMARY KEY DEFAULT 1,
      
      -- Primary Links & Labels
      whatsapp_url TEXT NOT NULL DEFAULT '',
      telegram_url TEXT NOT NULL DEFAULT '',
      livechat_url TEXT NOT NULL DEFAULT '',
      agent_name TEXT NOT NULL DEFAULT '',
      
      -- NEW: Primary Labels
      whatsapp_label TEXT NOT NULL DEFAULT 'Join Main Group',
      telegram_label TEXT NOT NULL DEFAULT 'Public Channel',
      
      -- Primary Toggles
      whatsapp_enabled BOOLEAN NOT NULL DEFAULT TRUE,
      telegram_enabled BOOLEAN NOT NULL DEFAULT TRUE,
      livechat_enabled BOOLEAN NOT NULL DEFAULT TRUE,

      -- Secondary Links & Labels
      whatsapp_url_2 TEXT NOT NULL DEFAULT '',
      telegram_url_2 TEXT NOT NULL DEFAULT '',
      
      -- NEW: Secondary Labels
      whatsapp_label_2 TEXT NOT NULL DEFAULT 'VIP / Backup',
      telegram_label_2 TEXT NOT NULL DEFAULT 'Private Signals',

      -- Secondary Toggles (Default off)
      whatsapp_enabled_2 BOOLEAN NOT NULL DEFAULT FALSE,
      telegram_enabled_2 BOOLEAN NOT NULL DEFAULT FALSE
    )
  `;

  // Backfill: Add primary columns if missing
  await sql`ALTER TABLE site_links ADD COLUMN IF NOT EXISTS livechat_url TEXT NOT NULL DEFAULT ''`;
  await sql`ALTER TABLE site_links ADD COLUMN IF NOT EXISTS agent_name TEXT NOT NULL DEFAULT ''`;
  await sql`ALTER TABLE site_links ADD COLUMN IF NOT EXISTS whatsapp_enabled BOOLEAN NOT NULL DEFAULT TRUE`;
  await sql`ALTER TABLE site_links ADD COLUMN IF NOT EXISTS telegram_enabled BOOLEAN NOT NULL DEFAULT TRUE`;
  await sql`ALTER TABLE site_links ADD COLUMN IF NOT EXISTS livechat_enabled BOOLEAN NOT NULL DEFAULT TRUE`;
  
  // Backfill: Add NEW Label columns for Primary
  await sql`ALTER TABLE site_links ADD COLUMN IF NOT EXISTS whatsapp_label TEXT NOT NULL DEFAULT 'Join Main Group'`;
  await sql`ALTER TABLE site_links ADD COLUMN IF NOT EXISTS telegram_label TEXT NOT NULL DEFAULT 'Public Channel'`;

  // Backfill: Add NEW Secondary columns
  await sql`ALTER TABLE site_links ADD COLUMN IF NOT EXISTS whatsapp_url_2 TEXT NOT NULL DEFAULT ''`;
  await sql`ALTER TABLE site_links ADD COLUMN IF NOT EXISTS telegram_url_2 TEXT NOT NULL DEFAULT ''`;
  await sql`ALTER TABLE site_links ADD COLUMN IF NOT EXISTS whatsapp_enabled_2 BOOLEAN NOT NULL DEFAULT FALSE`;
  await sql`ALTER TABLE site_links ADD COLUMN IF NOT EXISTS telegram_enabled_2 BOOLEAN NOT NULL DEFAULT FALSE`;
  
  // Backfill: Add NEW Label columns for Secondary
  await sql`ALTER TABLE site_links ADD COLUMN IF NOT EXISTS whatsapp_label_2 TEXT NOT NULL DEFAULT 'VIP / Backup'`;
  await sql`ALTER TABLE site_links ADD COLUMN IF NOT EXISTS telegram_label_2 TEXT NOT NULL DEFAULT 'Private Signals'`;
  
  // Cleanup old unused columns
  await sql`ALTER TABLE site_links DROP COLUMN IF EXISTS whatsapp_number`;
  await sql`ALTER TABLE site_links DROP COLUMN IF EXISTS telegram_username`;
}

function isAuthed(req: Request): boolean {
  const cookieHeader = req.headers.get("cookie");
  if (!cookieHeader) return false;
  
  const cookies = Object.fromEntries(
    cookieHeader.split("; ").map(c => c.split("="))
  );
  
  const sessionValue = cookies["admin_session"];
  if (!sessionValue) return false;
  
  return safeCompare(sessionValue, process.env.ADMIN_PASSWORD || "");
}

function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

const attempts = new Map<string, { count: number; resetAt: number }>(); 
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 60_000;

function isRateLimited(req: Request): boolean {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  const now = Date.now();
  const entry = attempts.get(ip);

  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  entry.count += 1;
  return entry.count > MAX_ATTEMPTS;
}

function isValidUrl(value: string | undefined | null): boolean {
  if (!value || value === "") return true;
  if (typeof value !== "string" || value.length > 2048) return false;
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function isValidHandle(value: string | undefined | null): boolean {
  if (typeof value !== "string") return false;
  if (value.length > 100) return false;
  return !/[<>]/.test(value);
}

// GET: fetch current links (public — used by homepage & admin panel)
export async function GET() {
  try {
    await ensureTable();
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
    
    return NextResponse.json({
      // Primary Data
      whatsapp: row?.whatsapp_url ?? "",
      telegram: row?.telegram_url ?? "",
      livechat: row?.livechat_url ?? "",
      agentName: row?.agent_name ?? "",
      whatsappLabel: row?.whatsapp_label ?? "Join Main Group",
      telegramLabel: row?.telegram_label ?? "Public Channel",
      whatsappEnabled: row?.whatsapp_enabled ?? true,
      telegramEnabled: row?.telegram_enabled ?? true,
      livechatEnabled: row?.livechat_enabled ?? true,
      
      // Secondary Data
      whatsappSecondary: row?.whatsapp_url_2 ?? "",
      telegramSecondary: row?.telegram_url_2 ?? "",
      whatsappSecondaryLabel: row?.whatsapp_label_2 ?? "VIP / Backup",
      telegramSecondaryLabel: row?.telegram_label_2 ?? "Private Signals",
      whatsappSecondaryEnabled: row?.whatsapp_enabled_2 ?? false,
      telegramSecondaryEnabled: row?.telegram_enabled_2 ?? false,
    });
  } catch (err) {
    console.error("GET /site-links failed:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch links" },
      { status: 500 }
    );
  }
}

// POST: log in or update links
export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  if (body.action === "login") {
    if (isRateLimited(req)) {
      return NextResponse.json(
        { success: false, error: "Too many attempts. Try again shortly." },
        { status: 429 }
      );
    }

    const ok =
      typeof body.password === "string" &&
      safeCompare(body.password, process.env.ADMIN_PASSWORD || "");

    if (ok) {
      const res = NextResponse.json({ success: true });
      res.cookies.set("admin_session", body.password, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
      return res;
    }
    return NextResponse.json({ success: false, error: "Incorrect password" }, { status: 401 });
  }

  if (body.action === "update") {
    if (!isAuthed(req)) {
      return NextResponse.json({ success: false, error: "Not authorized" }, { status: 401 });
    }

    // --- Extract All Fields ---
    const whatsapp = body.whatsapp;
    const telegram = body.telegram;
    const livechat = body.livechat ?? "";
    const agentName = body.agentName ?? "";
    
    // Primary Labels
    const whatsappLabel = body.whatsappLabel ?? "Join Main Group";
    const telegramLabel = body.telegramLabel ?? "Public Channel";
    
    const whatsappEnabled = body.whatsappEnabled ?? true;
    const telegramEnabled = body.telegramEnabled ?? true;
    const livechatEnabled = body.livechatEnabled ?? true;

    // Secondary Fields
    const whatsappSecondary = body.whatsappSecondary ?? "";
    const telegramSecondary = body.telegramSecondary ?? "";
    
    // Secondary Labels
    const whatsappSecondaryLabel = body.whatsappSecondaryLabel ?? "VIP / Backup";
    const telegramSecondaryLabel = body.telegramSecondaryLabel ?? "Private Signals";
    
    const whatsappSecondaryEnabled = body.whatsappSecondaryEnabled ?? false;
    const telegramSecondaryEnabled = body.telegramSecondaryEnabled ?? false;

    // --- Validation ---
    if (
      typeof whatsapp !== "string" ||
      typeof telegram !== "string" ||
      typeof livechat !== "string" ||
      typeof agentName !== "string" ||
      typeof whatsappLabel !== "string" || // Added
      typeof telegramLabel !== "string" || // Added
      typeof whatsappSecondary !== "string" ||
      typeof telegramSecondary !== "string" ||
      typeof whatsappSecondaryLabel !== "string" || // Added
      typeof telegramSecondaryLabel !== "string" || // Added
      typeof whatsappEnabled !== "boolean" ||
      typeof telegramEnabled !== "boolean" ||
      typeof livechatEnabled !== "boolean" ||
      typeof whatsappSecondaryEnabled !== "boolean" ||
      typeof telegramSecondaryEnabled !== "boolean"
    ) {
      return NextResponse.json({ success: false, error: "Invalid payload types" }, { status: 400 });
    }

    if (!isValidUrl(whatsapp) || !isValidUrl(telegram) || !isValidUrl(livechat)) {
      return NextResponse.json({ success: false, error: "Invalid primary URL format" }, { status: 400 });
    }
    
    if (!isValidUrl(whatsappSecondary) || !isValidUrl(telegramSecondary)) {
      return NextResponse.json({ success: false, error: "Invalid secondary URL format" }, { status: 400 });
    }

    if (!isValidHandle(agentName)) {
      return NextResponse.json({ success: false, error: "Invalid agent name" }, { status: 400 });
    }

    try {
      await ensureTable();
      
      await sql`
        INSERT INTO site_links (
          id, 
          whatsapp_url, telegram_url, livechat_url, agent_name,
          whatsapp_label, telegram_label,
          whatsapp_enabled, telegram_enabled, livechat_enabled,
          whatsapp_url_2, telegram_url_2,
          whatsapp_label_2, telegram_label_2,
          whatsapp_enabled_2, telegram_enabled_2
        )
        VALUES (
          1, 
          ${whatsapp}, ${telegram}, ${livechat}, ${agentName},
          ${whatsappLabel}, ${telegramLabel},
          ${whatsappEnabled}, ${telegramEnabled}, ${livechatEnabled},
          ${whatsappSecondary}, ${telegramSecondary},
          ${whatsappSecondaryLabel}, ${telegramSecondaryLabel},
          ${whatsappSecondaryEnabled}, ${telegramSecondaryEnabled}
        )
        ON CONFLICT (id) DO UPDATE
        SET 
            whatsapp_url = EXCLUDED.whatsapp_url,
            telegram_url = EXCLUDED.telegram_url,
            livechat_url = EXCLUDED.livechat_url,
            agent_name = EXCLUDED.agent_name,
            whatsapp_label = EXCLUDED.whatsapp_label,
            telegram_label = EXCLUDED.telegram_label,
            whatsapp_enabled = EXCLUDED.whatsapp_enabled,
            telegram_enabled = EXCLUDED.telegram_enabled,
            livechat_enabled = EXCLUDED.livechat_enabled,
            whatsapp_url_2 = EXCLUDED.whatsapp_url_2,
            telegram_url_2 = EXCLUDED.telegram_url_2,
            whatsapp_label_2 = EXCLUDED.whatsapp_label_2,
            telegram_label_2 = EXCLUDED.telegram_label_2,
            whatsapp_enabled_2 = EXCLUDED.whatsapp_enabled_2,
            telegram_enabled_2 = EXCLUDED.telegram_enabled_2
      `;
      return NextResponse.json({ success: true });
    } catch (err) {
      console.error("POST /site-links (update) failed:", err);
      return NextResponse.json(
        { success: false, error: "Failed to update links" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ success: false, error: "Unknown action" }, { status: 400 });
}
