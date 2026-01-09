// Firebase integration has been removed in this workspace.
// This file remains as a harmless stub for any lingering imports. All new
// persistence should go through the Postgres-backed API endpoints under
// `/api/*` (see `src/app/api/products/route.ts` and `src/app/api/learning/route.ts`).

export function isFirebaseConfigured(): boolean {
  return false;
}

export function getFirestoreClient(): null {
  throw new Error('Firebase removed. Use Postgres via /api endpoints.');
}

export default null;
