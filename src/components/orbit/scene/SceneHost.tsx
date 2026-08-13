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

class SceneErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  override state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("3D scene failed", error, info.componentStack);
  }

  override render() {
    if (this.state.failed) {
      return (
        <SceneFallback message="The 3D view could not start on this device — WebGL may be unavailable or disabled. Distances, gravity and human-scale figures still work in the panels and on the other pages." />
      );
    }
    return this.props.children;
  }
}

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      canvas.getContext("webgl2") ??
        canvas.getContext("webgl") ??
        canvas.getContext("experimental-webgl"),
    );
  } catch {
    return false;
  }
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

function WebGLGate() {
  if (!hasWebGL()) {
    return (
      <SceneFallback message="WebGL is not available in this browser, so the 3D view is disabled. All astronomy, distance and gravity calculations still work." />
    );
  }
  return <SolarSystemScene />;
}
