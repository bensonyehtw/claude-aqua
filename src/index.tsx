#!/usr/bin/env node
import React from "react";
import { render } from "ink";
import { App } from "./App.js";

// Hide cursor + clear screen
process.stdout.write("\x1b[?25l\x1b[2J\x1b[H");

const splash = `
  ╔══════════════════════════════════════════╗
  ║                                          ║
  ║        C L A U D E   A Q U A             ║
  ║                                          ║
  ║    Your Claude Code Activity Aquarium    ║
  ║                                          ║
  ║    Fish grow as you use Claude Code!     ║
  ║                                          ║
  ╚══════════════════════════════════════════╝
`;

process.stdout.write("\x1b[96m" + splash + "\x1b[0m");

setTimeout(() => {
  process.stdout.write("\x1b[2J\x1b[H");

  // Write title on row 1
  process.stdout.write(
    "\x1b[1;1H\x1b[96m\x1b[1m          Claude Aquarium\x1b[0m"
  );

  const { unmount } = render(React.createElement(App), {
    exitOnCtrlC: true,
  });

  const cleanup = () => {
    process.stdout.write("\x1b[?25h\x1b[2J\x1b[H");
    unmount();
  };

  process.on("SIGINT", () => {
    cleanup();
    process.exit(0);
  });

  process.on("exit", () => {
    process.stdout.write("\x1b[?25h");
  });
}, 1500);
