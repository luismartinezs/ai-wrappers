"use server";

import { z } from "zod";
import { createLogger } from "@/shared/utils/logger";
import { ActionState } from "@/shared/types/actions-types";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import {
  SimplifiedChatCompletion,
  createChatCompletion,
  createStructuredChatCompletion,
} from "@/shared/openai/server/openai-lib";

// Create a logger for the supervisor agent
const logger = createLogger("SupervisorAgent");

// Define supervisor agent types
export interface AgentTask {
  id: string;
  name: string;
  description: string;
  status: "pending" | "in-progress" | "completed" | "failed";
  assignedTo?: string;
  priority: "low" | "medium" | "high";
  dependencies?: string[];
  result?: any;
}

export interface SupervisorState {
  tasks: AgentTask[];
  activeAgents: {
    id: string;
    name: string;
    type: string;
    status: "idle" | "working" | "waiting" | "error";
  }[];
  context: Record<string, any>;
}

// Schema for supervisor decisions
const SupervisorDecisionSchema = z.object({
  action: z.enum([
    "assign_task",
    "prioritize_tasks",
    "evaluate_result",
    "request_clarification",
    "complete_task",
    "create_new_task",
  ]),
  reasoning: z.string(),
  details: z.record(z.any()),
});

export type SupervisorDecision = z.infer<typeof SupervisorDecisionSchema>;

/**
 * Generate system prompt for the supervisor agent
 */
function generateSupervisorSystemPrompt(state: SupervisorState): string {
  return `You are an AI Supervisor Agent responsible for coordinating and managing other AI agents to complete tasks efficiently.

Your current state:
Tasks: ${JSON.stringify(state.tasks, null, 2)}
Active Agents: ${JSON.stringify(state.activeAgents, null, 2)}
Context: ${JSON.stringify(state.context, null, 2)}

As a supervisor agent, you should:
1. Assign tasks to appropriate agents based on their capabilities
2. Prioritize tasks based on dependencies and importance
3. Evaluate results from completed tasks
4. Request clarification when needed
5. Create new tasks when necessary to achieve goals
6. Ensure all tasks are completed correctly and efficiently

Provide clear reasoning for your decisions and specific details needed for execution.`;
}

/**
 * Makes a structured decision based on the current state and user input
 */
export async function makeDecisionAction(
  state: SupervisorState,
  userInput: string
): Promise<ActionState<SupervisorDecision>> {
  try {
    logger("Making supervisor decision", { state, userInput }, "debug");

    const messages: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: generateSupervisorSystemPrompt(state),
      },
      {
        role: "user",
        content: `Based on the current state and the following input, what decision should be made next? ${userInput}`,
      },
    ];

    const decision = await createStructuredChatCompletion(
      messages,
      SupervisorDecisionSchema,
      "decision"
    );

    logger("Supervisor decision made", { decision }, "info");

    return {
      isSuccess: true,
      message: "Successfully made supervisor decision",
      data: decision,
    };
  } catch (error) {
    logger("Error making supervisor decision", { error }, "error");
    return {
      isSuccess: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to make supervisor decision",
    };
  }
}

/**
 * Executes the given decision and updates the supervisor state
 */
export async function executeDecisionAction(
  state: SupervisorState,
  decision: SupervisorDecision
): Promise<ActionState<SupervisorState>> {
  try {
    logger("Executing supervisor decision", { decision }, "debug");

    const newState = { ...state };

    // Process the decision based on its type
    switch (decision.action) {
      case "assign_task":
        // Find the task and assign it to the specified agent
        if (decision.details.taskId && decision.details.agentId) {
          const taskIndex = newState.tasks.findIndex(
            (t) => t.id === decision.details.taskId
          );
          if (taskIndex >= 0) {
            newState.tasks[taskIndex].assignedTo = decision.details.agentId;
            newState.tasks[taskIndex].status = "in-progress";
          }
        }
        break;

      case "prioritize_tasks":
        // Update task priorities based on the decision
        if (decision.details.taskPriorities) {
          const priorities = decision.details.taskPriorities as Record<
            string,
            "low" | "medium" | "high"
          >;
          for (const [taskId, priority] of Object.entries(priorities)) {
            const taskIndex = newState.tasks.findIndex((t) => t.id === taskId);
            if (taskIndex >= 0) {
              newState.tasks[taskIndex].priority = priority;
            }
          }
        }
        break;

      case "evaluate_result":
        // Update task with evaluation result
        if (decision.details.taskId && decision.details.evaluation) {
          const taskIndex = newState.tasks.findIndex(
            (t) => t.id === decision.details.taskId
          );
          if (taskIndex >= 0) {
            newState.tasks[taskIndex].result = decision.details.evaluation;
            newState.tasks[taskIndex].status = decision.details.success
              ? "completed"
              : "failed";
          }
        }
        break;

      case "request_clarification":
        // Add the clarification request to the context
        newState.context.clarificationRequests =
          newState.context.clarificationRequests || [];
        newState.context.clarificationRequests.push({
          id: `req-${Date.now()}`,
          question: decision.details.question,
          context: decision.details.context,
          timestamp: new Date().toISOString(),
        });
        break;

      case "complete_task":
        // Mark a task as completed
        if (decision.details.taskId) {
          const taskIndex = newState.tasks.findIndex(
            (t) => t.id === decision.details.taskId
          );
          if (taskIndex >= 0) {
            newState.tasks[taskIndex].status = "completed";
            newState.tasks[taskIndex].result = decision.details.result;
          }
        }
        break;

      case "create_new_task":
        // Create a new task
        if (decision.details.task) {
          const newTask: AgentTask = {
            id: `task-${Date.now()}`,
            name: decision.details.task.name,
            description: decision.details.task.description,
            status: "pending",
            priority: decision.details.task.priority || "medium",
            dependencies: decision.details.task.dependencies || [],
          };
          newState.tasks.push(newTask);
        }
        break;
    }

    logger("Supervisor state updated", { newState }, "info");

    return {
      isSuccess: true,
      message: `Successfully executed decision: ${decision.action}`,
      data: newState,
    };
  } catch (error) {
    logger("Error executing supervisor decision", { error, decision }, "error");
    return {
      isSuccess: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to execute supervisor decision",
    };
  }
}

/**
 * Get a summary of the current supervisor state and progress
 */
export async function getSummaryAction(
  state: SupervisorState
): Promise<ActionState<string>> {
  try {
    logger("Generating supervisor summary", { state }, "debug");

    const messages: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: `You are an AI Supervisor Agent that provides concise summaries of the current state.`,
      },
      {
        role: "user",
        content: `Generate a concise summary of the current state, highlighting key progress,
        blocking issues, and next steps:

        ${JSON.stringify(state, null, 2)}`,
      },
    ];

    const completion = await createChatCompletion(messages);
    const summary =
      completion.choices[0]?.message.content || "Unable to generate summary";

    logger("Supervisor summary generated", { summary }, "info");

    return {
      isSuccess: true,
      message: "Successfully generated supervisor summary",
      data: summary,
    };
  } catch (error) {
    logger("Error generating supervisor summary", { error }, "error");
    return {
      isSuccess: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to generate supervisor summary",
    };
  }
}

/**
 * Initialize a new supervisor agent with default state
 */
export async function initializeSupervisorAction(
  initialContext: Record<string, any> = {}
): Promise<ActionState<SupervisorState>> {
  try {
    logger("Initializing supervisor agent", { initialContext }, "info");

    const initialState: SupervisorState = {
      tasks: [],
      activeAgents: [],
      context: initialContext,
    };

    return {
      isSuccess: true,
      message: "Successfully initialized supervisor agent",
      data: initialState,
    };
  } catch (error) {
    logger("Error initializing supervisor agent", { error }, "error");
    return {
      isSuccess: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to initialize supervisor agent",
    };
  }
}
