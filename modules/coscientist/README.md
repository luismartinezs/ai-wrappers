https://research.google/blog/accelerating-scientific-breakthroughs-with-an-ai-co-scientist/

- input: research goal written by scientist
- output: research proposals and overview
- components:
  - multi-agent system
  - tool, use
  - memory


specialized agents: Generation, Reflection, Ranking, Evolution, Proximity and Meta-review

- user writes research goal
- research goal is parsed into research plan configuration, by supervisor agent
- supervisor assigns specialized agents to worker queue and allocates resources

Agents

- Supervisor
- Generation
  - literature exploration
  - simulated scientific debate
- Reflection
  - full review with web search
  - simulation review
  - tournament review
  - deep verification
- Ranking
- Evolution
- Proximity
- Meta-review