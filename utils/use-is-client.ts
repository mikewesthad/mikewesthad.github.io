import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * Returns false during SSR and hydration, then true once mounted on the client.
 * Hydration-safe way to render client-only content.
 */
export default function useIsClient() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}
