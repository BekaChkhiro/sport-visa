// Nothing to tear down for now — the E2E database persists between runs so
// failures are inspectable. The next run's global-setup wipes and re-seeds.
export default async function globalTeardown() {}
