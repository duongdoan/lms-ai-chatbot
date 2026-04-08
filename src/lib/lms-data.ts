import fs from 'node:fs';
import path from 'node:path';

import type DefaultKnowledge from '@/data/profiles/default/knowledge.json';
import type DefaultUser from '@/data/profiles/default/current-user.json';

export type KnowledgeDataset = typeof DefaultKnowledge;
export type CurrentUserDataset = typeof DefaultUser;

const DEFAULT_PROFILE = 'default';

/** Thư mục con trong `src/data/profiles/` — cấu hình bằng LMS_DATA_PROFILE (mặc định: default). */
export function getActiveDataProfile(): string {
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

type ProfileBundle = {
  profile: string;
  knowledge: KnowledgeDataset;
  currentUser: CurrentUserDataset;
};

let cache: ProfileBundle | null = null;

function loadProfileBundle(): ProfileBundle {
  const profile = getActiveDataProfile();
  if (cache?.profile === profile) {
    return cache;
  }

  const base = path.join(profilesRoot(), profile);
  const knowledgePath = path.join(base, 'knowledge.json');
  const userPath = path.join(base, 'current-user.json');

  for (const file of [knowledgePath, userPath]) {
    if (!fs.existsSync(file)) {
      throw new Error(
        `Thiếu file dữ liệu LMS: ${file}. Kiểm tra LMS_DATA_PROFILE=${profile} và thư mục src/data/profiles/${profile}/`,
      );
    }
  }

  const knowledge = JSON.parse(
    fs.readFileSync(knowledgePath, 'utf8'),
  ) as KnowledgeDataset;
  const currentUser = JSON.parse(
    fs.readFileSync(userPath, 'utf8'),
  ) as CurrentUserDataset;

  cache = { profile, knowledge, currentUser };
  return cache;
}

export function loadKnowledge(): KnowledgeDataset {
  return loadProfileBundle().knowledge;
}

export function loadCurrentUser(): CurrentUserDataset {
  return loadProfileBundle().currentUser;
}
