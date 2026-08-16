"use client";

import type { ClipboardEvent, MouseEvent, ReactNode } from "react";

export function ProtectedQuestionContent({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const blockClipboard = (event: ClipboardEvent<HTMLElement>) => {
    event.preventDefault();
  };

  const blockContextMenu = (event: MouseEvent<HTMLElement>) => {
    event.preventDefault();
  };

  return (
    <div
      className={["protected-question-content", className].filter(Boolean).join(" ")}
      onCopyCapture={blockClipboard}
      onCutCapture={blockClipboard}
      onPasteCapture={blockClipboard}
      onContextMenu={blockContextMenu}
    >
      {children}
    </div>
  );
}
