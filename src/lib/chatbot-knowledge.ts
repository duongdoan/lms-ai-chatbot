import knowledgeData from '@/data/knowledge.json';

function formatKnowledgeJson(): string {
  const { meta, domains, processOutline, sampleCourses, limitations } =
    knowledgeData;

  const domainLines = domains
    .map((d) => `  - [${d.id}] ${d.label}: ${d.summary}`)
    .join('\n');

  const processLines = processOutline.map((p) => `  - ${p}`).join('\n');

  const courseLines = sampleCourses
    .map(
      (c) =>
        `  - ${c.code} — ${c.name} (đối tượng: ${c.audience}). ${c.notes}`,
    )
    .join('\n');

  const limitLines = limitations.map((l) => `  - ${l}`).join('\n');

  return `
${meta.title}
${meta.environment}

Lĩnh vực (tham chiếu):
${domainLines}

Quy trình tổng quát (mô tả):
${processLines}

Khóa học mẫu (minh họa):
${courseLines}

Giới hạn dữ liệu:
${limitLines}
`.trim();
}

/** Knowledge nội bộ — nguồn: \`src/data/knowledge.json\`. */
export const chatbotKnowledge = `
Knowledge nội bộ (dữ liệu cấu hình):

${formatKnowledgeJson()}
`.trim();
