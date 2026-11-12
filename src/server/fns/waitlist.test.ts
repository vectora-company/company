import { describe, it, expect, vi, beforeEach } from "vitest";
import { joinWaitlist } from "./waitlist";

const { mockServicesFetch } = vi.hoisted(() => ({
  mockServicesFetch: vi.fn(),
}));

vi.mock("#/lib/services/client", () => ({
  servicesFetch: mockServicesFetch,
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("joinWaitlist", () => {
  it("entra na waitlist com source informado", async () => {
    mockServicesFetch.mockResolvedValue({ ok: true });

    const result = await joinWaitlist({
      data: { email: "a@b.com", turnstileToken: "tt-1", source: "landing" },
    });

    expect(result).toEqual({ ok: true });
    expect(mockServicesFetch).toHaveBeenCalledWith("/waitlist", {
      method: "POST",
      body: JSON.stringify({
        email: "a@b.com",
        turnstileToken: "tt-1",
        source: "landing",
      }),
    });
  });

  it("funciona sem 'source' (edge — campo opcional)", async () => {
    mockServicesFetch.mockResolvedValue({ ok: true });

    await expect(
      joinWaitlist({ data: { email: "a@b.com", turnstileToken: "tt-1" } }),
    ).resolves.toEqual({ ok: true });
  });

  it("rejeita email inválido (edge — validação Zod)", async () => {
    await expect(
      joinWaitlist({
        data: { email: "invalido", turnstileToken: "tt-1" },
      }),
    ).rejects.toBeTruthy();
    expect(mockServicesFetch).not.toHaveBeenCalled();
  });
});
