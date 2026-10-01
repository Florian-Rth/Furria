#!/usr/bin/env python3
"""PreToolUse(Bash): refuses commits and PRs that mention Claude.

CLAUDE.md: "Never mention / Co-Author Claude Code in commits."
"""

import json
import re
import subprocess
import sys
from pathlib import Path

ATTRIBUTION = re.compile(
    r"co-authored-by:.*(claude|anthropic)"
    r"|generated with \[?claude"
    r"|claude\.(com|ai)/(claude-)?code"
    r"|noreply@anthropic\.com",
    re.IGNORECASE,
)
COMMIT = re.compile(r"\bgit\b.*\bcommit\b", re.DOTALL)
PULL_REQUEST = re.compile(r"\bgh\s+pr\s+(create|edit)\b")
MESSAGE_FILE = re.compile(r"(?:-F|--file|--body-file)[= ]+[\"']?([^\s\"';&|]+)")


def head_message() -> str:
    result = subprocess.run(["git", "log", "-1", "--format=%B"], capture_output=True, text=True)
    return result.stdout


def file_messages(command: str) -> list[str]:
    paths = (Path(match) for match in MESSAGE_FILE.findall(command) if match != "-")
    return [path.read_text(errors="ignore") for path in paths if path.is_file()]


def outgoing_text(command: str) -> str:
    parts = [command, *file_messages(command)]
    if COMMIT.search(command) and "--no-edit" in command:
        parts.append(head_message())
    return "\n".join(parts)


def main() -> None:
    command = json.load(sys.stdin).get("tool_input", {}).get("command", "")
    if not (COMMIT.search(command) or PULL_REQUEST.search(command)):
        return
    if not ATTRIBUTION.search(outgoing_text(command)):
        return
    json.dump(
        {
            "hookSpecificOutput": {
                "hookEventName": "PreToolUse",
                "permissionDecision": "deny",
                "permissionDecisionReason": (
                    "The commit or PR mentions Claude. CLAUDE.md forbids any Claude attribution — "
                    "remove the Co-Authored-By / Generated-with lines and retry."
                ),
            }
        },
        sys.stdout,
    )


if __name__ == "__main__":
    main()
