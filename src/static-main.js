const STATIC_FORMS_ENDPOINT = "https://api.staticforms.dev/submit";
const STATIC_FORMS_API_KEY = "sf_50db0aafa5bd7dcf584490f5";
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const workflowTabs = [
  { label: "Sequential", title: "Every decision, in the right order.", copy: "Route a request from line manager to finance to the CFO. Each person sees the context they need; nobody can skip the chain.", request: "Regional clinic equipment", amount: "$24,850", nodes: [{ title: "Line manager", meta: "Submitted with documents", event: "Request received and validated" }, { title: "Finance review", meta: "Budget and policy check", event: "Finance controller notified" }, { title: "CFO sign-off", meta: "Final authority", event: "Decision sealed in the audit trail" }] },
  { label: "Conditional", title: "Your policies become the route.", copy: "Send routine purchases straight through while higher-value requests automatically climb the authority ladder.", request: "New branch generator", amount: "$68,400", nodes: [{ title: "Amount check", meta: "Rule: over $50,000", event: "Value threshold matched" }, { title: "Budget owner", meta: "Funds confirmed", event: "Budget owner reviewing evidence" }, { title: "Executive sign-off", meta: "Added automatically", event: "Executive route created and logged" }] },
  { label: "Committee", title: "Quorum without the meeting chase.", copy: "Collect decisions in parallel and close the request as soon as the quorum you define has been reached.", request: "Vendor framework renewal", amount: "3 of 5", nodes: [{ title: "Invite reviewers", meta: "Five secure links sent", event: "Committee review opened" }, { title: "Quorum reached", meta: "Three approvals recorded", event: "Required quorum reached" }, { title: "Decision recorded", meta: "No meeting required", event: "Approved result made immutable" }] },
];

const featureGroups = [
  ["accountability", "Accountability", "Proof that outlives the conversation.", [["Immutable audit trail", "Every approval, rejection, comment, and return is permanently recorded."], ["SLA escalation", "Overdue requests move automatically instead of sitting unread."], ["Append-only records", "Actions can be added, never quietly rewritten or deleted."]]],
  ["speed", "Speed", "A faster yes. A clearer no.", [["Approve from anywhere", "Secure, expiring links work from email, Slack, Teams, Telegram, and WhatsApp."], ["Delegation", "Schedule a trusted fallback before leave or travel."], ["Smart reminders", "Respect quiet hours while keeping pending work visible."]]],
  ["flexibility", "Flexibility", "Built around how authority actually works.", [["No-code forms", "Shape every request around the fields, files, and policies your team needs."], ["Every approval pattern", "Sequential, parallel, quorum, conditional, auto-approve, and delegation."], ["Useful collaboration", "Followers, mentions, comments, and edit history live with the request."]]],
  ["insight", "Insight", "Find friction before it becomes delay.", [["Approval analytics", "Understand cycle time, bottlenecks, activity, and overdue work."], ["Exports for every audience", "Create CSV, Excel, and PDF reports for operations, boards, and auditors."], ["Search in seconds", "Find any request by reference, title, requester, or status."]]],
];

const leadCopy = {
  demo: { eyebrow: "See it in your workflow", title: "Book a tailored demo.", intro: "Tell us a little about your approval process and we’ll prepare a focused walkthrough for your team.", submit: "Request my demo", success: "Your demo request is with us." },
  waitlist: { eyebrow: "SaaS coming soon", title: "Join the SaaS waitlist.", intro: "Be among the first to hear when ApprovalDesk SaaS is ready for your team.", submit: "Join the waitlist", success: "You’re on the SaaS waitlist." },
};

function initialiseMenu() {
  const button = document.querySelector(".menu-button");
  const nav = document.querySelector(".nav-links");
  if (!button || !nav) return;
  button.setAttribute("aria-expanded", "false");
  button.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    button.textContent = open ? "Close" : "Menu";
    button.setAttribute("aria-expanded", String(open));
  });
  nav.addEventListener("click", () => {
    nav.classList.remove("open");
    button.textContent = "Menu";
    button.setAttribute("aria-expanded", "false");
  });
  window.addEventListener("resize", () => {
    nav.classList.remove("open");
    button.textContent = "Menu";
    button.setAttribute("aria-expanded", "false");
  });
}

function initialiseApprovalPreview() {
  const button = document.querySelector(".approve-button");
  const row = document.querySelectorAll(".timeline-row")[1];
  const status = document.querySelector(".approval-top .status");
  if (!button || !row || !status) return;
  let approved = false;
  button.addEventListener("click", () => {
    approved = !approved;
    row.classList.toggle("current", !approved);
    row.classList.toggle("done", approved);
    row.querySelector("small").textContent = approved ? "Approved just now" : "Your decision is due today";
    row.querySelector("em").textContent = approved ? "Done" : "Now";
    status.classList.toggle("approved", approved);
    status.textContent = approved ? "Approved" : "Awaiting decision";
    button.textContent = approved ? "Undo preview" : "Approve request";
  });
}

function initialiseImpactCards() {
  const cards = [...document.querySelectorAll(".impact-card")];
  const toggle = document.querySelector(".impact-playback");
  if (!cards.length || !toggle) return;
  let active = 0;
  let paused = false;
  const select = index => {
    active = index;
    cards.forEach((card, cardIndex) => card.classList.toggle("active", cardIndex === index));
  };
  const updateToggle = () => {
    toggle.setAttribute("aria-label", paused ? "Resume outcome highlights" : "Pause outcome highlights");
    toggle.textContent = paused ? "▶" : "Ⅱ";
  };
  cards.forEach((card, index) => card.addEventListener("mouseenter", () => select(index)));
  toggle.addEventListener("click", () => { paused = !paused; updateToggle(); });
  if (!reducedMotion) window.setInterval(() => { if (!paused) select((active + 1) % cards.length); }, 3000);
}

function initialiseWorkflow() {
  const tabs = [...document.querySelectorAll(".workflow-tabs button")];
  const stage = document.querySelector(".workflow-stage");
  if (!tabs.length || !stage) return;
  const copy = stage.querySelector(".workflow-copy");
  const map = stage.querySelector(".workflow-map");
  const route = map.querySelector(".workflow-route");
  const pauseButton = map.querySelector(".workflow-demo-bar button");
  let selectedTab = 0;
  let selectedStep = 0;
  let paused = false;

  const renderStep = () => {
    const workflow = workflowTabs[selectedTab];
    [...route.querySelectorAll(".map-node")].forEach((node, index) => {
      const state = index < selectedStep ? "done" : index === selectedStep ? "current" : "pending";
      node.className = `map-node ${state}`;
      node.setAttribute("aria-label", `${workflow.nodes[index].title}: ${state}`);
      node.querySelector(".node-number").textContent = state === "done" ? "✓" : String(index + 1).padStart(2, "0");
      node.querySelector("em").textContent = state === "done" ? "Complete" : state === "current" ? "In progress" : "Up next";
    });
    map.querySelector(".workflow-event b").textContent = workflow.nodes[selectedStep].event;
  };

  const renderTab = index => {
    selectedTab = index;
    selectedStep = 0;
    const workflow = workflowTabs[index];
    tabs.forEach((tab, tabIndex) => tab.setAttribute("aria-selected", String(tabIndex === index)));
    copy.querySelector(".micro").textContent = `${workflow.label.toUpperCase()} ROUTING`;
    copy.querySelector("h3").textContent = workflow.title;
    copy.querySelector("p:not(.micro)").textContent = workflow.copy;
    map.querySelector(".workflow-request span").textContent = workflow.request;
    map.querySelector(".workflow-request b").textContent = workflow.amount;
    [...route.querySelectorAll(".map-node")].forEach((node, nodeIndex) => {
      node.querySelector("b").textContent = workflow.nodes[nodeIndex].title;
      node.querySelector("small").textContent = workflow.nodes[nodeIndex].meta;
    });
    renderStep();
  };

  tabs.forEach((tab, index) => tab.addEventListener("click", () => renderTab(index)));
  route.addEventListener("click", event => {
    const node = event.target.closest(".map-node");
    if (!node) return;
    selectedStep = [...route.children].indexOf(node);
    renderStep();
  });
  pauseButton.addEventListener("click", () => {
    paused = !paused;
    pauseButton.setAttribute("aria-label", paused ? "Play approval workflow" : "Pause approval workflow");
    pauseButton.innerHTML = `<span aria-hidden="true">${paused ? "▶" : "Ⅱ"}</span><span>${paused ? "Play" : "Pause"}</span>`;
  });
  if (!reducedMotion) window.setInterval(() => {
    if (paused) return;
    selectedStep = (selectedStep + 1) % workflowTabs[selectedTab].nodes.length;
    renderStep();
  }, 2200);
}

function initialiseFeatures() {
  const tabs = [...document.querySelectorAll(".feature-tabs button")];
  const layout = document.querySelector(".feature-tab-layout");
  const panel = layout?.querySelector(".feature-groups");
  if (!tabs.length || !layout || !panel) return;
  let selected = 0;
  let paused = false;

  const render = index => {
    selected = index;
    const group = featureGroups[index];
    tabs.forEach((tab, tabIndex) => {
      const active = tabIndex === index;
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    layout.querySelectorAll(".feature-progress").forEach((progress, progressIndex) => progress.classList.toggle("active", progressIndex === index));
    panel.id = `feature-panel-${group[0]}`;
    panel.setAttribute("aria-labelledby", `feature-tab-${group[0]}`);
    panel.innerHTML = `<article class="feature-group"><div class="feature-group-top"><p class="micro">${group[1].toUpperCase()}</p><span>${paused ? "PAUSED ON HOVER" : "AUTO-CYCLING"}</span></div><h3>${group[2]}</h3>${group[3].map((item, itemIndex) => `<div class="feature-row"><span class="feature-row-index">0${itemIndex + 1}</span><b>${item[0]}</b><p>${item[1]}</p></div>`).join("")}</article>`;
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => render(index));
    tab.addEventListener("keydown", event => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : (index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
      render(next);
      tabs[next].focus();
    });
  });
  const setPaused = value => { paused = value; render(selected); };
  layout.addEventListener("mouseenter", () => setPaused(true));
  layout.addEventListener("mouseleave", () => setPaused(false));
  layout.addEventListener("focusin", () => setPaused(true));
  layout.addEventListener("focusout", event => { if (!layout.contains(event.relatedTarget)) setPaused(false); });
  const selectFromHash = () => {
    const index = featureGroups.findIndex(group => group[0] === window.location.hash.slice(1));
    if (index >= 0) render(index);
  };
  window.addEventListener("hashchange", selectFromHash);
  selectFromHash();
  if (!reducedMotion) window.setInterval(() => { if (!paused) render((selected + 1) % featureGroups.length); }, 5000);
}

function initialiseFaqs() {
  document.querySelectorAll(".faq-list article").forEach((article, index) => {
    const button = article.querySelector("button");
    const answer = article.querySelector("div");
    const id = `faq-answer-${index + 1}`;
    answer.id = id;
    button.setAttribute("aria-controls", id);
    button.setAttribute("aria-expanded", String(article.classList.contains("open")));
    button.addEventListener("click", () => {
      const open = !article.classList.contains("open");
      article.classList.toggle("open", open);
      button.setAttribute("aria-expanded", String(open));
      button.querySelector("em").textContent = open ? "Hide" : "Answer";
    });
  });
}

function leadModalMarkup(mode) {
  const details = leadCopy[mode];
  return `<div class="lead-modal-backdrop" role="presentation"><section class="lead-modal" role="dialog" aria-modal="true" aria-labelledby="lead-modal-title"><button class="lead-modal-close" type="button" aria-label="Close form">×</button><div class="lead-modal-content"><p class="lead-modal-eyebrow">${details.eyebrow}</p><h2 id="lead-modal-title">${details.title}</h2><p class="lead-modal-intro">${details.intro}</p><form class="lead-form"><input class="lead-honeypot" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true" /><div class="lead-form-grid"><label><span>Full name</span><input name="name" autocomplete="name" required placeholder="Your name" /></label><label><span>Work email</span><input name="email" type="email" autocomplete="email" required placeholder="you@company.com" /></label><label><span>Organisation</span><input name="company" autocomplete="organization" required placeholder="Company or organisation" /></label><label><span>Your role</span><input name="role" autocomplete="organization-title" required placeholder="e.g. Operations Director" /></label><label><span>Phone number</span><input name="phone" type="tel" autocomplete="tel" inputmode="tel" pattern="^\\+[1-9]\\d{7,14}$" title="Use international format, for example +2348012345678" required placeholder="+2348012345678" /></label><label><span>Team size</span><select name="team_size" required><option value="" selected disabled>Select a range</option><option>1–20 people</option><option>21–100 people</option><option>101–500 people</option><option>500+ people</option></select></label></div><label class="lead-form-full"><span>What would you like to improve? <i>Optional</i></span><textarea name="workflow_context" rows="3" placeholder="For example: purchase approvals, committee decisions, or audit reporting."></textarea></label><p class="lead-form-error" role="alert" hidden>We couldn’t send your request. Please check your connection and try again.</p><button class="lead-form-submit"><span>${details.submit}</span><span>↗</span></button><p class="lead-form-note">Your details are sent securely to the ApprovalDesk team. Use an international phone format beginning with +.</p></form></div></section></div>`;
}

function openLeadModal(mode) {
  document.querySelector(".lead-modal-backdrop")?.remove();
  document.body.insertAdjacentHTML("beforeend", leadModalMarkup(mode));
  const backdrop = document.querySelector(".lead-modal-backdrop");
  const modal = backdrop.querySelector(".lead-modal");
  const closeButton = backdrop.querySelector(".lead-modal-close");
  const form = backdrop.querySelector("form");
  const details = leadCopy[mode];
  const close = () => {
    document.removeEventListener("keydown", onKeydown);
    backdrop.remove();
  };
  const onKeydown = event => { if (event.key === "Escape" && !form.dataset.sending) close(); };
  closeButton.addEventListener("click", close);
  backdrop.addEventListener("mousedown", event => { if (event.target === backdrop && !form.dataset.sending) close(); });
  document.addEventListener("keydown", onKeydown);
  modal.querySelector("input[name=name]").focus();

  form.addEventListener("submit", async event => {
    event.preventDefault();
    const data = new FormData(form);
    if (data.get("website")) return;
    const submit = form.querySelector(".lead-form-submit");
    const error = form.querySelector(".lead-form-error");
    form.dataset.sending = "true";
    submit.disabled = true;
    submit.firstElementChild.textContent = "Sending…";
    error.hidden = true;
    data.set("apiKey", STATIC_FORMS_API_KEY);
    data.set("subject", mode === "demo" ? "ApprovalDesk demo request" : "ApprovalDesk SaaS waitlist request");
    data.set("message", `Interest: ${mode === "demo" ? "Managed demo" : "SaaS waitlist"}\nOrganisation: ${data.get("company")}\nRole: ${data.get("role")}\nTeam size: ${data.get("team_size")}\nPhone: ${data.get("phone")}\nWorkflow context: ${data.get("workflow_context") || "Not provided"}`);
    try {
      const response = await fetch(STATIC_FORMS_ENDPOINT, { method: "POST", body: data });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) throw new Error("Submission failed");
      backdrop.querySelector(".lead-modal-content").innerHTML = `<div class="lead-success"><p class="micro">THANK YOU</p><h2>${details.success}</h2><p>We’ll be in touch using the details you shared.</p><button type="button">Close</button></div>`;
      backdrop.querySelector(".lead-success button").addEventListener("click", close);
    } catch {
      delete form.dataset.sending;
      submit.disabled = false;
      submit.firstElementChild.textContent = details.submit;
      error.hidden = false;
    }
  });
}

function initialiseLeadLinks() {
  document.querySelectorAll('a[href="#demo"], .demo-invite button').forEach(trigger => {
    trigger.addEventListener("click", event => {
      event.preventDefault();
      const mode = trigger.textContent.toLowerCase().includes("waitlist") ? "waitlist" : "demo";
      document.querySelector(".nav-links")?.classList.remove("open");
      openLeadModal(mode);
    });
  });
}

initialiseMenu();
initialiseApprovalPreview();
initialiseImpactCards();
initialiseWorkflow();
initialiseFeatures();
initialiseFaqs();
initialiseLeadLinks();
