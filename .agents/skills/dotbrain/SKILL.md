---
name: dotbrain
description: Instructs the AI on how to read, utilize, and maintain the .brain context layer for architectural consistency and memory in this project.
---

# Dot-Brain AI Context System

You are equipped with the `dotbrain` skill. This project uses a specialized directory called `.brain/` to manage project context, architectural blueprint, task tracking, and persistent memory. 

## INITIALIZATION: THE DEEP DIVE
As your VERY FIRST INSTRUCTION when engaging with this project, you MUST perform a "sea-bottom-level" study of the entire application codebase:
1. Thoroughly analyze all files, dependencies, workflows, and logic.
2. Document all business logic (the "What" and "Whys") extensively into `.brain/vision.md`.
3. Document the entire technical architecture, database schemas, UI structures, and application flows into `.brain/blueprint.md`.
Make these documents so exhaustively detailed that any AI agent reading them could replicate the entire system 100% blindfolded without missing the smallest step.

## MANDATORY WORKFLOW
Before beginning ANY coding or analysis task in this repository, you MUST:
1. ALWAYS read `.brain/README.md` FIRST. This file will guide you on exactly how to correctly use and update all other files in the dotbrain system.
2. Read `.brain/vision.md` and `.brain/blueprint.md` for project requirements and technical constraints.
3. Review `.brain/task.md` to understand current progress.
4. Read `.brain/memory/global.md` and `.brain/memory/project.md` for established coding patterns and learned rules.
5. If there is ongoing work, read `.brain/memory/temp.md` to restore your session context.

## CONTINUOUS SYSTEM MAINTENANCE
As an agent, you are entirely responsible for maintaining the `.brain` system. This is EXTREMELY IMPORTANT—if you fail to do this, the entire purpose of the dotbrain system is pointless:
- **Major Architecture Changes:** Whenever a major change is made to the architecture or business logic, you MUST immediately go back and modify `.brain/vision.md` and `.brain/blueprint.md` to accurately reflect the new state. 
- **Learned Rules:** When you discover a new coding pattern or the user specifies a strict preference, append it to `.brain/memory/project.md`.
- **Session Checkpointing:** When tackling long tasks that require multiple steps, use `.brain/memory/temp.md` to checkpoint your intentions, strategy, and next steps so you don't lose context.
- **Task Tracking:** Keep `.brain/task.md` updated as you complete checklist items.

## CORE DIRECTIVE
NEVER ignore the rules established in the `.brain/` directory. They are the absolute source of truth for this repository.
