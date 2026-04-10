# Demo Project: TaskFlow — Governed Todo App

**Purpose:** Demonstrate Mault's full multi-agent workflow from concept to working app in 4 phases.
**Stack:** HTML + vanilla JavaScript + localStorage. Zero dependencies. Zero build step.
**Target:** Each phase completes in 3-5 minutes with agents. Total demo: 15-20 minutes.

---

## Initial Scaffolding Prompt

Give this to Claude Code to set up the project in under 1 minute:

create a minimal project scaffold for a todo app called TaskFlow:
1. Create this structure:
   taskflow/
     src/
       index.html       (empty shell: DOCTYPE, head with title "TaskFlow", empty body with <div id="app"></div>, script tag pointing to app.js)
       app.js           (single line: console.log('TaskFlow loaded'))
       styles.css       (empty file)
     tests/
       (empty directory)
     .gitignore         (node_modules, .DS_Store)
     package.json       (name: taskflow, version: 0.1.0, scripts: { "test": "node tests/run.js" })
     README.md          (one line: "# TaskFlow")

2. Do NOT install any npm packages.
3. Do NOT add any frameworks.
4. Do NOT initialize git (that comes later).
5. This must open in a browser with just: open src/index.html