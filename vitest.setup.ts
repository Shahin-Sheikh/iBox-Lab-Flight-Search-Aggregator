import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// React Testing Library does not auto-cleanup with Vitest's globals in all
// configurations, so we unmount explicitly between tests to avoid DOM bleed.
afterEach(() => {
  cleanup();
});
