import { ClientOnly } from "@tanstack/react-router";
import { Component, lazy, Suspense, type ErrorInfo, type ReactNode } from "react";

const SolarSystemScene = lazy(() => import("./SolarSystemScene"));

function SceneFallback({ message }: { message: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-space-deep p-8">
      <p className="max-w-sm text-center text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

interface ErrorBoundaryState {
  failed: boolean;
  retryKey: number;
  retryCount: number;
}

class SceneErrorBoundary extends Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  override state: ErrorBoundaryState = { failed: false, retryKey: 0, retryCount: 0 };
  private retryTimer: ReturnType<typeof setTimeout> | null = null;

  static getDerivedStateFromError(): Partial<ErrorBoundaryState> {
    return { failed: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    // Silent — only log to console, never block the user
    console.error("[OrbitSpan 3D] Scene error caught (auto-recovering):", error.message);
    console.error("[OrbitSpan 3D] Component stack:", info.componentStack);

    // Auto-retry after 1.5s (max 5 attempts then give up gracefully)
    if (this.state.retryCount < 5) {
      this.retryTimer = setTimeout(() => {
        this.setState((s) => ({
          failed: false,
          retryKey: s.retryKey + 1,
          retryCount: s.retryCount + 1,
        }));
      }, 1500);
    }
  }

  override componentWillUnmount() {
    if (this.retryTimer) clearTimeout(this.retryTimer);
  }

  handleManualRetry = () => {
    if (this.retryTimer) clearTimeout(this.retryTimer);
    this.setState((s) => ({
      failed: false,
      retryKey: s.retryKey + 1,
      retryCount: 0,
    }));
  };

  override render() {
    if (this.state.failed) {
      // Exhausted auto-retries — show minimal non-blocking message
      if (this.state.retryCount >= 5) {
        return (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-space-deep p-8">
            <p className="max-w-sm text-center text-sm text-muted-foreground">
              The 3D scene could not be rendered on this device. All astronomy and distance
              calculations are still available in the side panels.
            </p>
            <button
              type="button"
              onClick={this.handleManualRetry}
              className="rounded-md border border-primary/40 bg-primary/10 px-4 py-2 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
            >
              Try Once More
            </button>
          </div>
        );
      }
      // During auto-retry grace period: show nothing, just a faint placeholder
      return (
        <div className="flex h-full w-full items-center justify-center bg-space-deep">
          <p className="text-xs text-muted-foreground/40 animate-pulse">
            Restarting 3D view…
          </p>
        </div>
      );
    }

    // key forces a full remount on retry, resetting all WebGL/Three state cleanly.
    return (
      <div key={this.state.retryKey} style={{ display: "contents" }}>
        {this.props.children}
      </div>
    );
  }
}


/**
 * Robust WebGL availability check.
 * - SSR-safe: returns false if `document` is not available.
 * - Handles lost context: explicitly checks `isContextLost()`.
 * - Tests webgl2, webgl, and experimental-webgl in order.
 */
function hasWebGL(): boolean {
  if (typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const ctx =
      (canvas.getContext("webgl2") as WebGL2RenderingContext | null) ??
      (canvas.getContext("webgl") as WebGLRenderingContext | null) ??
      (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);

    if (!ctx) return false;
    // If the context was immediately lost (happens on some low-memory mobile devices)
    if (ctx.isContextLost()) return false;
    return true;
  } catch {
    return false;
  }
}

function WebGLGate() {
  if (!hasWebGL()) {
    return (
      <SceneFallback message="WebGL is not available in this browser, so the 3D view is disabled. All astronomy, distance and gravity calculations still work." />
    );
  }
  return <SolarSystemScene />;
}

/** Client-only, lazily loaded 3D scene with WebGL detection and error fallback. */
export function SceneHost() {
  return (
    <ClientOnly fallback={<SceneFallback message="Preparing the Solar System view…" />}>
      <SceneErrorBoundary>
        <Suspense fallback={<SceneFallback message="Loading 3D renderer…" />}>
          <WebGLGate />
        </Suspense>
      </SceneErrorBoundary>
    </ClientOnly>
  );
}
