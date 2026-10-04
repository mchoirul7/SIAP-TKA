"use client";

import { StudyContextDialog } from "@/components/StudyContextDialog";
import { useStudyContext } from "@/hooks/useStudyContext";
import { DEFAULT_STUDY_CONTEXT } from "@/lib/study-context";

export function StudyContextGate() {
  const { context, isReady, saveContext } = useStudyContext();

  return (
    <StudyContextDialog
      open={isReady && !context}
      required
      initialContext={context ?? DEFAULT_STUDY_CONTEXT}
      onApply={saveContext}
    />
  );
}
