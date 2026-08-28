import { useEffect, useState } from "react";

const STATIC_FORMS_ENDPOINT = "https://api.staticforms.dev/submit";
const STATIC_FORMS_API_KEY = "sf_50db0aafa5bd7dcf584490f5";

const copy = {
  demo: {
    eyebrow: "See it in your workflow",
    title: "Book a tailored demo.",
    intro: "Tell us a little about your approval process and we’ll prepare a focused walkthrough for your team.",
    submit: "Request my demo",
    success: "Your demo request is with us.",
  },
  waitlist: {
    eyebrow: "SaaS coming soon",
    title: "Join the SaaS waitlist.",
    intro: "Be among the first to hear when ApprovalDesk SaaS is ready for your team.",
    submit: "Join the waitlist",
    success: "You’re on the SaaS waitlist.",
  },
};

export function LeadModal({ mode, onClose }) {
  const [status, setStatus] = useState("idle");
  const details = copy[mode];

  useEffect(() => {
    const closeOnEscape = event => { if (event.key === "Escape" && status !== "sending") onClose(); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose, status]);

  const submit = async event => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    if (data.get("website")) return;
    setStatus("sending");
    data.set("apiKey", STATIC_FORMS_API_KEY);
    data.set("subject", mode === "demo" ? "ApprovalDesk demo request" : "ApprovalDesk SaaS waitlist request");
    data.set("message", `Interest: ${mode === "demo" ? "Managed demo" : "SaaS waitlist"}\nOrganisation: ${data.get("company")}\nRole: ${data.get("role")}\nTeam size: ${data.get("team_size")}\nPhone: ${data.get("phone")}\nWorkflow context: ${data.get("workflow_context") || "Not provided"}`);

    try {
      const response = await fetch(STATIC_FORMS_ENDPOINT, { method: "POST", body: data });
      const result = await response.json().catch(() => null);
      setStatus(response.ok && result?.success ? "success" : "error");
    } catch {
      setStatus("error");
    }
  };

  return <div className="lead-modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget && status !== "sending") onClose(); }}>
    <section className="lead-modal" role="dialog" aria-modal="true" aria-labelledby="lead-modal-title">
      <button className="lead-modal-close" type="button" onClick={onClose} disabled={status === "sending"} aria-label="Close form">×</button>
      {status === "success" ? <div className="lead-success"><p className="micro">THANK YOU</p><h2>{details.success}</h2><p>We’ll be in touch using the details you shared.</p><button type="button" onClick={onClose}>Close</button></div> : <>
        <p className="lead-modal-eyebrow">{details.eyebrow}</p>
        <h2 id="lead-modal-title">{details.title}</h2>
        <p className="lead-modal-intro">{details.intro}</p>
        <form className="lead-form" onSubmit={submit}>
          <input className="lead-honeypot" type="text" name="website" tabIndex="-1" autoComplete="off" aria-hidden="true" />
          <div className="lead-form-grid">
            <label><span>Full name</span><input name="name" autoComplete="name" required placeholder="Your name" /></label>
            <label><span>Work email</span><input name="email" type="email" autoComplete="email" required placeholder="you@company.com" /></label>
            <label><span>Organisation</span><input name="company" autoComplete="organization" required placeholder="Company or organisation" /></label>
            <label><span>Your role</span><input name="role" autoComplete="organization-title" required placeholder="e.g. Operations Director" /></label>
            <label><span>Phone number</span><input name="phone" type="tel" autoComplete="tel" inputMode="tel" pattern="^\\+[1-9]\\d{7,14}$" title="Use international format, for example +2348012345678" required placeholder="+2348012345678" /></label>
            <label><span>Team size</span><select name="team_size" required defaultValue=""><option value="" disabled>Select a range</option><option>1–20 people</option><option>21–100 people</option><option>101–500 people</option><option>500+ people</option></select></label>
          </div>
          <label className="lead-form-full"><span>What would you like to improve? <i>Optional</i></span><textarea name="workflow_context" rows="3" placeholder="For example: purchase approvals, committee decisions, or audit reporting." /></label>
          {status === "error" && <p className="lead-form-error" role="alert">We couldn’t send your request. Please check your connection and try again.</p>}
          <button className="lead-form-submit" disabled={status === "sending"}>{status === "sending" ? "Sending…" : details.submit}<span>↗</span></button>
          <p className="lead-form-note">Your details are sent securely to the ApprovalDesk team. Use an international phone format beginning with +.</p>
        </form>
      </>}
    </section>
  </div>;
}
