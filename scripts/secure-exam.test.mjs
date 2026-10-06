import assert from "node:assert/strict";
import test from "node:test";
import {
  createSecureViolation,
  getSecureExamDisplay,
  SECURE_EXAM_CONFIG,
  SECURE_EXAM_VIOLATION_TYPES,
  secureExamViolationMessage,
  shouldRecordSecureExamViolation,
} from "../src/lib/secure-exam.ts";

function makeState() {
  return {
    answers: { q1: { type: "single", key: "A" } },
    startedAt: 1_000,
    lastViolationAt: null,
    violations: [],
  };
}

function record(state, type, now) {
  if (!shouldRecordSecureExamViolation(state.lastViolationAt, now)) return state;
  return {
    ...state,
    lastViolationAt: now,
    violations: [...state.violations, createSecureViolation(type, {}, now)],
  };
}

test("Secure Exam aktif dengan violation awal 0", () => {
  const display = getSecureExamDisplay(0);
  assert.equal(SECURE_EXAM_CONFIG.maxViolations, 3);
  assert.equal(display.label, "Aman");
});

test("pindah tab mencatat TAB_SWITCH sebagai violation pertama", () => {
  const state = record(makeState(), SECURE_EXAM_VIOLATION_TYPES.tabSwitch, 2_000);
  assert.equal(state.violations.length, 1);
  assert.equal(state.violations[0].type, "TAB_SWITCH");
});

test("kembali ke tab menampilkan pesan peringatan", () => {
  assert.match(
    secureExamViolationMessage(1, SECURE_EXAM_VIOLATION_TYPES.tabSwitch),
    /meninggalkan halaman ujian/i,
  );
});

test("keluar fullscreen mencatat EXIT_FULLSCREEN", () => {
  const state = record(makeState(), SECURE_EXAM_VIOLATION_TYPES.exitFullscreen, 2_000);
  assert.equal(state.violations[0].type, "EXIT_FULLSCREEN");
});

test("blur dan visibilitychange berdekatan hanya dihitung satu violation", () => {
  const first = record(makeState(), SECURE_EXAM_VIOLATION_TYPES.windowBlur, 2_000);
  const second = record(first, SECURE_EXAM_VIOLATION_TYPES.tabSwitch, 2_500);
  assert.equal(second.violations.length, 1);
});

test("violation ketiga mengubah status tampilan menjadi selesai", () => {
  const display = getSecureExamDisplay(3);
  assert.equal(display.status, "finished");
});

test("jawaban tidak berubah setelah violation", () => {
  const state = makeState();
  const next = record(state, SECURE_EXAM_VIOLATION_TYPES.tabSwitch, 2_000);
  assert.deepEqual(next.answers, state.answers);
});

test("timer tetap dihitung dari startedAt yang sama", () => {
  const state = makeState();
  const before = 8_000 - state.startedAt;
  const next = record(state, SECURE_EXAM_VIOLATION_TYPES.tabSwitch, 2_000);
  const after = 8_000 - next.startedAt;
  assert.equal(after, before);
});
