import { createServer } from "node:http";
import { joinSession, createCanvas, CanvasError } from "@github/copilot-sdk/extension";

const servers = new Map();
const issues = [
    { number: 1, title: "Restore authenticated sessions after token refresh", description: "Full-page navigation can lose the authenticated user after a successful token refresh.", why: "Authentication blocks every protected workflow and is the highest-impact regression.", lane: "Now" },
    { number: 2, title: "Add filters to the tickets view", description: "Users need to narrow incidents by status, priority, and project.", why: "Filtering reduces triage time as the ticket list grows.", lane: "Now" },
    { number: 3, title: "Add empty states for projects and deployments", description: "First-time users need clear guidance when no data is connected yet.", why: "A useful empty state prevents a blank dashboard from looking broken.", lane: "Now" },
    { number: 4, title: "Document provider credential rotation", description: "Explain how administrators can rotate masked provider credentials safely.", why: "This improves operational handoff but is less urgent than active product defects.", lane: "Later" },
    { number: 5, title: "Add audit-log pagination", description: "Keep the admin audit view responsive when the event history becomes large.", why: "Important for scale, but current datasets remain small.", lane: "Later" },
];

const escapeHtml = (value) => value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
const renderCard = (issue) => `<article class="card">
  <div class="card-top"><span>#${issue.number}</span><span class="lane">${issue.lane}</span></div>
  <h3>${escapeHtml(issue.title)}</h3><p>${escapeHtml(issue.description)}</p>
  <p class="why"><strong>Why here:</strong> ${escapeHtml(issue.why)}</p>
  <button data-issue="${issue.number}" type="button">Add to current context</button>
</article>`;

function renderHtml() {
    const now = issues.filter((issue) => issue.lane === "Now");
    const later = issues.filter((issue) => issue.lane === "Later");
    return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Issue triage board</title><style>
:root{color-scheme:light dark}body{margin:0;padding:24px;background:var(--background-color-default,#fff);color:var(--text-color-default,#1f2328);font:14px/1.5 var(--font-sans,system-ui,sans-serif)}main{max-width:1100px;margin:auto}h1{margin:0;font-size:26px}.intro,.why{color:var(--text-color-muted,#656d76)}h2{margin:28px 0 12px;font-size:16px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px}.card{border:1px solid var(--border-color-default,#d0d7de);border-radius:8px;padding:16px}.card-top{display:flex;justify-content:space-between;color:var(--text-color-muted,#656d76);font:12px var(--font-mono,monospace)}.lane{color:var(--true-color-blue,#0969da)}h3{font-size:16px;margin:10px 0 6px}p{margin:6px 0}.why{font-size:13px}button{margin-top:12px;padding:7px 10px;border:1px solid var(--border-color-default,#d0d7de);border-radius:6px;background:transparent;color:inherit;cursor:pointer}button:hover,button:focus-visible{border-color:var(--true-color-blue,#0969da)}button:focus-visible{outline:2px solid var(--color-focus-outline,#0969da);outline-offset:2px}#status{min-height:24px;color:var(--text-color-muted,#656d76)}
</style></head><body><main><h1>Issue triage board</h1><p class="intro">Prioritize the work most likely to need attention right now.</p><p id="status" aria-live="polite"></p>
<h2>Needs attention now</h2><section class="grid" aria-label="Issues needing attention now">${now.map(renderCard).join("")}</section>
<h2>Later</h2><section class="grid" aria-label="Issues to handle later">${later.map(renderCard).join("")}</section></main>
<script>const status=document.querySelector("#status");document.querySelectorAll("[data-issue]").forEach((button)=>button.addEventListener("click",async()=>{button.disabled=true;const issue=button.dataset.issue;try{const response=await fetch("/api/add-to-context",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({issue})});if(!response.ok)throw new Error();status.textContent="Issue #"+issue+" added to the current session context."}catch{status.textContent="Unable to add the issue to context. Try again.";button.disabled=false}}));</script>
</body></html>`;
}

async function startServer(instanceId) {
    const server = createServer((req, res) => {
        if (req.method === "POST" && req.url === "/api/add-to-context") {
            let body = "";
            req.on("data", (chunk) => { body += chunk; });
            req.on("end", () => {
                let selected;
                try { selected = issues.find((issue) => issue.number === Number(JSON.parse(body).issue)); } catch {}
                if (!selected) {
                    res.writeHead(400, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ error: "Unknown issue" }));
                    return;
                }
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ issue: selected }));
            });
            return;
        }
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.end(renderHtml(instanceId));
    });
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    const address = server.address();
    return { server, url: `http://127.0.0.1:${typeof address === "object" && address ? address.port : 0}/` };
}

await joinSession({
    canvases: [createCanvas({
        id: "issue-triage-board",
        displayName: "Issue triage board",
        description: "A Kanban board for prioritizing repository issues and adding one to the current context.",
        actions: [{
            name: "add_to_context",
            description: "Add a selected issue to the current session context.",
            inputSchema: { type: "object", properties: { issueNumber: { type: "integer", minimum: 1 } }, required: ["issueNumber"] },
            handler: async (ctx) => {
                const issue = issues.find((item) => item.number === ctx.input.issueNumber);
                if (!issue) throw new CanvasError("unknown_issue", "The requested issue does not exist.");
                return { ok: true, issue };
            },
        }],
        open: async (ctx) => {
            let entry = servers.get(ctx.instanceId);
            if (!entry) { entry = await startServer(ctx.instanceId); servers.set(ctx.instanceId, entry); }
            return { title: "Issue triage board", url: entry.url };
        },
        onClose: async (ctx) => {
            const entry = servers.get(ctx.instanceId);
            if (entry) { servers.delete(ctx.instanceId); await new Promise((resolve) => entry.server.close(resolve)); }
        },
    })],
});
