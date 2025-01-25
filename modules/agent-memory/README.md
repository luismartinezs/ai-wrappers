# Agent Memory Module

This module provides functionality for managing and interacting with agent memory systems. It allows for:

- Storing and retrieving agent memories
- Managing memory contexts
- Analyzing memory patterns

## Structure

- `client/` - Client-side components for the agent memory interface
- `server/` - Server-side logic for memory management
- `models/` - Data models and types

## Usage

The agent memory module can be accessed at `/agent-memory` in the application.

# Reference

- https://github.com/ALucek/agentic-memory/tree/main
- https://www.psychologytoday.com/us/basics/memory/types-of-memory
- https://arxiv.org/pdf/2309.02427
- https://arxiv.org/pdf/2404.13501
- https://blog.langchain.dev/memory-for-agents/
- https://notebooklm.google.com/notebook/4251f0bf-2742-4124-971d-ba8ffb20693c?_gl=1*ngqsiy*_ga*NTYyNTEzNTMwLjE3Mjk2NTk5Mzc.*_ga_W0LDH41ZCB*MTczNzc3Nzg1NS4zLjEuMTczNzc3Nzg1NS42MC4wLjA.

- Working memory: convo history
- Episodic memory: "reflection" step to analyze past conversations and store insights.
- Semantic memory: RAG + vector db
- Procedural memory: Embeds rules and instructions within the system prompt. dynamically updated based on past interactions and feedback
- CoALA
- working memory: short term, most recent info in current decision cycle
- LTM
  - semantic: general knowledge about world and agent. external DB
  - episodic: agent past behavior and xp
  - procedural: how to do things.
- action space
  - external actions: interact with world
  - internal actions: interact with own memory modules
    - retrieval: read info from LTM
    - reasoning
    - learning: write new info to LTM
- decision-making process: iterative cycle that determines what agent does
  - planning: reasoning + retrieval, eval possible actions, pick best
  - execution: perform internal or external action
  - observation: observe action result to get feedback

https://chat.deepseek.com/a/chat/s/03e37504-246c-40bb-a815-8e111695c18b

- use case: implement a general multtipupose agent with memory with tools to access outside data
- memory types: all

user stories:
- [ ] user can get responses from deepseek LLM