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

/** Thứ tự ghép fragment trong `profiles/<id>/knowledge/*.json` (cùng shape với `default/knowledge.json`). */
const KNOWLEDGE_FRAGMENT_KEYS = [
  'assistant',
  'policies',
  'processes',
  'course_categories',
  'courses',
  'role_learning_paths',
  'faqs',
  'quiz_multiple_choice',
  'fallback_rules',
  'suggested_questions',
] as const;

function profileDirHasKnowledge(base: string): boolean {
  if (fs.existsSync(path.join(base, 'knowledge.json'))) return true;
  const kd = path.join(base, 'knowledge');
  return (
    fs.existsSync(kd) &&
    fs.statSync(kd).isDirectory() &&
    fs.existsSync(path.join(kd, 'assistant.json'))
  );
}

function loadKnowledgeFromFragments(knowledgeDir: string): KnowledgeDataset {
  const out: Record<string, unknown> = {};
  for (const key of KNOWLEDGE_FRAGMENT_KEYS) {
    const fp = path.join(knowledgeDir, `${key}.json`);
    if (!fs.existsSync(fp)) {
      throw new Error(
        `Thiếu fragment knowledge: ${fp}. Bổ sung file hoặc dùng một file knowledge.json gộp.`,
      );
    }
    out[key] = JSON.parse(fs.readFileSync(fp, 'utf8'));
  }
  return out as KnowledgeDataset;
}

function loadKnowledgeFromProfileDir(base: string): KnowledgeDataset {
  const single = path.join(base, 'knowledge.json');
  if (fs.existsSync(single)) {
    return JSON.parse(fs.readFileSync(single, 'utf8')) as KnowledgeDataset;
  }
  const dir = path.join(base, 'knowledge');
  if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) {
    return loadKnowledgeFromFragments(dir);
  }
  throw new Error(
    `Thiếu knowledge cho profile: ${base}. Cần knowledge.json hoặc thư mục knowledge/ đủ các file fragment.`,
  );
}

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

/** Các thư mục profile có knowledge (file gộp hoặc thư mục fragment) + current-user.json. */
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
      profileDirHasKnowledge(base) &&
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
      const base = path.join(profilesRoot(), id);
      const single = path.join(base, 'knowledge.json');
      if (fs.existsSync(single)) {
        const parsed = JSON.parse(
          fs.readFileSync(single, 'utf8'),
        ) as { assistant?: { name?: string } };
        if (parsed.assistant?.name) label = parsed.assistant.name;
      } else {
        const asst = path.join(base, 'knowledge', 'assistant.json');
        if (fs.existsSync(asst)) {
          const parsed = JSON.parse(
            fs.readFileSync(asst, 'utf8'),
          ) as { name?: string };
          if (parsed.name) label = parsed.name;
        }
      }
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
  const userPath = path.join(base, 'current-user.json');

  if (!fs.existsSync(userPath)) {
    throw new Error(
      `Thiếu file dữ liệu LMS: ${userPath}. Kiểm tra thư mục src/data/profiles/${profile}/`,
    );
  }

  const knowledge = loadKnowledgeFromProfileDir(base);
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
