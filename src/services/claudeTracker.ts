import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import * as readline from "readline";
import { EXP_VALUES } from "../data/expTable.js";

const CLAUDE_DIR = path.join(os.homedir(), ".claude");
const HISTORY_FILE = path.join(CLAUDE_DIR, "history.jsonl");

interface ScanResult {
  totalConversations: number;
  totalToolUses: number;
  totalMessages: number;
  expGained: number;
  newOffset: number;
}

export async function scanClaudeActivity(
  fromOffset: number = 0
): Promise<ScanResult> {
  const result: ScanResult = {
    totalConversations: 0,
    totalToolUses: 0,
    totalMessages: 0,
    expGained: 0,
    newOffset: fromOffset,
  };

  // Scan history.jsonl for conversations
  try {
    if (fs.existsSync(HISTORY_FILE)) {
      const stat = fs.statSync(HISTORY_FILE);
      if (stat.size > fromOffset) {
        const content = await readFileFromOffset(HISTORY_FILE, fromOffset);
        const lines = content.split("\n").filter((l) => l.trim());

        for (const line of lines) {
          try {
            const entry = JSON.parse(line);
            if (entry) {
              result.totalConversations++;
              result.expGained += EXP_VALUES.CONVERSATION;
            }
          } catch {
            // skip malformed lines
          }
        }

        result.newOffset = stat.size;
      }
    }
  } catch {
    // history file might not exist yet
  }

  // Scan project session files for messages and tool uses
  const projectsDir = path.join(CLAUDE_DIR, "projects");
  try {
    if (fs.existsSync(projectsDir)) {
      const projects = fs.readdirSync(projectsDir);
      for (const project of projects) {
        const projectPath = path.join(projectsDir, project);
        const stat = fs.statSync(projectPath);
        if (!stat.isDirectory()) continue;

        const files = fs.readdirSync(projectPath);
        for (const file of files) {
          if (!file.endsWith(".jsonl")) continue;
          const filePath = path.join(projectPath, file);

          try {
            const sessions = await countSessionActivity(filePath);
            result.totalMessages += sessions.messages;
            result.totalToolUses += sessions.toolUses;
            result.expGained +=
              sessions.messages * EXP_VALUES.USER_MESSAGE +
              sessions.toolUses * EXP_VALUES.TOOL_USE;
          } catch {
            // skip unreadable files
          }
        }
      }
    }
  } catch {
    // projects dir might not exist
  }

  return result;
}

async function readFileFromOffset(
  filePath: string,
  offset: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const stream = fs.createReadStream(filePath, { start: offset });
    stream.on("data", (chunk: Buffer) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
    stream.on("error", reject);
  });
}

async function countSessionActivity(
  filePath: string
): Promise<{ messages: number; toolUses: number }> {
  let messages = 0;
  let toolUses = 0;

  return new Promise((resolve) => {
    try {
      const stream = fs.createReadStream(filePath, { encoding: "utf-8" });
      const rl = readline.createInterface({ input: stream });
      let lineCount = 0;

      rl.on("line", (line) => {
        lineCount++;
        // Only sample every 10th line for large files to avoid perf issues
        if (lineCount > 1000) {
          rl.close();
          return;
        }

        try {
          const entry = JSON.parse(line);
          if (entry.type === "user") {
            messages++;
          } else if (entry.type === "assistant") {
            const content = entry.message?.content;
            if (Array.isArray(content)) {
              for (const block of content) {
                if (block.type === "tool_use") {
                  toolUses++;
                }
              }
            }
          }
        } catch {
          // skip
        }
      });

      rl.on("close", () => resolve({ messages, toolUses }));
      rl.on("error", () => resolve({ messages, toolUses }));
    } catch {
      resolve({ messages, toolUses });
    }
  });
}

// Quick incremental scan - just checks history.jsonl for new entries
export async function quickScan(
  lastOffset: number
): Promise<{ conversations: number; expGained: number; newOffset: number }> {
  let conversations = 0;
  let expGained = 0;
  let newOffset = lastOffset;

  try {
    if (fs.existsSync(HISTORY_FILE)) {
      const stat = fs.statSync(HISTORY_FILE);
      if (stat.size > lastOffset) {
        const content = await readFileFromOffset(HISTORY_FILE, lastOffset);
        const lines = content.split("\n").filter((l) => l.trim());

        for (const line of lines) {
          try {
            JSON.parse(line);
            conversations++;
            expGained += EXP_VALUES.CONVERSATION;
          } catch {
            // skip
          }
        }

        newOffset = stat.size;
      }
    }
  } catch {
    // ignore
  }

  return { conversations, expGained, newOffset };
}

export function watchHistory(
  callback: (expGained: number) => void
): (() => void) | null {
  try {
    if (!fs.existsSync(HISTORY_FILE)) return null;

    let lastSize = fs.statSync(HISTORY_FILE).size;
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    const watcher = fs.watch(HISTORY_FILE, () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(async () => {
        try {
          const stat = fs.statSync(HISTORY_FILE);
          if (stat.size > lastSize) {
            const content = await readFileFromOffset(HISTORY_FILE, lastSize);
            const lines = content.split("\n").filter((l) => l.trim());
            let exp = 0;
            for (const line of lines) {
              try {
                JSON.parse(line);
                exp += EXP_VALUES.CONVERSATION;
              } catch {
                // skip
              }
            }
            lastSize = stat.size;
            if (exp > 0) callback(exp);
          }
        } catch {
          // ignore
        }
      }, 500);
    });

    return () => watcher.close();
  } catch {
    return null;
  }
}
