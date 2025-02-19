# Generate AI NFT metadata
**xNomad AI NFT metadata generator.**

## Steps
```shell
Step1: Instruct OpenAI to study the Eliza character documentation and examples.  
Step2: Instruct OpenAI to study the worldview documentation of your NFT collection.  
Step3: Instruct OpenAI to generate the ai agent character based on the learned information and the NFT metadata.
```

## Build
```shell
npm install

npx tsc
```

## Run Example
**Generate xNomad genesis AI NFT metadata.**
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

STANDARD_NFT_METADATA_PATH="./example/metadata/standard-nfts-metadata"
AI_NFT_METADATA_PATH="./example/metadata/ai-nfts-metadata"
WORLDVIEW_DOCUMENT_PATH="./example/worldview/worldview.md"
```

### Start
```shell
# copy and edit the .env file
cp .env.example .env
node ./dist/index.js
```

## NOTE
**There is a probability that the AI NFT metadata generation may fail. Please rerun the script if this happens. The AI NFT metadata that has already been generated will not be generated again. If you need to regenerate, please delete the specified file under the ```AI_NFT_METADATA_PATH```.**
