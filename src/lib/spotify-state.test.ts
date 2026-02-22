import { describe, it, expect } from "vitest";
import crypto from "crypto";

/**
 * 与 /api/spotify/connect 和 /api/spotify/callback 一致的 state 签名/验签逻辑
 */
function buildState(userId: string, secret: string): string {
  const nonce = crypto.randomBytes(16).toString("hex");
  const statePayload = `${userId}.${nonce}`;
  const sig = crypto
    .createHmac("sha256", secret)
    .update(statePayload)
    .digest("hex");
  return `${statePayload}.${sig}`;
}

function verifyState(
  state: string,
  secret: string,
): { userId: string } | null {
  const parts = state.split(".");
  if (parts.length !== 3) return null;
  const [userId, nonce, sig] = parts;
  const payload = `${userId}.${nonce}`;
  const expectedSig = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
  return expectedSig === sig ? { userId } : null;
}

describe("Spotify connect state", () => {
  const secret = "test-secret-at-least-32-chars";

  it("builds state with userId and verifies", () => {
    const userId = "user-123";
    const state = buildState(userId, secret);
    expect(state).toMatch(/^[^.]+.[^.]+.[a-f0-9]+$/);
    const out = verifyState(state, secret);
    expect(out).toEqual({ userId: "user-123" });
  });

  it("rejects tampered state", () => {
    const state = buildState("user-1", secret);
    const parts = state.split(".");
    const tampered = `user-2.${parts[1]}.${parts[2]}`;
    expect(verifyState(tampered, secret)).toBeNull();
  });

  it("rejects wrong secret", () => {
    const state = buildState("user-1", secret);
    expect(verifyState(state, "other-secret")).toBeNull();
  });

  it("rejects malformed state", () => {
    expect(verifyState("only-two.parts", secret)).toBeNull();
    expect(verifyState("a.b", secret)).toBeNull();
  });
});
