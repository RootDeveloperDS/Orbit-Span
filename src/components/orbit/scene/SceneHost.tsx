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
  errorMessage: string;
  retryKey: number;
}

class SceneErrorBoundary extends Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  override state: ErrorBoundaryState = { failed: false, errorMessage: "", retryKey: 0 };

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { failed: true, errorMessage: error?.message ?? "Unknown render error" };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("3D scene failed:", error.message, info.componentStack);
  }

  handleRetry = () => {
    this.setState((s) => ({ failed: false, errorMessage: "", retryKey: s.retryKey + 1 }));
  };

  override render() {
    if (this.state.failed) {
      const isWebGLError =
        this.state.errorMessage.toLowerCase().includes("webgl") ||
        this.state.errorMessage.toLowerCase().includes("context");

      return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-space-deep p-8">
          <p className="max-w-sm text-center text-sm text-muted-foreground">
            {isWebGLError
              ? "The 3D view could not start on this device — WebGL may be unavailable or disabled. Distances, gravity and human-scale figures still work in the panels and on the other pages."
              : "The 3D view encountered an error. You can try reloading it."}
          </p>
          {!isWebGLError && (
            <button
              type="button"
              onClick={this.handleRetry}
              className="rounded-md border border-primary/40 bg-primary/10 px-4 py-2 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
            >
              Try Again
            </button>
          )}
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
