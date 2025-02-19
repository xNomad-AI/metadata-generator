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

// Main function to generate ai nft metadata
async function main() {
    const openAIAgent = new OpenAIAgent();

    const concurrencyLimit = Number(process.env.MAX_GENERATION_CONCURRENCY) || 5;

    // Generate the prompt from eliza character document
    const learnCharacterPrompt = getLearnCharacterPrompt();
    // Let OpenAI learn the Eliza character document.
    const messageParams: ChatCompletionMessageParam[] = [{
        role: 'user',
        content: learnCharacterPrompt
    }];
    // Save OpenAI response
    messageParams.push({
        role: 'assistant',
        content: await openAIAgent.sendMessage(messageParams)
    });

    // Gererate the prompt from collection worldview document
    const learnWorldviewPrompt = getLearnWorldviewPrompt();
    // Let OpenAI learn the collection worldview document.
    messageParams.push({
        role: 'user',
        content: learnWorldviewPrompt
    });
    // Save OpenAI response
    messageParams.push({
        role: 'assistant',
        content: await openAIAgent.sendMessage(messageParams)
    });

    // Retrieve the metadata for standard and AI NFTs
    const standardNftsMetadataMap = getStandardNFTsMetadata();
    const aiNftsMetadataMap = getAiNFTsMetadata();
    // Get the list of file names from the standard NFT metadata map
    const fileNames = Array.from(standardNftsMetadataMap.keys());

    const processFile = async (fileName: string) => {
        const aiNftMetadata = aiNftsMetadataMap.get(fileName);
        // Skip if AI NFT metadata already exists
        if (aiNftMetadata) {
            return;
        }
        const standardNftMetadata = standardNftsMetadataMap.get(fileName)!;

        // Generate an ai nft character prompt from standard nft metadata
        const generateCharacterPrompt = getGenerateAiNftCharacterPrompt(standardNftMetadata);
        try {
            // Let OpenAI generate AI NFT character.
            const aiNftCharacterContent = await openAIAgent.sendMessage([...messageParams, {
                role: 'user',
                content: generateCharacterPrompt
            }]);
            
            // Extract the AI NFT character from the response and adjust its structure
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
            // Validate the AI character object against the schema
            CharacterSchema.parse(aiNftCharacter)
            
            // Create the AI NFT metadata object and write it to the path 'AI_NFT_METADATA_PATH'.
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

    // Process each batch of files concurrently, ensuring all tasks are completed
    const batches: string[][] = [];
    for (let i = 0 ; i < fileNames.length; i += concurrencyLimit) {
        const batch = fileNames.slice(i, i + concurrencyLimit);
        batches.push(batch);
    }
    for (const batch of batches) {
        await Promise.allSettled(batch.map(fileName => processFile(fileName)));
    }
}

// Function to generate a prompt for learning character data from specific files
function getLearnCharacterPrompt(): string {
    const learnPrompt = 
`According to the document:
${characterDocument}
As well as the following five specific character files:
c3poCharacter.json:
${JSON.stringify(c3poCharacter)}

dobbyCharacter.json:
${JSON.stringify(dobbyCharacter)}

eternalaiCharacter.json:
${JSON.stringify(eternalaiCharacter)}

tateCharacter.json:
${JSON.stringify(tateCharacter)}

trumpCharacter.json:
${JSON.stringify(trumpCharacter)}

Learn the patterns within them.`;

    return learnPrompt;
}

// Function to generate a prompt for studying the worldview document
function getLearnWorldviewPrompt(): string {
    const worldviewDocument = readFileContent(process.env.WORLDVIEW_DOCUMENT_PATH!)

    const learnPrompt = 
`Study the worldview document:
${worldviewDocument}`;

    return learnPrompt;
}

// Function to generate a prompt for standard nft metadata
// You can edit the 'Requirements' section according to your needs.
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

// Function to get standard nfts metadata from path 'STANDARD_NFT_METADATA_PATH'
// Provided by the collection team.
function getStandardNFTsMetadata(): Map<string, NftMetadata> {
    const { files, fileNames } = readJsonFiles(process.env.STANDARD_NFT_METADATA_PATH!);
    
    const standardNftsMetadataMap = new Map<string, NftMetadata>();

    fileNames.forEach((fileName, index) => {
        standardNftsMetadataMap.set(fileName, files[index] as NftMetadata);
    });

    return standardNftsMetadataMap;
}

// Function to get ai nfts metadata from path 'AI_NFT_METADATA_PATH'
// Generated by the generator.
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