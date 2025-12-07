# Supervisor Agent

## Overview

The Supervisor Agent is a high-level AI coordinator that manages and orchestrates other AI agents to complete complex tasks. It provides a framework for multi-agent systems where different specialized agents work together under central coordination.

## Features

- **Task Management**: Create, assign, prioritize, and track tasks
- **Agent Coordination**: Monitor and manage multiple AI agents
- **Decision Making**: Make structured decisions based on current state and user input
- **State Management**: Maintain and update a comprehensive state of the system
- **Progress Tracking**: Generate summaries and track progress of ongoing tasks

## Architecture

The Supervisor Agent maintains a state that includes:

- **Tasks**: List of tasks with their status, priority, dependencies, and results
- **Active Agents**: List of available agents with their status and capabilities
- **Context**: Additional contextual information needed for decision-making

## How It Works

1. **Initialization**: Create a new supervisor agent with an initial context
2. **Decision Making**: The agent analyzes the current state and user input to make decisions
3. **Execution**: Decisions are executed to update the system state (assigning tasks, prioritizing work, etc.)
4. **Summary Generation**: The agent can provide summaries of current progress and next steps

## How to Use

### Initialization

```tsx
import { initializeSupervisorAction } from '@/modules/coscientist/agents/supervisor';

// Initialize with optional context
const { data: supervisorState } = await initializeSupervisorAction({
  projectGoal: "Analyze research data and generate insights",
  domain: "biochemistry",
  constraints: ["deadline: 48 hours", "focus on protein interactions"]
});
```

### Making Decisions

```tsx
import { makeDecisionAction } from '@/modules/coscientist/agents/supervisor';

// Get the next decision based on current state and user input
const { data: decision } = await makeDecisionAction(
  supervisorState,
  "We need to prioritize the analysis of protein folding patterns"
);

// Example decision output:
// {
//   action: "create_new_task",
//   reasoning: "Protein folding analysis is critical for understanding interactions",
//   details: {
//     task: {
//       name: "Analyze protein folding patterns",
//       description: "Perform detailed analysis of protein folding...",
//       priority: "high",
//       dependencies: []
//     }
//   }
// }
```

### Executing Decisions

```tsx
import { executeDecisionAction } from '@/modules/coscientist/agents/supervisor';

// Execute the decision and update the state
const { data: updatedState } = await executeDecisionAction(
  supervisorState,
  decision
);
```

### Getting Progress Summaries

```tsx
import { getSummaryAction } from '@/modules/coscientist/agents/supervisor';

// Get a summary of current progress
const { data: summary } = await getSummaryAction(updatedState);

// Example summary:
// "Project is 40% complete. 3 of 7 tasks are finished. Currently blocked by
// task 'Data validation' waiting for external input. Recommended next step:
// Assign agent-2 to start preliminary analysis while waiting."
```

## Working with Multiple Agents

The Supervisor Agent is designed to coordinate multiple specialized agents. Here's how to set up a multi-agent system:

1. **Register agents**:

```tsx
// First, initialize the supervisor
const { data: state } = await initializeSupervisorAction({});

// Then register agents
const updatedState = {
  ...state,
  activeAgents: [
    {
      id: "agent-1",
      name: "DataAnalysisAgent",
      type: "analysis",
      status: "idle"
    },
    {
      id: "agent-2",
      name: "ReportGenerationAgent",
      type: "reporting",
      status: "idle"
    }
  ]
};
```

2. **Create tasks**:

```tsx
// Create tasks through decisions
const { data: decision } = await makeDecisionAction(
  updatedState,
  "We need to analyze the experiment results and generate a report"
);

// Execute the decision which might create tasks
const { data: newState } = await executeDecisionAction(
  updatedState,
  decision
);
```

3. **Let the supervisor assign tasks**:

```tsx
// The supervisor will decide which agent should handle which task
const { data: assignDecision } = await makeDecisionAction(
  newState,
  "Assign appropriate agents to the available tasks"
);

// Execute the assignment decision
const { data: finalState } = await executeDecisionAction(
  newState,
  assignDecision
);
```

## Best Practices

1. **Clear Context**: Provide clear and comprehensive context when initializing the supervisor
2. **Regular Updates**: Keep the supervisor updated with the latest information and results
3. **Explicit Instructions**: Give clear instructions when requesting decisions
4. **State Management**: Always use the most recent state when making new decisions
5. **Error Handling**: Always check `isSuccess` before using the data from any action

## Example: Complete Workflow

```tsx
import {
  initializeSupervisorAction,
  makeDecisionAction,
  executeDecisionAction,
  getSummaryAction
} from '@/modules/coscientist/agents/supervisor';

// 1. Initialize supervisor
const initResult = await initializeSupervisorAction({
  goal: "Complete data analysis project",
  deadline: "2023-08-15"
});

if (!initResult.isSuccess) {
  console.error("Failed to initialize supervisor:", initResult.message);
  return;
}

let state = initResult.data;

// 2. Register agents
state = {
  ...state,
  activeAgents: [
    { id: "agent-1", name: "DataAgent", type: "data", status: "idle" },
    { id: "agent-2", name: "AnalysisAgent", type: "analysis", status: "idle" },
    { id: "agent-3", name: "ReportAgent", type: "report", status: "idle" }
  ]
};

// 3. Get decision to create tasks
const decisionResult = await makeDecisionAction(
  state,
  "We need to collect data, analyze it, and generate a report."
);

if (!decisionResult.isSuccess) {
  console.error("Failed to get decision:", decisionResult.message);
  return;
}

// 4. Execute decision (creates tasks)
const executeResult = await executeDecisionAction(
  state,
  decisionResult.data
);

if (!executeResult.isSuccess) {
  console.error("Failed to execute decision:", executeResult.message);
  return;
}

state = executeResult.data;

// 5. Let supervisor assign tasks to agents
const assignResult = await makeDecisionAction(
  state,
  "Assign the tasks to the appropriate agents."
);

if (!assignResult.isSuccess) {
  console.error("Failed to get assignment decision:", assignResult.message);
  return;
}

const executeAssignResult = await executeDecisionAction(
  state,
  assignResult.data
);

if (!executeAssignResult.isSuccess) {
  console.error("Failed to execute assignment:", executeAssignResult.message);
  return;
}

state = executeAssignResult.data;

// 6. Get progress summary
const summaryResult = await getSummaryAction(state);

if (summaryResult.isSuccess) {
  console.log("Current status:", summaryResult.data);
}
```

## Technical Details

The Supervisor Agent is implemented using:

- **Server Actions**: All functions are server-side actions
- **OpenAI Integration**: Uses structured outputs with Zod for validation
- **Proper Logging**: Comprehensive logging using the shared logger
- **Type Safety**: Full TypeScript support for all operations

## Extending the Supervisor

To add new functionality to the supervisor agent, you can:

1. Extend the `SupervisorDecisionSchema` with new action types
2. Add corresponding case handling in the `executeDecisionAction` function
3. Update the system prompt in `generateSupervisorSystemPrompt` to include new capabilities

This modular design allows for easy extension without modifying the core functionality.