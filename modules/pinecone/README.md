# Pinecone Module

This module provides a wrapper around the Pinecone vector database for vector similarity search operations.

## Setup

1. Create a Pinecone account at https://www.pinecone.io/
2. Get your API key from the Pinecone console
3. Add the following environment variables to your `.env.local`:

```bash
PINECONE_API_KEY=your-api-key-here
```

## Usage

The module provides several utility functions for working with Pinecone:

```typescript
import { createPineconeIndex, getPineconeIndex, deletePineconeIndex } from "@/modules/pinecone/server/pinecone-utils"

// Create an index (only needs to be done once)
await createPineconeIndex()

// Get a reference to the index
const index = await getPineconeIndex()

// Delete the index if needed
await deletePineconeIndex()
```

## Index Configuration

The default index configuration:
- Name: "ai-wrappers"
- Dimension: 1536 (compatible with OpenAI's text-embedding-ada-002)
- Metric: cosine
- Serverless configuration on AWS in us-east-1

You can customize the dimension when creating the index:

```typescript
await createPineconeIndex(dimension: number)
```