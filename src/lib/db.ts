import path from "node:path";
import fs from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

interface SqliteDatabase {
  exec(sql: string): void;
  prepare(sql: string): {
    run(...params: any[]): { changes: number; lastInsertRowid: number };
    get(...params: any[]): any;
    all(...params: any[]): any[];
  };
}

let dbInstance: SqliteDatabase | null = null;

function getDbPath(): string {
  const projectRoot = process.cwd();
  const prismaDir = path.join(projectRoot, "prisma");
  if (!fs.existsSync(prismaDir)) {
    fs.mkdirSync(prismaDir, { recursive: true });
  }
  return path.join(prismaDir, "dev.db");
}

export function getDatabase(): SqliteDatabase {
  if (!dbInstance) {
    const { DatabaseSync } = require("node:sqlite");
    const dbPath = getDbPath();
    dbInstance = new DatabaseSync(dbPath) as SqliteDatabase;
    initTables(dbInstance);
  }
  return dbInstance;
}

function initTables(db: SqliteDatabase) {
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT,
      email TEXT UNIQUE NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      password_hash TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS meeting_templates (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      icon TEXT DEFAULT 'video',
      color TEXT DEFAULT 'blue',
      duration INTEGER DEFAULT 60,
      timezone TEXT DEFAULT 'Asia/Jayapura',
      passcode TEXT,
      waiting_room INTEGER DEFAULT 1,
      require_auth INTEGER DEFAULT 0,
      host_video INTEGER DEFAULT 1,
      participant_video INTEGER DEFAULT 0,
      mute_upon_entry INTEGER DEFAULT 1,
      auto_recording TEXT DEFAULT 'none',
      agenda TEXT,
      is_default INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS meetings (
      id TEXT PRIMARY KEY,
      zoom_meeting_id TEXT UNIQUE,
      uuid TEXT,
      topic TEXT NOT NULL,
      start_time TEXT NOT NULL,
      duration INTEGER DEFAULT 60,
      timezone TEXT DEFAULT 'Asia/Jayapura',
      status TEXT DEFAULT 'scheduled',
      host_email TEXT DEFAULT 'stipersta@gmail.com',
      join_url TEXT,
      start_url TEXT,
      passcode TEXT,
      settings_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS participants (
      id TEXT PRIMARY KEY,
      zoom_meeting_id TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT,
      join_time TEXT NOT NULL,
      leave_time TEXT,
      duration INTEGER DEFAULT 0,
      status TEXT DEFAULT 'Present',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS recordings (
      id TEXT PRIMARY KEY,
      zoom_meeting_id TEXT NOT NULL,
      recording_id TEXT UNIQUE,
      topic TEXT NOT NULL,
      start_time TEXT NOT NULL,
      duration INTEGER DEFAULT 0,
      file_type TEXT,
      file_size INTEGER DEFAULT 0,
      download_url TEXT,
      play_url TEXT,
      status TEXT DEFAULT 'completed',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS activity_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      user_email TEXT,
      action TEXT NOT NULL,
      entity TEXT NOT NULL,
      entity_id TEXT,
      description TEXT,
      ip_address TEXT,
      user_agent TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS system_settings (
      id TEXT PRIMARY KEY,
      key TEXT UNIQUE NOT NULL,
      value TEXT NOT NULL,
      description TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

function generateId(): string {
  return "c" + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

export const db = {
  // Activity Logs
  logActivity: async (data: {
    action: string;
    entity: string;
    entityId?: string;
    description?: string;
    userId?: string;
    userEmail?: string;
    ipAddress?: string;
    userAgent?: string;
  }) => {
    try {
      const db = getDatabase();
      const id = generateId();
      const stmt = db.prepare(`
        INSERT INTO activity_logs (id, user_id, user_email, action, entity, entity_id, description, ip_address, user_agent, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `);
      stmt.run(
        id,
        data.userId || "admin-1",
        data.userEmail || "stipersta@gmail.com",
        data.action,
        data.entity,
        data.entityId || null,
        data.description || null,
        data.ipAddress || null,
        data.userAgent || null
      );
    } catch {
      // Ignore logging failure in non-critical flow
    }
  },

  getActivityLogs: async (limit = 100) => {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT id, user_id as userId, user_email as userEmail, action, entity, entity_id as entityId, description, ip_address as ipAddress, user_agent as userAgent, created_at as createdAt
      FROM activity_logs
      ORDER BY created_at DESC
      LIMIT ?
    `);
    return stmt.all(limit) as Array<{
      id: string;
      userId: string;
      userEmail: string;
      action: string;
      entity: string;
      entityId: string | null;
      description: string | null;
      ipAddress: string | null;
      userAgent: string | null;
      createdAt: string;
    }>;
  },

  // Templates
  getTemplates: async () => {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT id, name, description, icon, color, duration, timezone, passcode,
             waiting_room as waitingRoom, require_auth as requireAuth,
             host_video as hostVideo, participant_video as participantVideo,
             mute_upon_entry as muteUponEntry, auto_recording as autoRecording,
             agenda, is_default as isDefault, created_at as createdAt, updated_at as updatedAt
      FROM meeting_templates
      ORDER BY is_default DESC, name ASC
    `);
    const rows = stmt.all() as any[];
    return rows.map((r) => ({
      ...r,
      waitingRoom: Boolean(r.waitingRoom),
      requireAuth: Boolean(r.requireAuth),
      hostVideo: Boolean(r.hostVideo),
      participantVideo: Boolean(r.participantVideo),
      muteUponEntry: Boolean(r.muteUponEntry),
      isDefault: Boolean(r.isDefault),
    }));
  },

  getTemplateById: async (id: string) => {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT id, name, description, icon, color, duration, timezone, passcode,
             waiting_room as waitingRoom, require_auth as requireAuth,
             host_video as hostVideo, participant_video as participantVideo,
             mute_upon_entry as muteUponEntry, auto_recording as autoRecording,
             agenda, is_default as isDefault, created_at as createdAt, updated_at as updatedAt
      FROM meeting_templates
      WHERE id = ?
    `);
    const r = stmt.get(id) as any;
    if (!r) return null;
    return {
      ...r,
      waitingRoom: Boolean(r.waitingRoom),
      requireAuth: Boolean(r.requireAuth),
      hostVideo: Boolean(r.hostVideo),
      participantVideo: Boolean(r.participantVideo),
      muteUponEntry: Boolean(r.muteUponEntry),
      isDefault: Boolean(r.isDefault),
    };
  },

  createTemplate: async (data: any) => {
    const dbInst = getDatabase();
    const id = generateId();
    const stmt = dbInst.prepare(`
      INSERT INTO meeting_templates (
        id, name, description, icon, color, duration, timezone, passcode,
        waiting_room, require_auth, host_video, participant_video,
        mute_upon_entry, auto_recording, agenda, is_default, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);
    stmt.run(
      id,
      data.name,
      data.description || null,
      data.icon || "video",
      data.color || "blue",
      data.duration || 60,
      data.timezone || "Asia/Jayapura",
      data.passcode || null,
      data.waitingRoom ? 1 : 0,
      data.requireAuth ? 1 : 0,
      data.hostVideo ? 1 : 0,
      data.participantVideo ? 1 : 0,
      data.muteUponEntry ? 1 : 0,
      data.autoRecording || "none",
      data.agenda || null,
      data.isDefault ? 1 : 0
    );
    return db.getTemplateById(id);
  },

  updateTemplate: async (id: string, data: any) => {
    const existing = await db.getTemplateById(id);
    if (!existing) throw new Error("Template not found");
    const updated = { ...existing, ...data };
    const dbInst = getDatabase();
    const stmt = dbInst.prepare(`
      UPDATE meeting_templates SET
        name = ?, description = ?, icon = ?, color = ?, duration = ?, timezone = ?, passcode = ?,
        waiting_room = ?, require_auth = ?, host_video = ?, participant_video = ?,
        mute_upon_entry = ?, auto_recording = ?, agenda = ?, is_default = ?, updated_at = datetime('now')
      WHERE id = ?
    `);
    stmt.run(
      updated.name,
      updated.description || null,
      updated.icon || "video",
      updated.color || "blue",
      updated.duration || 60,
      updated.timezone || "Asia/Jayapura",
      updated.passcode || null,
      updated.waitingRoom ? 1 : 0,
      updated.requireAuth ? 1 : 0,
      updated.hostVideo ? 1 : 0,
      updated.participantVideo ? 1 : 0,
      updated.muteUponEntry ? 1 : 0,
      updated.autoRecording || "none",
      updated.agenda || null,
      updated.isDefault ? 1 : 0,
      id
    );
    return db.getTemplateById(id);
  },

  deleteTemplate: async (id: string) => {
    const dbInst = getDatabase();
    const stmt = dbInst.prepare("DELETE FROM meeting_templates WHERE id = ?");
    stmt.run(id);
  },

  countTemplates: async () => {
    const dbInst = getDatabase();
    const res = dbInst.prepare("SELECT COUNT(*) as count FROM meeting_templates").get() as any;
    return Number(res?.count || 0);
  },

  // Meetings
  saveMeetings: async (meetings: Array<{
    id: string | number;
    zoomMeetingId?: string | number;
    uuid?: string;
    topic: string;
    startTime: string;
    duration?: number;
    timezone?: string;
    status?: string;
    hostEmail?: string;
    joinUrl?: string;
    startUrl?: string;
    passcode?: string;
  }>) => {
    const dbInst = getDatabase();
    const stmt = dbInst.prepare(`
      INSERT OR REPLACE INTO meetings (
        id, zoom_meeting_id, uuid, topic, start_time, duration,
        timezone, status, host_email, join_url, start_url, passcode, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);
    for (const m of meetings) {
      const zoomId = String(m.zoomMeetingId || m.id);
      const meetingId = String(m.id || zoomId);
      stmt.run(
        meetingId,
        zoomId,
        m.uuid || null,
        m.topic,
        m.startTime,
        m.duration || 60,
        m.timezone || "Asia/Jayapura",
        m.status || "scheduled",
        m.hostEmail || "stipersta@gmail.com",
        m.joinUrl || null,
        m.startUrl || null,
        m.passcode || null
      );
    }
  },

  getSavedMeetings: async () => {
    const dbInst = getDatabase();
    const rows = dbInst.prepare(`
      SELECT id, zoom_meeting_id as zoomMeetingId, uuid, topic, start_time as startTime,
             duration, timezone, status, host_email as hostEmail, join_url as joinUrl,
             start_url as startUrl, passcode, created_at as createdAt, updated_at as updatedAt
      FROM meetings
      ORDER BY start_time DESC
      LIMIT 500
    `).all() as any[];
    return rows.map((r) => ({
      id: Number(r.zoomMeetingId) || r.id,
      uuid: r.uuid,
      topic: r.topic,
      type: 2 as const,
      start_time: r.startTime,
      duration: r.duration || 60,
      timezone: r.timezone || "Asia/Jayapura",
      join_url: r.joinUrl || `https://zoom.us/j/${r.zoomMeetingId}`,
      start_url: r.startUrl,
      password: r.passcode,
      status: r.status,
    }));
  },

  // Participants & Attendance
  saveParticipants: async (zoomMeetingId: string, participants: Array<{
    name: string;
    email?: string;
    joinTime: string;
    leaveTime?: string;
    duration: number;
    status?: string;
  }>) => {
    const dbInst = getDatabase();
    const stmt = dbInst.prepare(`
      INSERT INTO participants (id, zoom_meeting_id, name, email, join_time, leave_time, duration, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const p of participants) {
      const id = generateId();
      stmt.run(
        id,
        zoomMeetingId,
        p.name,
        p.email || null,
        p.joinTime,
        p.leaveTime || null,
        p.duration || 0,
        p.status || (p.duration > 30 ? "Present" : p.duration > 10 ? "Left Early" : "Late")
      );
    }
  },

  getParticipants: async (options?: { meetingId?: string; search?: string }) => {
    const dbInst = getDatabase();
    let query = `
      SELECT id, zoom_meeting_id as zoomMeetingId, name, email, join_time as joinTime,
             leave_time as leaveTime, duration, status, created_at as createdAt
      FROM participants
      WHERE 1=1
    `;
    const params: any[] = [];
    if (options?.meetingId) {
      query += " AND zoom_meeting_id = ?";
      params.push(options.meetingId);
    }
    if (options?.search) {
      query += " AND (name LIKE ? OR email LIKE ?)";
      params.push(`%${options.search}%`, `%${options.search}%`);
    }
    query += " ORDER BY join_time DESC LIMIT 500";
    return dbInst.prepare(query).all(...params) as any[];
  },

  // Recordings
  saveRecordings: async (recordings: Array<{
    zoomMeetingId: string;
    recordingId: string;
    topic: string;
    startTime: string;
    duration: number;
    fileType: string;
    fileSize: number;
    downloadUrl?: string;
    playUrl?: string;
  }>) => {
    const dbInst = getDatabase();
    const stmt = dbInst.prepare(`
      INSERT OR REPLACE INTO recordings (
        id, zoom_meeting_id, recording_id, topic, start_time, duration,
        file_type, file_size, download_url, play_url, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'completed')
    `);
    for (const r of recordings) {
      const id = generateId();
      stmt.run(
        id,
        r.zoomMeetingId,
        r.recordingId,
        r.topic,
        r.startTime,
        r.duration,
        r.fileType,
        r.fileSize,
        r.downloadUrl || null,
        r.playUrl || null
      );
    }
  },

  getSavedRecordings: async () => {
    const dbInst = getDatabase();
    return dbInst.prepare(`
      SELECT id, zoom_meeting_id as zoomMeetingId, recording_id as recordingId,
             topic, start_time as startTime, duration, file_type as fileType,
             file_size as fileSize, download_url as downloadUrl, play_url as playUrl,
             status, created_at as createdAt
      FROM recordings
      ORDER BY start_time DESC
      LIMIT 200
    `).all() as any[];
  },
};
