"use client";

import Link from "next/link";
import { useState } from "react";
import { LinkPending } from "@/components/NavigationProgress";
import { Icon, type IconName } from "@/components/ui/Icon";
import type { PracticePackage, Tryout } from "@/data/types";
import { useEntitlements } from "@/hooks/useEntitlements";
import type { SubjectTheme } from "@/lib/subject-theme";
import { toneButton, toneChip, toneTag, type AccentTone } from "@/lib/tone";

function chipClass(active: boolean) {
  return active ? toneChip.emerald : toneChip.brand;
}

const compactActiveBorder: Record<AccentTone, string> = {
  brand: "border-brand-500 ring-1 ring-brand-200",
  gold: "border-accent-500 ring-1 ring-accent-200",
  aqua: "border-aqua-500 ring-1 ring-aqua-200",
  emerald: "border-emerald-500 ring-1 ring-emerald-200",
  rose: "border-rose-500 ring-1 ring-rose-200",
  sky: "border-aqua-500 ring-1 ring-aqua-200",
  amber: "border-accent-500 ring-1 ring-accent-200",
  violet: "border-brand-500 ring-1 ring-brand-200",
  slate: "border-ink-500 ring-1 ring-ink-200",
};

const compactActiveIcon: Record<AccentTone, string> = {
  brand: "bg-brand-50 text-brand-700 ring-brand-200",
  gold: "bg-accent-50 text-accent-800 ring-accent-200",
  aqua: "bg-aqua-50 text-aqua-800 ring-aqua-200",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  rose: "bg-rose-50 text-rose-700 ring-rose-200",
  sky: "bg-aqua-50 text-aqua-800 ring-aqua-200",
  amber: "bg-accent-50 text-accent-800 ring-accent-200",
  violet: "bg-brand-50 text-brand-700 ring-brand-200",
  slate: "bg-ink-50 text-ink-700 ring-ink-200",
};

export function LearningPackageCard({
  pkg,
  theme,
  icon = "list-check",
  capaian,
}: {
  pkg: PracticePackage;
  theme: SubjectTheme;
  icon?: IconName;
  capaian?: string;
}) {
  const { mounted, isUnlocked } = useEntitlements();
  const unlocked = pkg.isFreeAccess || (mounted && isUnlocked(pkg));
  const locked = !unlocked;
  const packageHref = locked ? `/latihan/${pkg.slug}?akses=1` : `/latihan/${pkg.slug}`;
  const statusLabel = pkg.isFreeAccess ? "Gratis" : locked ? "Buka Akses" : "Terbuka";

  return (
    <article className="rounded-lg border border-slate-200 bg-white px-4 py-4 shadow-card transition-shadow hover:shadow-float">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <span
          aria-hidden="true"
          className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-ink-50 text-ink-700 ring-1 ring-inset ring-slate-200"
        >
          <Icon name={icon} className="h-6 w-6" strokeWidth={2} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${chipClass(
                unlocked,
              )}`}
            >
              <Icon name={locked ? "lock" : "unlock"} className="h-3.5 w-3.5" strokeWidth={2.2} />
              {statusLabel}
            </span>
            {capaian ? (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${toneTag[theme.accent]}`}
              >
                <Icon name="target" className="h-3.5 w-3.5" />
                {capaian}
              </span>
            ) : null}
          </div>

          <h4 className="mt-2 text-base font-extrabold leading-snug tracking-tight">
            <Link href={packageHref} className="hover:text-brand-700">
              {pkg.title}
            </Link>
          </h4>
          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-slate-600">
            {pkg.summary || pkg.description}
          </p>

          <ul className="mt-3 flex flex-wrap gap-1.5">
            {[
              { icon: "list-check" as const, text: `${pkg.questionIds.length} soal` },
              { icon: "clock" as const, text: `+/- ${pkg.estimatedMinutes} menit` },
              { icon: "chart" as const, text: pkg.difficultyRange },
            ].map((tag) => (
              <li
                key={tag.text}
                className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-inset ring-slate-200"
              >
                <Icon name={tag.icon} className="h-3.5 w-3.5" />
                {tag.text}
              </li>
            ))}
          </ul>
        </div>

        <Link
          href={packageHref}
          className={`inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg px-4 text-sm font-bold transition-opacity hover:opacity-90 sm:w-36 ${toneButton[theme.accent]}`}
        >
          <LinkPending />
          <Icon name={locked ? "lock" : "play"} className="h-4 w-4" strokeWidth={2.2} />
          {locked ? "Buka Akses" : "Latihan"}
        </Link>
      </div>
    </article>
  );
}

export function LearningTryoutCard({
  tryout,
}: {
  tryout: Tryout;
}) {
  const { mounted, isUnlocked } = useEntitlements();
  const unlocked = mounted && isUnlocked(tryout);
  const locked = !unlocked;

  return (
    <article className="rounded-lg border border-rose-200 bg-white px-4 py-4 shadow-card transition-shadow hover:shadow-float">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <span
          aria-hidden="true"
          className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200"
        >
          <Icon name="flag" className="h-6 w-6" strokeWidth={2} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${chipClass(
                unlocked,
              )}`}
            >
              <Icon name={locked ? "lock" : "unlock"} className="h-3.5 w-3.5" strokeWidth={2.2} />
              {locked ? "Kode Akses" : "Terbuka"}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-800 ring-1 ring-inset ring-rose-100">
              <Icon name="trophy" className="h-3.5 w-3.5" />
              {tryout.variantLabel}
            </span>
          </div>

          <h3 className="mt-2 text-base font-extrabold leading-snug tracking-tight">
            <Link href={`/tryout/${tryout.slug}`} className="hover:text-rose-700">
              {tryout.title}
            </Link>
          </h3>
          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-slate-600">
            {tryout.description}
          </p>

          <ul className="mt-3 flex flex-wrap gap-1.5">
            {[
              { icon: "list-check" as const, text: `${tryout.questionIds.length} soal` },
              { icon: "hourglass" as const, text: `${tryout.durationMinutes} menit` },
              { icon: "cap" as const, text: `Jenjang ${tryout.level}` },
            ].map((tag) => (
              <li
                key={tag.text}
                className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-inset ring-slate-200"
              >
                <Icon name={tag.icon} className="h-3.5 w-3.5" />
                {tag.text}
              </li>
            ))}
          </ul>
        </div>

        <Link
          href={`/tryout/${tryout.slug}`}
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-rose-500 to-rose-600 px-4 text-sm font-bold text-white transition-opacity hover:opacity-90 sm:w-36"
        >
          <LinkPending />
          <Icon name={locked ? "lock" : "play"} className="h-4 w-4" strokeWidth={2.2} />
          {locked ? "Buka" : "Tryout"}
        </Link>
      </div>
    </article>
  );
}

export function LearningPackageCompactCard({
  pkg,
  icon = "list-check",
  subtopicName,
  accent,
  active = false,
  onSelect,
}: {
  pkg: PracticePackage;
  icon?: IconName;
  subtopicName: string;
  accent: AccentTone;
  active?: boolean;
  onSelect: () => void;
}) {
  const { mounted, isUnlocked } = useEntitlements();
  const unlocked = pkg.isFreeAccess || (mounted && isUnlocked(pkg));
  const locked = !unlocked;
  const packageHref = locked ? `/latihan/${pkg.slug}?akses=1` : `/latihan/${pkg.slug}`;

  return (
    <article
      className={[
        "flex items-center gap-3 rounded-lg border bg-white px-3 py-3 shadow-card transition-shadow hover:shadow-float",
        active ? compactActiveBorder[accent] : "border-slate-200",
      ].join(" ")}
    >
      <button
        type="button"
        aria-pressed={active}
        onClick={onSelect}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
      >
        <span
          aria-hidden="true"
          className={[
            "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset",
            active ? compactActiveIcon[accent] : "bg-slate-50 text-slate-700 ring-slate-200",
          ].join(" ")}
        >
          <Icon name={icon} className="h-5 w-5" strokeWidth={2} />
        </span>

        <span className="min-w-0 flex-1">
          <span className="block break-words text-sm font-bold leading-snug text-ink-900">
            {pkg.title}
          </span>
          <span className="mt-0.5 block break-words text-xs font-medium text-slate-500">
            {subtopicName}
          </span>
        </span>
      </button>

      {active ? (
        <Link
          href={packageHref}
          className={`inline-flex h-9 w-28 shrink-0 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-bold transition-opacity hover:opacity-90 sm:w-32 ${toneButton[accent]}`}
        >
          <LinkPending />
          <Icon name={locked ? "lock" : "play"} className="h-3.5 w-3.5" strokeWidth={2.4} />
          {locked ? "Buka Akses" : "Latihan"}
        </Link>
      ) : (
        <span className="h-9 w-28 shrink-0 sm:w-32" aria-hidden="true" />
      )}
    </article>
  );
}

export function LearningTryoutCompactCard({
  tryout,
  accent = "rose",
}: {
  tryout: Tryout;
  accent?: AccentTone;
}) {
  const { mounted, isUnlocked } = useEntitlements();
  const unlocked = mounted && isUnlocked(tryout);
  const locked = !unlocked;

  return (
    <article className={`flex items-center gap-3 rounded-lg border bg-white px-3 py-3 shadow-card transition-shadow hover:shadow-float ${compactActiveBorder[accent]}`}>
      <span
        aria-hidden="true"
        className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset ${compactActiveIcon[accent]}`}
      >
        <Icon name="flag" className="h-5 w-5" strokeWidth={2} />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block break-words text-sm font-bold leading-snug text-ink-900">
          {tryout.title}
        </span>
        <span className="mt-0.5 block break-words text-xs font-medium text-slate-500">
          Simulasi akhir
        </span>
      </span>

      <Link
        href={`/tryout/${tryout.slug}`}
        className={`inline-flex h-9 w-24 shrink-0 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-bold transition-opacity hover:opacity-90 sm:w-28 ${toneButton[accent]}`}
      >
        <LinkPending />
        <Icon name={locked ? "lock" : "play"} className="h-3.5 w-3.5" strokeWidth={2.4} />
        Tryout
      </Link>
    </article>
  );
}

export type LearningPathCapability = {
  id: string;
  name: string;
  icon: IconName;
  packages: PracticePackage[];
};

export type LearningPathSubtopic = {
  id: string;
  name: string;
  icon: IconName;
  capabilities: LearningPathCapability[];
};

export type LearningPathMaterial = {
  id: string;
  name: string;
  subtopics: LearningPathSubtopic[];
};

function packageDisplayKey(pkg: PracticePackage): string {
  return (pkg.title || pkg.slug).toLowerCase().replace(/\s+/g, " ").trim();
}

export function LearningPathList({
  groups,
  initialPackageId,
  accent,
}: {
  groups: LearningPathMaterial[];
  initialPackageId?: string;
  accent: AccentTone;
}) {
  const seenPackageIds = new Set<string>();
  const seenPackageTitles = new Set<string>();
  const visibleGroups = groups
    .map((group) => ({
      ...group,
      subtopics: group.subtopics
        .map((subtopic) => ({
          ...subtopic,
          capabilities: subtopic.capabilities
            .map((capability) => {
              const uniquePackages = capability.packages.filter((pkg) => {
                const titleKey = packageDisplayKey(pkg);
                if (seenPackageIds.has(pkg.id) || seenPackageTitles.has(titleKey)) return false;
                seenPackageIds.add(pkg.id);
                seenPackageTitles.add(titleKey);
                return true;
              });
              return { ...capability, packages: uniquePackages };
            })
            .filter((capability) => capability.packages.length > 0),
        }))
        .filter((subtopic) => subtopic.capabilities.length > 0),
    }))
    .filter((group) => group.subtopics.length > 0);
  const firstPackageId =
    initialPackageId ??
    visibleGroups
      .flatMap((group) => group.subtopics)
      .flatMap((subtopic) => subtopic.capabilities)
      .flatMap((capability) => capability.packages)[0]?.id;
  const [activePackageId, setActivePackageId] = useState(firstPackageId ?? "");

  return (
    <div className="mt-5 w-full space-y-7">
      {visibleGroups.map((group) => (
        <section key={group.id}>
          <h3 className="mb-2 text-sm font-extrabold tracking-tight text-ink-900 sm:text-base">
            {group.name}
          </h3>

          <ul className="space-y-2">
            {group.subtopics.flatMap((subtopic) =>
              subtopic.capabilities.flatMap((capability) =>
                capability.packages.map((pkg) => (
                  <li key={`${capability.id}-${pkg.id}`}>
                      <LearningPackageCompactCard
                        pkg={pkg}
                        icon={capability.icon}
                        subtopicName={subtopic.name}
                        accent={accent}
                        active={pkg.id === activePackageId}
                          onSelect={() => setActivePackageId(pkg.id)}
                    />
                  </li>
                )),
              ),
            )}
          </ul>
        </section>
      ))}
    </div>
  );
}
