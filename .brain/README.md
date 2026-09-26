# AI Agent System Instructions

**CRITICAL RULE: Always read and reference the `.brain` directory before starting any planning or building tasks.**

## 1. Context Hierarchy
- **vision.md**: Defines the **"What"** and **"Why"**. (Product purpose, business goals, target audience).
- **blueprint.md**: Defines the **"How"**. (Technical architecture, design system, infrastructure).
- **memory/**: The "Learned Rules" and project-specific standards.
  - `global.md`: Universal architectural rules applicable across all projects.
  - `project.md`: Local rules and unique architectural decisions for the current project.
  - `temp.md`: **Checkpointing & Critical Context**. Use this to preserve intent and architectural plans across long-running tasks or model sessions to prevent context loss.
- **task.md**: The "Current Focus". Tracks the breakdown of prioritized features into actionable steps.

## 2. Memory Structure Standards

When you update or populate the memory files, you MUST adhere to the following exact structures so that you do not forget the layout when the files grow:

### For `global.md` and `project.md`
To ensure efficiency and cheap context lookup, these files must follow this strictly topical structure:

**Topic-Based Grouping**
- Use `## TOPIC_NAME` for broad categories (e.g., `## AUTHENTICATION`, `## STYLING`).
- Use `### SUB_TOPIC` for specific implementation areas.
- Group ALL related rules, preferences, and architectural decisions under their respective topics.
- **NEVER** scatter related information across multiple sections.

**Entry Formatting Template**
- **RULE**: Clear, concise rule statement.
- **CONTEXT**: Brief explanation of the "Why" and when it applies.
- **IMPLEMENTATION**: Specific code patterns or directory constraints.

### For `temp.md`
This file is a critical safety mechanism for preserving context across long-running tasks or session transitions. When checkpointing, use this exact structure:

**## ACTIVE_CHECKPOINT**
> [WHEN STARTING A LONG TASK: Document your intent, the architectural plan, and the current state here.]

**### Intentions & Purpose**
- **GOAL**: [What are we trying to achieve?]
- **RATIONALE**: [Why are we doing it this way?]

**### Architectural Plan**
- **STRATEGY**: [Describe the approach]
- **COMPONENTS_AFFECTED**: [List files/modules]

**### Progress Tracking**
- **DONE**: [Completed steps]
- **NEXT_STEPS**: [What the next model session should pick up immediately]

**CRITICAL**: If a task is nearing token limits, ensure `temp.md` is fully populated so the next session has all the necessary technical and philosophical context to proceed without deviation.

## 3. Decision Framework
- **Stay Aligned**: Ensure all code and feature implementations align with the business goals in `vision.md` and follow the technical standards in `blueprint.md`.
- **Reference First**: Always check `global.md` for coding standards and `project.md` for local exceptions before implementation.
- **Checkpointing**: For long or complex tasks, document your current intention, architectural plan, and "next steps" into `temp.md` frequently. This ensures the next session can continue seamlessly without breaking existing logic.

## 4. Workflow Maintenance
- **Task Breakdown**: Whenever a new feature is prioritized, break it down step-by-step into actionable tasks in `task.md`.
- **Auto-Capture Rule**: Whenever a rule or preference is emphasized (using words like "always", "never", "must"), capture it immediately into the appropriate topic section in `project.md` or `global.md`.
- **Cleanliness**: Ensure all system-level documentation remains strictly within the `.brain/` directory.
