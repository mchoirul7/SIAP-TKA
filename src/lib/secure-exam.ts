export const SECURE_EXAM_CONFIG = {
  enableFullscreen: true,
  detectTabSwitch: true,
  detectWindowBlur: true,
  detectFullscreenExit: true,
  dedupeWindowMs: 1500,
} as const;

export const SECURE_EXAM_VIOLATION_TYPES = {
  tabSwitch: "TAB_SWITCH",
  windowBlur: "WINDOW_BLUR",
  exitFullscreen: "EXIT_FULLSCREEN",
} as const;

export type SecureExamViolationType =
  (typeof SECURE_EXAM_VIOLATION_TYPES)[keyof typeof SECURE_EXAM_VIOLATION_TYPES];

export type SecureExamStatus = "safe" | "warning" | "alert";

export interface SecureExamViolation {
  id: string;
  type: SecureExamViolationType;
  occurredAt: number;
  metadata: Record<string, unknown>;
  syncedAt?: number;
}

export interface SecureExamDisplay {
  status: SecureExamStatus;
  label: string;
  tone: "emerald" | "amber" | "orange" | "rose";
}

export function createExamSessionId(seed = Date.now()): string {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2, 12);
  return `exam_${seed}_${random}`;
}

export function createSecureViolation(
  type: SecureExamViolationType,
  metadata: Record<string, unknown>,
  occurredAt = Date.now(),
): SecureExamViolation {
  return {
    id: createExamSessionId(occurredAt).replace("exam_", "vio_"),
    type,
    occurredAt,
    metadata,
  };
}

export function shouldRecordSecureExamViolation(
  lastViolationAt: number | null,
  now: number,
  cooldownMs = SECURE_EXAM_CONFIG.dedupeWindowMs,
): boolean {
  return !lastViolationAt || now - lastViolationAt >= cooldownMs;
}

/** Pelanggaran hanya berbuah peringatan; ujian tidak pernah dihentikan. */
export function getSecureExamDisplay(violationCount: number): SecureExamDisplay {
  if (violationCount >= 2) return { status: "alert", label: "Waspada", tone: "orange" };
  if (violationCount === 1) return { status: "warning", label: "Peringatan", tone: "amber" };
  return { status: "safe", label: "Aman", tone: "emerald" };
}

export function secureExamViolationTitle(violationCount: number): string {
  return violationCount <= 1 ? "Peringatan" : `Peringatan ke-${violationCount}`;
}

export function secureExamViolationMessage(type: SecureExamViolationType): string {
  if (type === SECURE_EXAM_VIOLATION_TYPES.exitFullscreen) {
    return "Kamu keluar dari layar penuh. Nyalakan lagi layar penuh untuk melanjutkan.";
  }
  return "Kamu membuka tab atau aplikasi lain. Tetap di layar ujian, ya.";
}
