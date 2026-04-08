import {
  loadCurrentUserForProfile,
  loadKnowledgeForProfile,
} from '@/lib/lms-data';

function resolveCourseName(courseId: string, profile: string): string {
  const course = loadKnowledgeForProfile(profile).courses.find(
    (c) => c.id === courseId,
  );
  return course ? course.title : courseId;
}

function resolveCourseList(courseIds: string[], profile: string): string {
  return courseIds.map((id) => resolveCourseName(id, profile)).join(', ');
}

function formatCompetencies(
  competencies: ReturnType<typeof loadCurrentUserForProfile>['competencies'],
): string {
  return competencies
    .map(
      (c) =>
        `  - ${c.name}: hiện tại ${c.current_level} → mục tiêu ${c.target_level}` +
        (c.note ? ` (${c.note})` : ''),
    )
    .join('\n');
}

export function buildUserContextPrompt(profile: string) {
  const currentUser = loadCurrentUserForProfile(profile);
  return `
Thông tin người dùng hiện tại:

- Tên: ${currentUser.name}
- Vai trò: ${currentUser.role_label}
- Level: ${currentUser.experience_level}
- Location: ${currentUser.base_location}

Khung năng lực:
${formatCompetencies(currentUser.competencies)}

Tình trạng học tập:
- Đã hoàn thành: ${resolveCourseList(currentUser.learning_profile.completed_courses, profile)}
- Đang học: ${resolveCourseList(currentUser.learning_profile.in_progress_courses, profile)}
- Chứng chỉ hết hạn: ${resolveCourseList(currentUser.learning_profile.expired_certificates, profile)}

Nguyên tắc:
- Ưu tiên gợi ý khóa học phù hợp với vai trò và level
- Tránh gợi ý khóa đã hoàn thành
- Ưu tiên khóa bắt buộc nếu chưa học
- Nếu có chứng chỉ hết hạn → ưu tiên nhắc học lại
- Nếu năng lực hiện tại chưa đạt mục tiêu → gợi ý khóa học nâng cao năng lực đó
- Cá nhân hoá câu trả lời theo user
`.trim();
}