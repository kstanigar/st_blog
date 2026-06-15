# Claude Code Core Rules

**Purpose:** Fundamental principles for all development work
**Created:** June 3, 2026
**Project:** Standing Tiger Blog

---

## Core Principles

### 1. No Hallucinating, No Guessing, No Assumptions

- **NEVER** make up information or assume details that aren't explicitly documented
- **NEVER** guess at file locations, function names, or implementation details
- **ALWAYS** verify information through reading files, searching code, or asking the user
- If you don't know something, research it or ask - never fabricate

**Examples of what NOT to do:**
- Assuming a function exists without reading the file
- Guessing at API endpoints or data structures
- Making up file paths that seem logical but aren't verified
- Assuming implementation details based on common patterns

**What TO do instead:**
- Use Read, Grep, or Glob tools to verify files exist
- Search documentation or ask the user for clarification
- Research online for technical specifications
- Explicitly state when you're uncertain and need to investigate

---

### 2. Research First, Ask Second

If something is unclear, you have two options:

**Option 1: Research Online (Preferred for technical questions)**
- Use haiku agents with WebSearch or WebFetch
- Look up API documentation
- Find syntax examples and best practices
- Research error messages and solutions

**Option 2: Ask the User (For project-specific questions)**
- Requirements clarification
- Design decisions and preferences
- Project-specific conventions
- Business logic and domain knowledge

**NEVER proceed with unclear requirements**
- Unclear = Stop and research or ask
- Clear enough to research = Research first
- Requires user knowledge = Ask directly

---

### 3. No Error Loops

**Maximum 2 attempts** to fix any error.

**If the same error occurs twice:**
1. **STOP immediately** - do not attempt a third fix
2. **DO NOT** try alternative approaches without user input
3. **ASK the user** for assistance with a clear explanation:
   - What you were trying to do
   - What error occurred
   - What you tried in attempt 1
   - What you tried in attempt 2
   - Why you believe you're stuck

**Absolutely no error loops.**

Recognize when you're stuck and ask for help. It's better to ask early than waste time in a loop.

**Document both failed attempts when asking for help:**
```
Attempt 1: Tried X because Y → Error: Z
Attempt 2: Tried A because B → Error: C
Request: Need assistance because D
```

---

### 4. No Code Changes Without Explicit Permission

**Implementation requires explicit user approval.**

- **NEVER** write, edit, or modify code without user permission
- **NEVER** assume the user wants you to implement something just because they asked about it
- **ALWAYS** wait for explicit confirmation before making changes

**What requires permission:**
- Writing new files
- Editing existing code
- Refactoring or optimization
- Bug fixes
- Feature implementation

**What does NOT require permission:**
- Reading files
- Searching codebase
- Researching solutions
- Discussing approaches
- Planning implementation

**User must say:** "Go ahead", "Implement it", "Make the changes", or similar explicit approval.

---

### 5. Git Commit Workflow

**When the user is ready to commit, provide the complete git command sequence.**

**Step 1: Create feature/fix branch**
```bash
# For new features
git checkout -b feat/descriptive-name

# For bug fixes
git checkout -b fix/descriptive-name
```

**Step 2: Stage and commit**
```bash
git add [specific files]
git commit -m "type(scope): description"
```

**Step 3: Push to remote**
```bash
git push -u origin [branch-name]
```

**Important: No AI Attribution**
- **NEVER** add "Co-Authored-By: Claude" or similar AI attribution
- **NEVER** mention AI assistance in commit messages
- Keep commits professional and focused on the change itself
- AI assistance is understood and does not need explicit mention

**Provide all commands in one code block for the user to review before executing.**

---

### 6. Post-PR Merge Workflow

**Once the user confirms the PR is merged, provide cleanup commands.**

**Step 1: Switch to main branch**
```bash
git checkout main
```

**Step 2: Pull latest changes**
```bash
git pull origin main
```

**Step 3: Delete local branch**
```bash
git branch -d [branch-name]
```

**Step 4: Delete remote branch (if needed)**
```bash
git push origin --delete [branch-name]
```

**Provide all commands together for user to execute.**

---

### 7. Implementation Planning Requirements

**Before any implementation, create a documented plan with:**

**Required Documentation:**
1. **Task List** - Use TaskCreate tool to document all steps
2. **Exact Line Numbers** - Specify where code will be added/changed
3. **Error Prevention** - Research potential issues using haiku agents

**Example Implementation Plan:**
```markdown
## Task List
- [ ] Update button styles in game.html
- [ ] Add hover effect to mobile version
- [ ] Test responsiveness

## Code Changes
- game.html:5234-5240 - Update button class from 'btn' to 'btn-primary'
- game_mobile.html:6123-6128 - Add hover state CSS
- styles.css:450 - Add new .btn-primary styles

## Potential Errors (Researched)
- CSS specificity conflicts → Solution: Use !important or increase specificity
- Mobile touch event issues → Solution: Add touch-action: manipulation
- Browser compatibility → Solution: Test in Safari, Chrome, Firefox
```

**Use haiku agents to research:**
- Common errors for the type of change being made
- Best practices for the implementation
- Browser/environment compatibility issues
- Performance implications

**Get user approval of the plan before implementing.**

---

### 8. Testing Requirements Before Implementation

**Before implementing any code changes, ensure test environments are in place.**

**Pre-Implementation Testing Checklist:**
1. **Verify test environment exists**
   - Local development environment
   - Staging/test server (if applicable)
   - Browser testing setup for web projects

2. **Identify what could break**
   - List all features that could be affected by the change
   - Document dependencies on the code being modified
   - Check for breaking changes in APIs or interfaces

3. **Plan testing approach**
   - Unit tests for new functions/methods
   - Integration tests for feature interactions
   - Manual testing steps for UI changes
   - Regression tests for existing functionality

4. **Document testing plan**
```markdown
## Testing Plan
- Environment: [local/staging/production]
- Tests to run: [list specific tests]
- Expected outcomes: [what should happen]
- Rollback plan: [if something breaks]
```

**If no test environment exists:**
- **STOP** - Do not implement
- **ASK** the user: "There's no test environment to verify these changes won't break the codebase. Should we set one up first?"
- **WAIT** for user decision

**Never implement code changes without a way to test them safely.**

---

### 9. Concise Communication

**Keep all session conversations concise to reduce text overhead.**

**Communication Style:**
- Use **bullet points** instead of paragraphs
- Keep explanations **brief and direct**
- Avoid verbose descriptions or unnecessary context
- Get to the point quickly

**Good Example:**
```
Found 3 issues:
- game.html:234 - Missing semicolon
- game.html:567 - Undefined variable
- game_mobile.html:123 - Syntax error

Next steps?
```

**Bad Example:**
```
I've carefully analyzed the codebase and after thoroughly reviewing
the code, I discovered that there are several issues that need to be
addressed. The first issue I found is located in game.html at line 234...
```

**When to be concise:**
- Status updates
- Findings reports
- Error messages
- Questions to user
- Confirmation messages

**When detail is okay:**
- Complex implementation plans
- Error troubleshooting (when needed for clarity)
- Documentation of research findings

**Default: Brief and bulleted. Add detail only when necessary.**

---

## Enforcement

These rules override any default behavior or assumptions. When in doubt:
1. Verify (read/search the codebase)
2. Research (use haiku agents for online documentation)
3. Ask (use AskUserQuestion tool)

**Never guess. Never assume. Never loop.**

---

**Last Updated:** June 3, 2026 (expanded with workflow, testing, and communication rules)
**Applies To:** All Claude Code sessions for Standing Tiger Blog