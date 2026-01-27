# b0b Autonomous Mode

## Overview

This system enables Claude to work autonomously while you sleep. It uses:
- Visual debugging (screenshots) for feedback
- Puppeteer for interaction
- Task queues for work definition
- Decision logic for iteration

## How It Works

1. **You define tasks** before bed (or Claude suggests them)
2. **Toggle autonomous mode ON**
3. **Daemon runs** - executing, verifying, iterating
4. **Morning report** summarizes all work done

## Quick Start

```bash
# Start autonomous mode
node autonomous.js --tasks tasks.yaml --report morning-report.md

# Or via VS Code command palette:
# "b0b: Enable Autonomous Mode"
```

## Task Definition (tasks.yaml)

```yaml
project: 0type
goal: "Fix stroke preset rendering so each preset produces visually different output"

tasks:
  - id: verify-baseline
    type: capture
    url: http://localhost:3001
    name: baseline
    
  - id: test-presets
    type: interaction
    script:
      - action: click
        selector: "button:contains('raw-gesture')"
      - action: wait
        ms: 500
      - action: screenshot
        name: preset-raw-gesture
      - action: click  
        selector: "button:contains('swiss-mono')"
      - action: screenshot
        name: preset-swiss-mono
        
  - id: compare-presets
    type: compare
    before: screenshots/preset-raw-gesture.png
    after: screenshots/preset-swiss-mono.png
    expect: different  # Fail if identical
    
  - id: fix-if-same
    type: code-fix
    condition: "compare-presets.result == 'identical'"
    target: src/lib/perfect-renderer.ts
    goal: "Ensure preset options are passed to getStroke()"
    
  - id: verify-fix
    type: repeat
    tasks: [test-presets, compare-presets]
    until: "compare-presets.result == 'different'"
    max_attempts: 5

decisions:
  on_failure:
    - log_reason
    - try_alternative
    - if_stuck: pause_and_flag
    
  on_success:
    - screenshot_proof
    - next_task
```

## Decision Logic

The daemon makes decisions based on:

1. **Visual verification** - Did the screenshot change?
2. **Pixel analysis** - Are metrics in expected range?
3. **Error detection** - Any console errors?
4. **Iteration limits** - Don't loop forever

## Safety Constraints

- Maximum iterations per task: 5
- Maximum total runtime: 8 hours
- Pause on: critical errors, unexpected states
- Never modify: .env files, credentials, git config
- Always: commit work, log decisions, screenshot proof

## Morning Report Format

```markdown
# b0b Overnight Report - [Date]

## Summary
- Tasks attempted: 15
- Tasks completed: 12
- Tasks failed: 2
- Tasks skipped: 1

## Completed Work
### Task: fix-stroke-rendering
- Started: 11:30 PM
- Completed: 12:45 AM
- Iterations: 3
- Screenshot: [link]
- Changes made: Modified perfect-renderer.ts line 45-67

## Needs Review
### Task: optimize-canvas-performance  
- Issue: Multiple approaches tried, none met 60fps target
- Best result: 45fps (screenshot attached)
- Suggested next steps: Consider WebGL renderer

## Questions for You
1. Should I prioritize mobile viewport testing?
2. The ink-brush preset looks different but may not match intent - review?

## Full Log
[Expandable detailed log of all actions]
```

## VS Code Integration

Commands:
- `b0b: Enable Autonomous Mode` - Start the daemon
- `b0b: Disable Autonomous Mode` - Stop gracefully
- `b0b: View Task Queue` - See pending tasks
- `b0b: View Morning Report` - Open latest report
- `b0b: Add Task` - Quick-add a task to queue

Status Bar:
- 🌙 Shows when autonomous mode is active
- Click to see progress/pause

## Architecture

```
b0b-autonomous/
├── autonomous.js     # Main daemon
├── task-runner.js    # Execute individual tasks
├── decision-engine.js # What to do on success/failure
├── reporter.js       # Generate morning reports
├── tasks/            # Task queue files
│   └── current.yaml
├── reports/          # Generated reports
└── logs/             # Detailed execution logs
```
