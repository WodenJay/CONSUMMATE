import { OpenAI } from 'openai';

export default async function handler(req, res) {
    // 允许所有域名访问
    res.setHeader('Access-Control-Allow-Origin', '*');

    // 只允许POST请求
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        if (!process.env.DEEPSEEK_API_KEY) {
            return res.status(500).json({ error: 'API密钥未配置' });
        }

        const { messages } = req.body;

        const openai = new OpenAI({
            baseURL: 'https://api.deepseek.com',
            apiKey: process.env.DEEPSEEK_API_KEY
        });

        const completion = await openai.chat.completions.create({
            model: "deepseek-chat",
            messages: messages,
            temperature: 0.7,
            max_tokens: 50
        });

        return res.status(200).json({
            response: completion.choices[0].message.content
        });

    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({
            error: error.message || 'Internal server error'
        });
    }
}
