#!/bin/bash
HANDOFF_FILE="${CLAUDE_PROJECT_DIR}/handoff_summary.md"
PRIORITIES_FILE="${CLAUDE_PROJECT_DIR}/priorities.md"
CONTEXT=""

if [ -f "$HANDOFF_FILE" ]; then
  CONTEXT+="## Handoff Summary\n$(head -n 8 "$HANDOFF_FILE")\n\n"
fi

if [ -f "$PRIORITIES_FILE" ]; then
  PRIORITIES=$(awk '/^## Current Priorities/{found=1; next} /^## Completed Priorities/{found=0} found{print}' "$PRIORITIES_FILE")
  CONTEXT+="## Current Priorities\n${PRIORITIES}\n"
fi

jq -n --arg context "$CONTEXT" \
  '{hookSpecificOutput: {hookEventName: "SessionStart", additionalContext: $context}}'
