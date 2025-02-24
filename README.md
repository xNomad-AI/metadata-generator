# AI-NFT metadata generator
This repository demonstrates how to generate the metadata for xNomad Genesis AI-NFTs. You can make slight modifications and use it to generate your own AI-NFT metadata.

## Preparation
- Learn [how AI-NFT works](https://docs.xnomad.ai/technology/how-ai-nft-works).
- Learn [Eliza Character Files](https://elizaos.github.io/eliza/docs/core/characterfile/).
- Learn [AI-NFT metadata](https://docs.xnomad.ai/technology/ai-nft-metadata).

## How It Works
1. Set up your favourite LLM api.
2. Instruct LLM to study the Eliza character documentation and examples.  
3. Instruct LLM to study the knowledge(like worldview, settings, stories) of your NFT collection.  
4. Instruct LLM to generate the ai agent character based on the learned information and the NFT metadata.

## Build
```shell
npm install

npx tsc
```

## Run Example
Let's generate xNomad genesis AI-NFT metadata.

### .env
```shell
AGENT_MODEL_PROVIDER="openai"
OPENAI_API_KEY=YOUR_OPENAI_API_KEY
OPENAI_BASE_URL="https://api.openai.com/v1"
OPENAI_MODEL="gpt-4o"   
OPENAI_TEMPERATURE=0.7
OPENAI_MAX_TOKEN=1500

PROXY_AGENT=

MAX_GENERATION_CONCURRENCY=5

WORLDVIEW_DOCUMENT_PATH="./example/worldview/worldview.md"  # Set the import path for your collection's worldview file.
STANDARD_NFT_METADATA_PATH="./example/metadata/standard-nfts-metadata" # Set the import path for your collection's NFTs metadata.
AI_NFT_METADATA_PATH="./example/metadata/ai-nfts-metadata"  # Set the export path for your collection's NFTs AI metadata.
```

### Start
```shell
# copy and edit the .env file
cp .env.example .env
node ./dist/index.js
```

## NOTE
**There is a probability that the AI-NFT metadata generation may fail. Please rerun the script if this happens. The AI-NFT metadata that has already been generated will not be generated again. If you need to regenerate, please delete the specified file under the ```AI_NFT_METADATA_PATH```.**
