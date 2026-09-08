import React, { useState, useEffect, useCallback } from "react";
import { Star, Send, CheckCircle2, Loader2, MessageSquare, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FeedbackWidgetProps {
  projectId?: string;
  variant?: "footer" | "floating" | "compact" | "header";
  className?: string;
}

const FEEDBACK_ENDPOINT = "https://visar-backend.onrender.com/api/v1/feedback";
const DEFAULT_PROJECT_ID = "orbit-span";

export function FeedbackWidget({
  projectId = DEFAULT_PROJECT_ID,
  variant = "footer",
  className = "",
}: FeedbackWidgetProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isOpenFloating, setIsOpenFloating] = useState<boolean>(false);

  const storageKey = `feedback_submitted_${projectId}`;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved === "true") {
        setIsSubmitted(true);
      }
    } catch {
      // localStorage may be unavailable in private browsing or disabled
    }
  }, [storageKey]);

  const handleStarClick = (value: number) => {
    setRating(value);
  };

  const handleReset = () => {
    setRating(0);
    setHoverRating(0);
    setComment("");
    setName("");
    setEmail("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 || isSubmitting) return;

    setIsSubmitting(true);

    const payload = {
      projectId,
      rating,
      feedback: comment.trim(),
      name: name.trim(),
      email: email.trim(),
      path: typeof window !== "undefined" ? window.location.pathname : "/",
    };

    try {
      const response = await fetch(FEEDBACK_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        console.warn("[FeedbackTelemetry] HTTP non-200 response:", response.status);
      }

      // Mark as submitted
      setIsSubmitted(true);
      try {
        localStorage.setItem(storageKey, "true");
      } catch {
        // Ignore localStorage write error
      }
    } catch (err) {
      console.error("[FeedbackTelemetry] Silent network catch:", err);
      // Graceful local settlement even on network drop
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeRating = hoverRating || rating;

  // Render Settled "Thank You" State
  if (isSubmitted) {
    return (
      <div
        className={`rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs text-muted-foreground backdrop-blur-md transition-all ${className}`}
      >
        <div className="flex items-center gap-2.5 text-foreground font-medium">
          <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
          <span>Thanks for your feedback!</span>
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">
          Your thoughts help shape the future of OrbitSpan and planetary exploration.
        </p>
        <button
          type="button"
          onClick={() => {
            setIsSubmitted(false);
            handleReset();
          }}
          className="mt-2 text-[10px] text-primary/80 hover:text-primary underline cursor-pointer"
        >
          Submit another response
        </button>
      </div>
    );
  }

  // Header Nav Variant
  if (variant === "header") {
    return (
      <div className={`relative ${className}`}>
        {!isOpenFloating ? (
          <button
            type="button"
            onClick={() => setIsOpenFloating(true)}
            className="flex cursor-pointer items-center gap-1.5 rounded-full border border-border/60 bg-secondary/30 px-2.5 py-1 text-xs font-medium text-foreground transition-all hover:bg-secondary/60 hover:text-amber-400 hover:border-border"
            title="Rate OrbitSpan / Share Feedback"
          >
            <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
            <span className="hidden sm:inline">Rate</span>
          </button>
        ) : (
          <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-border/70 bg-[#070b16]/98 p-4 shadow-2xl backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-200 z-50">
            <div className="flex items-center justify-between pb-2 border-b border-border/50">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" /> Rate OrbitSpan
              </span>
              <button
                type="button"
                onClick={() => setIsOpenFloating(false)}
                className="text-muted-foreground hover:text-foreground rounded p-1 cursor-pointer"
                aria-label="Close feedback modal"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-3 space-y-3">
              {/* Interactive Stars */}
              <div className="flex items-center justify-center gap-1.5 py-1">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleStarClick(val)}
                    onMouseEnter={() => setHoverRating(val)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 text-muted-foreground/40 hover:scale-115 transition-transform cursor-pointer"
                    aria-label={`Rate ${val} stars`}
                  >
                    <Star
                      className={`h-5 w-5 transition-colors duration-150 ${
                        val <= activeRating
                          ? "text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                          : "text-muted-foreground/30 hover:text-muted-foreground/60"
                      }`}
                    />
                  </button>
                ))}
              </div>

              {rating > 0 && (
                <div className="space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
                  <textarea
                    rows={2}
                    maxLength={500}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Optional thoughts, bugs, or ideas..."
                    className="w-full rounded-lg border border-border/60 bg-secondary/30 px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/40 resize-none"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      maxLength={100}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Name (optional)"
                      className="rounded-md border border-border/60 bg-secondary/30 px-2 py-1 text-[11px] text-foreground placeholder:text-muted-foreground/50 focus:border-primary/60 focus:outline-none"
                    />
                    <input
                      type="email"
                      maxLength={120}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email (optional)"
                      className="rounded-md border border-border/60 bg-secondary/30 px-2 py-1 text-[11px] text-foreground placeholder:text-muted-foreground/50 focus:border-primary/60 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-muted-foreground/60">
                      {comment.length}/500
                    </span>
                    <Button
                      type="submit"
                      size="sm"
                      disabled={isSubmitting}
                      className="h-7 text-xs px-3 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-md shadow-sm gap-1.5 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin" />
                          <span>Sending…</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-3 w-3" />
                          <span>Send</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </div>
        )}
      </div>
    );
  }

  // Floating Trigger Variant for Desktop Explorer
  if (variant === "floating") {
    return (
      <div className={`fixed bottom-4 right-4 z-40 ${className}`}>
        {!isOpenFloating ? (
          <button
            type="button"
            onClick={() => setIsOpenFloating(true)}
            className="flex items-center gap-2 rounded-full border border-primary/40 bg-[#080c17]/90 px-3.5 py-2 text-xs font-medium text-foreground shadow-lg backdrop-blur-md transition-all hover:border-primary hover:bg-[#0c1222] hover:scale-105"
            title="Rate your experience / Share feedback"
          >
            <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
            <span>Rate App</span>
          </button>
        ) : (
          <div className="w-80 rounded-2xl border border-border/70 bg-[#070b16]/95 p-4 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-border/50">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" /> Rate OrbitSpan
              </span>
              <button
                type="button"
                onClick={() => setIsOpenFloating(false)}
                className="text-muted-foreground hover:text-foreground rounded p-1"
                aria-label="Close feedback modal"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-3 space-y-3">
              {/* Interactive Stars */}
              <div className="flex items-center justify-center gap-1.5 py-1">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleStarClick(val)}
                    onMouseEnter={() => setHoverRating(val)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 text-muted-foreground/40 hover:scale-115 transition-transform"
                    aria-label={`Rate ${val} stars`}
                  >
                    <Star
                      className={`h-5 w-5 transition-colors duration-150 ${
                        val <= activeRating
                          ? "text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                          : "text-muted-foreground/30 hover:text-muted-foreground/60"
                      }`}
                    />
                  </button>
                ))}
              </div>

              {rating > 0 && (
                <div className="space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
                  <textarea
                    rows={2}
                    maxLength={500}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Optional thoughts, bugs, or ideas..."
                    className="w-full rounded-lg border border-border/60 bg-secondary/30 px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/40 resize-none"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      maxLength={100}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Name (optional)"
                      className="rounded-md border border-border/60 bg-secondary/30 px-2 py-1 text-[11px] text-foreground placeholder:text-muted-foreground/50 focus:border-primary/60 focus:outline-none"
                    />
                    <input
                      type="email"
                      maxLength={120}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email (optional)"
                      className="rounded-md border border-border/60 bg-secondary/30 px-2 py-1 text-[11px] text-foreground placeholder:text-muted-foreground/50 focus:border-primary/60 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-muted-foreground/60">
                      {comment.length}/500
                    </span>
                    <Button
                      type="submit"
                      size="sm"
                      disabled={isSubmitting}
                      className="h-7 text-xs px-3 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-md shadow-sm gap-1.5"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin" />
                          <span>Sending…</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-3 w-3" />
                          <span>Send</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </div>
        )}
      </div>
    );
  }

  // Standard Footer Embedded Variant
  return (
    <div
      className={`rounded-xl border border-border/60 bg-secondary/20 p-4 backdrop-blur-md transition-all ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-1.5">
            <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
            <span>Rate Your Experience</span>
          </h4>
          <p className="text-[11px] text-muted-foreground">
            How accurate, smooth, and insightful was your simulation?
          </p>
        </div>

        {/* 1-5 Star Interactive Control */}
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => handleStarClick(val)}
              onMouseEnter={() => setHoverRating(val)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-1 text-muted-foreground/40 transition-transform hover:scale-115"
              aria-label={`Rate ${val} out of 5 stars`}
            >
              <Star
                className={`h-4 w-4 transition-colors duration-150 ${
                  val <= activeRating
                    ? "text-amber-400 fill-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.5)]"
                    : "text-muted-foreground/30 hover:text-muted-foreground/70"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Progressive Disclosure (Expanded on Star Click) */}
      {rating > 0 && (
        <form
          onSubmit={handleSubmit}
          className="mt-3 space-y-3 border-t border-border/40 pt-3 animate-in fade-in slide-in-from-top-1 duration-200"
        >
          <div className="relative">
            <textarea
              rows={2}
              maxLength={500}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Optional thoughts, suggestions, or feature requests..."
              className="w-full rounded-lg border border-border/60 bg-secondary/30 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/40 resize-none"
            />
            <span className="absolute bottom-2 right-2 text-[10px] font-mono text-muted-foreground/50">
              {comment.length}/500
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="text"
              maxLength={100}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name (optional)"
              className="rounded-md border border-border/60 bg-secondary/30 px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-primary/60 focus:outline-none"
            />
            <input
              type="email"
              maxLength={120}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email (optional - for reply)"
              className="rounded-md border border-border/60 bg-secondary/30 px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-primary/60 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={handleReset}
              className="text-[11px] text-muted-foreground hover:text-foreground underline cursor-pointer"
            >
              Cancel
            </button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="h-8 px-4 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-md shadow-sm gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Transmitting…</span>
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  <span>Submit Rating ({rating}/5)</span>
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
