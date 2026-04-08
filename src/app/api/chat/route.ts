import { openai } from '@/lib/openai';
import { buildChatbotSystemPrompt } from '@/lib/chatbot-config';
import { buildUserContextPrompt } from '@/lib/user-context';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = Array.isArray(body?.messages) ? body.messages : [];

    const lastUserMessage =
      [...messages].reverse().find((m) => m?.role === 'user')?.content || '';

    const response = await openai.responses.create({
      model: 'gpt-5.4-mini',
      input: [
        {
          role: 'system',
          content: [{ type: 'input_text', text: buildChatbotSystemPrompt() }],
        },
        {
          role: 'system',
          content: [{ type: 'input_text', text: buildUserContextPrompt() }],
        },
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text:
                typeof lastUserMessage === 'string'
                  ? lastUserMessage
                  : JSON.stringify(lastUserMessage),
            },
          ],
        },
      ],
    });

    return Response.json({
      id: response.id,
      text: response.output_text || 'Xin lỗi, tôi chưa có câu trả lời phù hợp.',
    });
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: 'Chat API error' },
      { status: 500 }
    );
  }
}
