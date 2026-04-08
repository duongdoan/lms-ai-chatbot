import { loadKnowledge, type KnowledgeDataset } from '@/lib/lms-data';

export type Knowledge = KnowledgeDataset;

export function getKnowledge() {
  return loadKnowledge();
}

export function buildKnowledgePrompt() {
  const data = loadKnowledge();

  return `
Thông tin knowledge nội bộ của chatbot:
${JSON.stringify(data, null, 2)}

Quy tắc sử dụng knowledge:
- Chỉ trả lời trong phạm vi học tập và đào tạo nội bộ.
- Ưu tiên dùng thông tin từ knowledge ở trên.
- Nếu knowledge không có dữ liệu phù hợp, dùng fallback_rules.when_unknown.
- Nếu câu hỏi chưa đủ rõ, dùng fallback_rules.when_ambiguous.
- Không bịa thêm chính sách hoặc quy định.
- Trả lời ngắn gọn, rõ ràng, thực tế bằng tiếng Việt.
`.trim();
}