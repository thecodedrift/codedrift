import { lazy, Suspense, useEffect, useState } from "react";
import type { MetaFunction } from "react-router";

export const meta: MetaFunction = () => [
  { title: "Studio — Codedrift" },
  { name: "robots", content: "noindex, nofollow" },
];

const StudioEmbed = lazy(() => import("~/components/studio-embed.client"));

export default function StudioRoute() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const fallback = (
    <div className="flex h-full items-center justify-center">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Loading Studio…
      </p>
    </div>
  );

  return (
    <div className="h-screen w-screen">
      {hydrated ? (
        <Suspense fallback={fallback}>
          <StudioEmbed />
        </Suspense>
      ) : (
        fallback
      )}
    </div>
  );
}
