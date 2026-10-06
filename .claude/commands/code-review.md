Perform a thorough code review of this codebase focused on **security vulnerabilities** and **logical bugs**.

## Steps

1. Use `git diff main` (or `git diff HEAD~1` if on main) to identify recently changed files. If no diff, review all source files under `src/`.
2. Read each changed file in full before commenting on it.
3. For each file, identify issues in these categories:

### Security

- Injection vulnerabilities (SQL, command, XSS, template injection)
- Insecure use of user-supplied input (missing validation, sanitization, or parameterization)
- Authentication/authorization gaps (missing auth checks, IDOR, privilege escalation)
- Sensitive data exposure (secrets in code, overly broad API responses, missing field filtering)
- Insecure defaults or configurations

### Logic Bugs

- Off-by-one errors, incorrect boundary conditions
- Incorrect assumptions about data shape or nullability
- Race conditions or ordering dependencies
- Missing error handling that could silently corrupt state
- Business logic that contradicts the intent visible in surrounding code or docs

## Output Format

For each issue found, output:

**File:** `path/to/file.ts` (line N)  
**Severity:** Critical / High / Medium / Low  
**Category:** Security / Logic Bug  
**Issue:** One-sentence description.  
**Detail:** Explain why this is a problem and what could go wrong.  
**Fix:** Concrete suggestion or code snippet.

If no issues are found in a file, skip it. End with a brief summary table of issue counts by severity.
