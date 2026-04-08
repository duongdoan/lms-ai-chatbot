import {
  loadKnowledge,
  type KnowledgeDataset,
} from '@/lib/lms-data';

export type { KnowledgeDataset };

/** Knowledge của profile đang chọn (LMS_DATA_PROFILE). */
export function getKnowledge(): KnowledgeDataset {
  return loadKnowledge();
}

function formatAssistant(a: KnowledgeDataset['assistant']): string {
  return [
    `Trợ lý: ${a.name}`,
    `Tổ chức: ${a.organization}`,
    `Miền: ${a.domain}`,
    `Ngôn ngữ: ${a.language}`,
    `Mô tả: ${a.description}`,
  ].join('\n');
}

function formatPolicies(items: KnowledgeDataset['policies']): string {
  return items
    .map((p) => `  - [${p.id}] ${p.title}: ${p.content}`)
    .join('\n');
}

function formatProcesses(items: KnowledgeDataset['processes']): string {
  return items
    .map((proc) => {
      const steps = proc.steps.map((s, i) => `    ${i + 1}. ${s}`).join('\n');
      return `  ${proc.title} (${proc.id}):\n${steps}`;
    })
    .join('\n\n');
}

function formatCategories(items: KnowledgeDataset['course_categories']): string {
  return items
    .map((c) => `  - [${c.id}] ${c.name}: ${c.description}`)
    .join('\n');
}

function formatCourses(items: KnowledgeDataset['courses']): string {
  return items
    .map((c) => {
      const roles = c.target_roles.join(', ');
      const approval = c.requires_approval ? 'có' : 'không';
      return [
        `  - ${c.title}`,
        `    Loại: ${c.type} | Nhóm: ${c.category} | Đối tượng: ${roles}`,
        `    Thời lượng: ${c.duration} | Hình thức: ${c.delivery_format}`,
        `    Phê duyệt: ${approval} | Điểm đạt: ${c.pass_score} | Hiệu lực chứng chỉ: ${c.certificate_validity || '—'}`,
        `    ${c.description}`,
      ].join('\n');
    })
    .join('\n\n');
}

function resolveCourseTitle(courseId: string, courses: KnowledgeDataset['courses']): string {
  const course = courses.find((c) => c.id === courseId);
  return course ? course.title : courseId;
}

function formatLearningPaths(
  items: KnowledgeDataset['role_learning_paths'],
  courses: KnowledgeDataset['courses'],
): string {
  return items
    .map((r) => {
      const names = r.recommended_courses
        .map((id) => resolveCourseTitle(id, courses))
        .join(', ');
      return `  - ${r.label} (${r.role}):\n    Khóa gợi ý: ${names}\n    Ghi chú: ${r.notes}`;
    })
    .join('\n\n');
}

function formatFaqs(items: KnowledgeDataset['faqs']): string {
  return items
    .map((f) => `  Q: ${f.question}\n  A: ${f.answer}`)
    .join('\n\n');
}

function formatFallback(rules: KnowledgeDataset['fallback_rules']): string {
  return [
    `  - Không rõ thông tin: ${rules.when_unknown}`,
    `  - Cần làm rõ: ${rules.when_ambiguous}`,
    `  - Ngoài phạm vi: ${rules.when_out_of_scope}`,
  ].join('\n');
}

function formatSuggested(questions: KnowledgeDataset['suggested_questions']): string {
  return questions.map((q) => `  - ${q}`).join('\n');
}

/**
 * Chuyển toàn bộ knowledge JSON thành văn bản thuần cho system prompt.
 */
export function formatKnowledgeForPrompt(
  data: KnowledgeDataset = loadKnowledge(),
): string {
  return `
Thông tin trợ lý
${formatAssistant(data.assistant)}

Chính sách (demo)
${formatPolicies(data.policies)}

Quy trình
${formatProcesses(data.processes)}

Nhóm khóa học
${formatCategories(data.course_categories)}

Danh mục khóa học
${formatCourses(data.courses)}

Gợi ý lộ trình theo vị trí
${formatLearningPaths(data.role_learning_paths, data.courses)}

FAQ
${formatFaqs(data.faqs)}

Quy tắc khi thiếu / ngoài phạm vi
${formatFallback(data.fallback_rules)}

Câu hỏi gợi ý (tham khảo)
${formatSuggested(data.suggested_questions)}
`.trim();
}
