import { OpenAI } from "openai";
import { ChatModel, ChatCompletionMessageParam } from "openai/resources/chat.js";
import { HttpsProxyAgent } from 'https-proxy-agent';

export class OpenAIAgent {
    private openAIAgent: OpenAI;
    private openAiModel: ChatModel;
    private temperature: number;
    private maxTokens: number;
    constructor() {
        this.openAIAgent = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY!,
            baseURL: process.env.OPENAI_BASE_URL,
            timeout: 30000,
            httpAgent: process.env.PROXY_AGENT ? new HttpsProxyAgent(process.env.PROXY_AGENT) : undefined,
        });
        this.openAiModel = process.env.OPENAI_MODEL! as ChatModel;
        this.temperature = Number(process.env.OPENAI_TEMPERATURE) || 0.7;
        this.maxTokens = Number(process.env.OPENAI_MAX_TOKEN) || 1500;
    }

    async sendMessage(messages: ChatCompletionMessageParam[]): Promise<string> {
        const response = await this.openAIAgent.chat.completions.create({
            model: this.openAiModel,
            messages,
            temperature: this.temperature,
            max_tokens: this.maxTokens,
        });
        return response.choices[0].message.content!;
    }
}