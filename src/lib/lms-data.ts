import fs from 'node:fs';
import path from 'node:path';

import type DefaultKnowledge from '@/data/profiles/default/knowledge.json';
import type DefaultUser from '@/data/profiles/default/current-user.json';
import type { ProfileChatUi } from '@/lib/chat-ui';

export type { ProfileChatUi } from '@/lib/chat-ui';

export type KnowledgeDataset = typeof DefaultKnowledge;
export type CurrentUserDataset = typeof DefaultUser;

export const DATA_PROFILE_COOKIE = 'lms_data_profile';

const DEFAULT_PROFILE = 'default';
const PROFILE_ID_RE = /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,63}$/;

/** Cookie / UI: profile hợp lệ trên đĩa. `LMS_DATA_PROFILE` chỉ là mặc định khi chưa có cookie. */
export function getEnvDefaultProfile(): string {
  const name = process.env.LMS_DATA_PROFILE?.trim();
  return name && name.length > 0 ? name : DEFAULT_PROFILE;
}

function profilesRoot(): string {
  return path.join(
    /* turbopackIgnore: true */ process.cwd(),
    'src',
    'data',
    'profiles',
  );
}

/** Các thư mục profile có đủ knowledge.json + current-user.json. */
export function listDataProfileIds(): string[] {
  const root = profilesRoot();
  if (!fs.existsSync(root)) return [];

  const entries = fs.readdirSync(root, { withFileTypes: true });
  const ids: string[] = [];

  for (const ent of entries) {
    if (!ent.isDirectory()) continue;
    const id = ent.name;
    if (!PROFILE_ID_RE.test(id)) continue;
    const base = path.join(root, id);
    if (
      fs.existsSync(path.join(base, 'knowledge.json')) &&
      fs.existsSync(path.join(base, 'current-user.json'))
    ) {
      ids.push(id);
    }
  }

  return ids.sort((a, b) => a.localeCompare(b));
}

export function isValidDataProfileId(id: string): boolean {
  return PROFILE_ID_RE.test(id) && listDataProfileIds().includes(id);
}

export type ProfileSummary = { id: string; label: string };

export function listProfileSummaries(): ProfileSummary[] {
  return listDataProfileIds().map((id) => {
    let label = id;
    try {
      const raw = fs.readFileSync(
        path.join(profilesRoot(), id, 'knowledge.json'),
        'utf8',
      );
      const parsed = JSON.parse(raw) as { assistant?: { name?: string } };
      if (parsed.assistant?.name) label = parsed.assistant.name;
    } catch {
      /* giữ id */
    }
    return { id, label };
  });
}

export function resolveDataProfileFromCookie(cookieValue: string | undefined): string {
  const fallback = getEnvDefaultProfile();
  if (!cookieValue || !PROFILE_ID_RE.test(cookieValue)) return fallback;
  if (!listDataProfileIds().includes(cookieValue)) return fallback;
  return cookieValue;
}

type ProfileBundle = {
  profile: string;
  knowledge: KnowledgeDataset;
  currentUser: CurrentUserDataset;
};

const bundleCache = new Map<string, ProfileBundle>();

function loadProfileBundle(profile: string): ProfileBundle {
  const cached = bundleCache.get(profile);
  if (cached) return cached;

  const base = path.join(profilesRoot(), profile);
  const knowledgePath = path.join(base, 'knowledge.json');
  const userPath = path.join(base, 'current-user.json');

  for (const file of [knowledgePath, userPath]) {
    if (!fs.existsSync(file)) {
      throw new Error(
        `Thiếu file dữ liệu LMS: ${file}. Kiểm tra thư mục src/data/profiles/${profile}/`,
      );
    }
  }

  const knowledge = JSON.parse(
    fs.readFileSync(knowledgePath, 'utf8'),
  ) as KnowledgeDataset;
  const currentUser = JSON.parse(
    fs.readFileSync(userPath, 'utf8'),
  ) as CurrentUserDataset;

  const bundle: ProfileBundle = { profile, knowledge, currentUser };
  bundleCache.set(profile, bundle);
  return bundle;
}

export function loadKnowledgeForProfile(profile: string): KnowledgeDataset {
  return loadProfileBundle(profile).knowledge;
}

export function loadCurrentUserForProfile(profile: string): CurrentUserDataset {
  return loadProfileBundle(profile).currentUser;
}

const STARTER_QUESTION_COUNT = 6;

function badgeLetterFromAssistantName(name: string): string {
  const t = name.trim();
  if (!t) return '?';
  for (const ch of t) {
    if (/[A-Za-zÀ-ỹ0-9]/.test(ch)) return ch.toUpperCase();
  }
  return '?';
}

/** Nội dung hiển thị trên UI chat theo knowledge của profile. */
export function buildProfileChatUi(profile: string): ProfileChatUi {
  const k = loadKnowledgeForProfile(profile);
  const a = k.assistant;
  const welcomeMessage = `Xin chào, tôi là ${a.name}. ${a.description}`;
  const starterQuestions = (k.suggested_questions ?? []).slice(
    0,
    STARTER_QUESTION_COUNT,
  );
  return {
    headerTitle: a.name,
    headerSubtitle: a.domain,
    headerBadgeLetter: badgeLetterFromAssistantName(a.name),
    welcomeMessage,
    starterQuestions,
  };
}
