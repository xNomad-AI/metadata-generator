import { z } from "zod";
import { Clients, ModelProviderName } from '@ai16z/eliza';

const ModelProviderNameEnum = z.enum(Object.values(ModelProviderName) as [string, ...string[]]);

const MessageExample = z.object({
  user: z.string(),
  content: z.object({
    text: z.string(),
  }),
});

const Plugin = z.object({
  name: z.string(),
  description: z.string(),
});

const ClientsEnum = z.enum(Object.values(Clients) as [string, ...string[]]);

export const CharacterSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string(),
  username: z.string().optional(),
  system: z.string().optional(),
  modelProvider: ModelProviderNameEnum,
  imageModelProvider: ModelProviderNameEnum.optional(),
  modelEndpointOverride: z.string().optional(),
  templates: z.object({
    goalsTemplate: z.string().optional(),
    factsTemplate: z.string().optional(),
    messageHandlerTemplate: z.string().optional(),
    shouldRespondTemplate: z.string().optional(),
    continueMessageHandlerTemplate: z.string().optional(),
    evaluationTemplate: z.string().optional(),
    twitterSearchTemplate: z.string().optional(),
    twitterActionTemplate: z.string().optional(),
    twitterPostTemplate: z.string().optional(),
    twitterMessageHandlerTemplate: z.string().optional(),
    twitterShouldRespondTemplate: z.string().optional(),
    farcasterPostTemplate: z.string().optional(),
    lensPostTemplate: z.string().optional(),
    farcasterMessageHandlerTemplate: z.string().optional(),
    lensMessageHandlerTemplate: z.string().optional(),
    farcasterShouldRespondTemplate: z.string().optional(),
    lensShouldRespondTemplate: z.string().optional(),
    telegramMessageHandlerTemplate: z.string().optional(),
    telegramShouldRespondTemplate: z.string().optional(),
    discordVoiceHandlerTemplate: z.string().optional(),
    discordShouldRespondTemplate: z.string().optional(),
    discordMessageHandlerTemplate: z.string().optional(),
    slackMessageHandlerTemplate: z.string().optional(),
    slackShouldRespondTemplate: z.string().optional(),
  }).optional(),
  bio: z.union([z.string(), z.array(z.string())]),
  lore: z.array(z.string()),
  messageExamples: z.array(z.array(MessageExample)),
  postExamples: z.array(z.string()),
  topics: z.array(z.string()),
  adjectives: z.array(z.string()),
  knowledge: z.array(z.string()).optional(),
  clients: z.array(ClientsEnum),
  plugins: z.array(Plugin),
  settings: z.object({
    secrets: z.record(z.string()).optional(),
    intiface: z.boolean().optional(),
    voice: z.object({
      model: z.string().optional(),
      url: z.string().optional(),
      elevenlabs: z.object({
        voiceId: z.string(),
        model: z.string().optional(),
        stability: z.string().optional(),
        similarityBoost: z.string().optional(),
        style: z.string().optional(),
        useSpeakerBoost: z.string().optional(),
      }).optional(),
    }).optional(),
    model: z.string().optional(),
    embeddingModel: z.string().optional(),
    chains: z.object({
      evm: z.array(z.unknown()).optional(),
      solana: z.array(z.unknown()).optional(),
    }).optional(),
  }).optional(),
  clientConfig: z.object({
    discord: z.object({
      shouldIgnoreBotMessages: z.boolean().optional(),
      shouldIgnoreDirectMessages: z.boolean().optional(),
      shouldRespondOnlyToMentions: z.boolean().optional(),
      messageSimilarityThreshold: z.number().optional(),
      isPartOfTeam: z.boolean().optional(),
      teamAgentIds: z.array(z.string()).optional(),
      teamLeaderId: z.string().optional(),
      teamMemberInterestKeywords: z.array(z.string()).optional(),
    }).optional(),
    telegram: z.object({
      shouldIgnoreBotMessages: z.boolean().optional(),
      shouldIgnoreDirectMessages: z.boolean().optional(),
      shouldRespondOnlyToMentions: z.boolean().optional(),
      shouldOnlyJoinInAllowedGroups: z.boolean().optional(),
      allowedGroupIds: z.array(z.string()).optional(),
      messageSimilarityThreshold: z.number().optional(),
      isPartOfTeam: z.boolean().optional(),
      teamAgentIds: z.array(z.string()).optional(),
      teamLeaderId: z.string().optional(),
      teamMemberInterestKeywords: z.array(z.string()).optional(),
    }).optional(),
    slack: z.object({
      shouldIgnoreBotMessages: z.boolean().optional(),
      shouldIgnoreDirectMessages: z.boolean().optional(),
    }).optional(),
  }).optional(),
  style: z.object({
    all: z.array(z.string()),
    chat: z.array(z.string()),
    post: z.array(z.string()),
  }),
  twitterProfile: z.object({
    id: z.string(),
    username: z.string(),
    screenName: z.string(),
    bio: z.string(),
    nicknames: z.array(z.string()).optional(),
  }).optional(),
  nft: z.object({
    prompt: z.string(),
  }).optional(),
});