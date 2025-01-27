This module should expose a RAG interface that can be reused by other modules

RAG corresponds to the semantic memory module

- Create namespace: create namespace in the DB and in the vector DB, and associate them to a user
- Document ingestion: add documents to the knowledge base
  - extract text
  - chunking
  - embedding
  - store in vector DB
- Retrieval: Retrieve relevant documents for a query