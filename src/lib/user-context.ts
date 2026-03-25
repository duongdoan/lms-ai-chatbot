import currentUser from '@/data/current-user.json';
import { knowledge } from '@/lib/knowledge';

function resolveCourseName(courseId: string): string {
  const course = knowledge.courses.find((c) => c.id === courseId);
  return course ? course.title : courseId;
}

function resolveCourseList(courseIds: string[]): string {
  return courseIds.map(resolveCourseName).join(', ');
}

function formatCompetencies(
  competencies: typeof currentUser.competencies,
): string {
  return competencies
    .map(
      (c) =>
        `  - ${c.name}: hiện tại ${c.current_level} → mục tiêu ${c.target_level}` +
        (c.note ? ` (${c.note})` : ''),
    )
    .join('\n');
}

export function buildUserContextPrompt() {
  return `
Thông tin người dùng hiện tại:

- Tên: ${currentUser.name}
- Vai trò: ${currentUser.role_label}
- Level: ${currentUser.experience_level}
- Location: ${currentUser.base_location}

Khung năng lực:
${formatCompetencies(currentUser.competencies)}

Tình trạng học tập:
- Đã hoàn thành: ${resolveCourseList(currentUser.learning_profile.completed_courses)}
- Đang học: ${resolveCourseList(currentUser.learning_profile.in_progress_courses)}
- Chứng chỉ hết hạn: ${resolveCourseList(currentUser.learning_profile.expired_certificates)}

Nguyên tắc:
- Ưu tiên gợi ý khóa học phù hợp với vai trò và level
- Tránh gợi ý khóa đã hoàn thành
- Ưu tiên khóa bắt buộc nếu chưa học
- Nếu có chứng chỉ hết hạn → ưu tiên nhắc học lại
- Nếu năng lực hiện tại chưa đạt mục tiêu → gợi ý khóa học nâng cao năng lực đó
- Cá nhân hoá câu trả lời theo user
`.trim();
}