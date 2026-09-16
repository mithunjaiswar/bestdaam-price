"use client";

import { useState } from "react";

export default function AmazonAffiliateLinkBuilder() {
  const [source, setSource] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function createLink(event) {
    event.preventDefault();
    setError("");
    setResult("");
    setCopied(false);
    setLoading(true);

    try {
      const response = await fetch("/api/amazon-affiliate-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: source }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not create the link.");
      setResult(data.url);
    } catch (requestError) {
      setError(requestError.message || "Could not create the link.");
    } finally {
      setLoading(false);
    }
  }

  async function copyLink() {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <section className="affiliate-builder" aria-label="Amazon affiliate link builder">
      <form onSubmit={createLink}>
        <label htmlFor="amazon-source-link">Amazon India product or share link</label>
        <div className="affiliate-builder-input">
          <input
            id="amazon-source-link"
            type="url"
            value={source}
            onChange={(event) => setSource(event.target.value)}
            placeholder="https://amzn.in/d/... or amazon.in/dp/..."
            required
          />
          <button className="buy-btn" type="submit" disabled={loading}>
            {loading ? "Creating…" : "Create affiliate link"}
          </button>
        </div>
      </form>
      {error && <p className="affiliate-builder-error" role="alert">{error}</p>}
      {result && (
        <div className="affiliate-builder-result">
          <p>Your link is ready with tracking tag <strong>bestdaam0a-21</strong>.</p>
          <input aria-label="Generated affiliate link" readOnly value={result} />
          <div>
            <button className="share-btn copy" type="button" onClick={copyLink}>
              {copied ? "Copied ✓" : "Copy link"}
            </button>
            <a href={result} className="text-link" target="_blank" rel="nofollow sponsored noopener">
              Open Amazon ↗
            </a>
          </div>
        </div>
      )}
    </section>
  );
}
