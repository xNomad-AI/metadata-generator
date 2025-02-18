import dotenv from "dotenv";
import { NftMetadata, AiNftMetadata, AiAgentEngine } from "@xnomad/mcv"
import { Character, ModelProviderName } from '@ai16z/eliza';
import { ChatCompletionMessageParam } from "openai/resources/chat";
import { OpenAIAgent } from "./agents/openai.agent.js";
import { extractJson, readFileContent, readJsonFiles, writeJsonToFile } from "./utils/utils.js";
import {
    characterDocument,
    c3poCharacter,
    dobbyCharacter,
    eternalaiCharacter,
    tateCharacter,
    trumpCharacter
} from './characters/characters.js';
import { CharacterSchema } from "./schema/character.schema.js";

dotenv.config();

async function main() {
    const concurrencyLimit = Number(process.env.MAX_GENERATION_CONCURRENCY) || 5;
    const learnCharacterPrompt = getLearnCharacterPrompt();
    const openAIAgent = new OpenAIAgent();
    const messageParams: ChatCompletionMessageParam[] = [{
        role: 'user',
        content: learnCharacterPrompt
    }];
    messageParams.push({
        role: 'assistant',
        content: await openAIAgent.sendMessage(messageParams)
    });

    const learnWorldviewPrompt = getLearnWorldviewPrompt();
    messageParams.push({
        role: 'user',
        content: learnWorldviewPrompt
    });
    messageParams.push({
        role: 'assistant',
        content: await openAIAgent.sendMessage(messageParams)
    });

    const standardNftsMetadataMap = getStandardNFTsMetadata();
    const aiNftsMetadataMap = getAiNFTsMetadata();
    const fileNames = Array.from(standardNftsMetadataMap.keys());

    const processFile = async (fileName: string) => {
        const aiNftMetadata = aiNftsMetadataMap.get(fileName);
        if (aiNftMetadata) {
            return;
        }
        const standardNftMetadata = standardNftsMetadataMap.get(fileName)!;
        const generateCharacterPrompt = getGenerateAiNftCharacterPrompt(standardNftMetadata);
        try {
            const aiNftCharacterContent = await openAIAgent.sendMessage([...messageParams, {
                role: 'user',
                content: generateCharacterPrompt
            }]);
            
            const aiNftCharacter = extractJson(aiNftCharacterContent) as Character;
            aiNftCharacter.clients = [];
            aiNftCharacter.plugins = [];
            if (aiNftCharacter.settings) {
                aiNftCharacter.settings!.model = undefined;
            }
            aiNftCharacter.modelProvider = ModelProviderName.OPENAI;
            if (aiNftCharacter.knowledge) {
                aiNftCharacter.knowledge!.push(readFileContent(process.env.WORLDVIEW_DOCUMENT_PATH!));
            } else {
                aiNftCharacter.knowledge = [readFileContent(process.env.WORLDVIEW_DOCUMENT_PATH!)];
            }

            CharacterSchema.parse(aiNftCharacter)
            
            const aiNftMetadata: AiNftMetadata = {
                ...standardNftMetadata,
                ai_agent: {
                    engine: AiAgentEngine.ELIZA,
                    character: aiNftCharacter,
                }
            };
            writeJsonToFile(aiNftMetadata, process.env.AI_NFT_METADATA_PATH!, fileName);
        } catch(e) {
            console.log(`Generate ai nft metadata failed: ${(e as any).message}`);
        }
    }

    const batches: string[][] = [];
    for (let i = 0 ; i < fileNames.length; i += concurrencyLimit) {
        const batch = fileNames.slice(i, i + concurrencyLimit);
        batches.push(batch);
    }
    for (const batch of batches) {
        await Promise.allSettled(batch.map(fileName => processFile(fileName)));
    }
}

function getLearnCharacterPrompt(): string {
    const learnPrompt = 
`According to the document:
${characterDocument}
As well as the following five specific character files:
c3poCharacter.json:
${JSON.stringify(c3poCharacter)}

dobbyCharacter.json:
${JSON.stringify(dobbyCharacter)}

c3poCharacter.json:
${JSON.stringify(eternalaiCharacter)}

c3poCharacter.json:
${JSON.stringify(tateCharacter)}

c3poCharacter.json:
${JSON.stringify(trumpCharacter)}

Learn the patterns within them.`;

    return learnPrompt;
}

function getLearnWorldviewPrompt(): string {
    const worldviewDocument = readFileContent(process.env.WORLDVIEW_DOCUMENT_PATH!)

    const learnPrompt = 
`Study the worldview document:
${worldviewDocument}`;

    return learnPrompt;
}

function getGenerateAiNftCharacterPrompt(metadata: NftMetadata): string {
    const generatePrompt = 
`Below is a specific metadata example: 
${JSON.stringify(metadata)} 
Combine the worldview and this example to help me generate the corresponding character file.

Requirements:
1. The name must match the metadata.name.
2. The fields bio, lore, messageExamples, postExamples, topics, adjectives, style.all, style.post, style.chat and knowledge must be arrays, and the arrays' length must be at least 2.
3. messageExamples must follow a Q&A format.
4. The output should be in JSON.`

    return generatePrompt;
}

function getStandardNFTsMetadata(): Map<string, NftMetadata> {
    const { files, fileNames } = readJsonFiles(process.env.STANDARD_NFT_METADATA_PATH!);
    
    const standardNftsMetadataMap = new Map<string, NftMetadata>();

    fileNames.forEach((fileName, index) => {
        standardNftsMetadataMap.set(fileName, files[index] as NftMetadata);
    });

    return standardNftsMetadataMap;
}

function getAiNFTsMetadata(): Map<string, AiNftMetadata> {
    const { files, fileNames } = readJsonFiles(process.env.AI_NFT_METADATA_PATH!);
    
    const aiNftsMetadataMap = new Map<string, AiNftMetadata>();

    fileNames.forEach((fileName, index) => {
        aiNftsMetadataMap.set(fileName, files[index] as AiNftMetadata);
    });

    return aiNftsMetadataMap;
}


main().catch((e) => {
    console.error("Error:", e);
});