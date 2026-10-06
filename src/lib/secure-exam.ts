export const SECURE_EXAM_CONFIG = {
  maxViolations: 3,
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

export type SecureExamStatus = "safe" | "warning" | "alert" | "finished";

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

export function getSecureExamDisplay(
  violationCount: number,
  maxViolations = SECURE_EXAM_CONFIG.maxViolations,
): SecureExamDisplay {
  if (violationCount >= maxViolations) {
    return { status: "finished", label: "Ujian selesai", tone: "rose" };
  }
  if (violationCount >= 2) return { status: "alert", label: "Waspada", tone: "orange" };
  if (violationCount === 1) return { status: "warning", label: "Peringatan", tone: "amber" };
  return { status: "safe", label: "Aman", tone: "emerald" };
}

export function secureExamViolationTitle(
  violationCount: number,
  maxViolations = SECURE_EXAM_CONFIG.maxViolations,
): string {
  if (violationCount >= maxViolations) return "Ujian Berakhir";
  if (violationCount === 2) return "Peringatan Kedua";
  return "Peringatan";
}

export function secureExamViolationMessage(
  violationCount: number,
  type: SecureExamViolationType,
  maxViolations = SECURE_EXAM_CONFIG.maxViolations,
): string {
  if (violationCount >= maxViolations) {
    return "Pelanggaran melebihi batas yang ditentukan. Ujian Anda otomatis selesai.";
  }
  if (violationCount === 2) {
    return "Aktivitas mencurigakan kembali terdeteksi. Pelanggaran ke-2 telah dicatat.";
  }
  if (type === SECURE_EXAM_VIOLATION_TYPES.exitFullscreen) {
    return "Mode layar penuh telah ditinggalkan. Aktivitas ini tercatat sebagai pelanggaran.";
  }
  return "Anda terdeteksi meninggalkan halaman ujian. Aktivitas ini telah dicatat.";
}
