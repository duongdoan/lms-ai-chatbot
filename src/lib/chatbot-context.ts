import { CHATBOT_DEFAULT_DOMAIN, CHATBOT_DEFAULT_NAME } from './chatbot-defaults';

/** Context cố định đưa vào system prompt (đồng bộ với env CHATBOT_*). */
export const chatbotContext = `
Context cố định:
- Tên chatbot: ${process.env.CHATBOT_NAME || CHATBOT_DEFAULT_NAME}
- Miền nghiệp vụ: ${process.env.CHATBOT_DOMAIN || CHATBOT_DEFAULT_DOMAIN}
- Ngôn ngữ ưu tiên: ${process.env.CHATBOT_LANGUAGE || 'vi'}
`.trim();
