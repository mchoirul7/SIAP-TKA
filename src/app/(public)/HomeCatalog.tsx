"use client";

import Image from "next/image";
import { useId, useState } from "react";
import { SubjectCard } from "@/components/SubjectCard";
import { SubjectGroupCard } from "@/components/SubjectGroupCard";
import { Icon, type IconName } from "@/components/ui/Icon";
import type { EducationLevel } from "@/data/types";
import {
  COLLAPSED_GROUP_ORDER,
  GROUP_DESCRIPTION,
  GROUP_LABEL,
  subjectGroupKey,
  type SubjectGroupKey,
} from "@/lib/subject-group";
import type { SubjectSummary } from "@/services/content-service";

const LEVEL_ORDER: EducationLevel[] = ["SMA", "SD", "SMP"];

const LEVEL_LABEL: Record<EducationLevel, string> = {
  SMA: "SMA/MA/SMK Sederajat",
  SMP: "SMP/MTs Sederajat",
  SD: "SD/MI Sederajat",
};

const LEVEL_SUBTITLE: Record<EducationLevel, string> = {
  SMA: "Kelas 10, 11, 12 - Persiapan TKA",
  SD: "Kelas 1 - 6",
  SMP: "Kelas 7, 8, 9",
};

const LEVEL_ICON: Record<EducationLevel, IconName> = {
  SMA: "cap",
  SD: "book",
  SMP: "data",
};

const steps: { number: number; icon: IconName; title: string; text: string; tone: string }[] = [

];

function subjectsForLevel(summaries: SubjectSummary[], level: EducationLevel) {
  return summaries.filter((item) => item.subject.level === level);
}

function availableCount(items: SubjectSummary[]): number {
  return items.filter((item) => item.isAvailable).length;
}

function previewNames(items: SubjectSummary[]): string {
  return items.map((item) => item.subject.shortName).join(" - ");
}

export function HomeCatalog({ summaries }: { summaries: SubjectSummary[] }) {
  const panelBaseId = useId();
  const [activeLevel, setActiveLevel] = useState<EducationLevel>(LEVEL_ORDER[0]);
  const [openGroups, setOpenGroups] = useState<SubjectGroupKey[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<SubjectGroupKey[]>([]);
  const groups = LEVEL_ORDER.map((level) => ({
    level,
    items: subjectsForLevel(summaries, level),
  }));
  const activeGroup = groups.find((group) => group.level === activeLevel) ?? groups[0];
  const activeItems = activeGroup.items;
  const mainItems = activeItems.filter((item) => subjectGroupKey(item.subject) === "utama");
  const collapsedGroups = COLLAPSED_GROUP_ORDER.map((key) => ({
    key,
    items: activeItems.filter((item) => subjectGroupKey(item.subject) === key),
  })).filter((group) => group.items.length > 0);

  const selectLevel = (level: EducationLevel) => {
    setActiveLevel(level);
    setOpenGroups([]);
    setExpandedGroups([]);
  };

  const toggleGroup = (key: SubjectGroupKey) => {
    setOpenGroups((current) => {
      const isOpen = current.includes(key);
      if (isOpen) {
        setExpandedGroups((expanded) => expanded.filter((item) => item !== key));
        return current.filter((item) => item !== key);
      }
      return [...current, key];
    });
  };

  const showAllGroupItems = (key: SubjectGroupKey) => {
    setExpandedGroups((current) => (current.includes(key) ? current : [...current, key]));
  };

  return (
    <div id="katalog-mapel" className="container-page scroll-mt-24 pb-16">
      <section className="relative min-h-[178px] overflow-visible">
        <div className="grid gap-8 xl:grid-cols-[minmax(520px,0.88fr)_minmax(610px,1.04fr)_230px] xl:items-start">
          <div className="flex items-start gap-6">
            <span className="mt-2 flex h-14 w-14 shrink-0 items-center justify-center rounded-[16px] bg-gradient-to-br from-brand-600 to-brand-800 text-white shadow-[0_14px_28px_-16px_rgba(80,1,218,0.85)] sm:h-[58px] sm:w-[58px]">
              <Icon name="cap" className="h-7 w-7" strokeWidth={2.2} />
            </span>
            <div className="min-w-0">
              <p className="text-[13px] font-extrabold uppercase tracking-[0.08em] text-brand-600">
                Mulai Belajar
              </p>
              <h1 className="mt-2 text-[36px] font-black leading-[1.04] tracking-tight text-ink-900 sm:text-[46px] lg:whitespace-nowrap lg:text-[48px]">
                SIAP TKA <span className="bg-gradient-to-r from-brand-700 to-brand-500 bg-clip-text text-transparent">ONE</span>
              </h1>
              <p className="mt-3 max-w-2xl text-[16px] leading-[1.65] text-slate-600 sm:text-[17px]">
                Pilih mata pelajaran, masuk ke paket latihan sesuai materi, lalu akhiri dengan
                tryout untuk mengukur kesiapan TKA kamu.
              </p>
            </div>
          </div>

          <ol className="hidden grid-cols-3 gap-7 pt-8 xl:grid">
            {steps.map((step, index) => (
              <li key={step.number} className="relative min-w-0">
                {index > 0 ? (
                  <Icon
                    name="arrow-right"
                    className="absolute -left-6 top-[50px] h-5 w-5 text-slate-300"
                    strokeWidth={2.8}
                  />
                ) : null}
                <span className="flex items-center justify-center gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sm font-black text-brand-700">
                    {step.number}
                  </span>
                  <span className={`flex h-[58px] w-[58px] items-center justify-center rounded-full ${step.tone}`}>
                    <Icon name={step.icon} className="h-7 w-7" strokeWidth={2.2} />
                  </span>
                </span>
                <span className="mx-auto mt-5 block max-w-[150px] text-center">
                  <span className="block text-[16px] font-black leading-[1.15] text-ink-900">
                    {step.title}
                  </span>
                  <span className="mt-2 block text-[13px] leading-[1.32] text-slate-600">
                    {step.text}
                  </span>
                </span>
              </li>
            ))}
          </ol>

          <div className="pointer-events-none absolute -right-2 -top-8 hidden h-[292px] w-[300px] lg:block">
            <Image
              src="/hero-student.png"
              alt=""
              fill
              sizes="300px"
              className="object-contain object-right-top"
              priority
            />
          </div>
        </div>
      </section>

      <div className="relative z-10 mt-5 grid gap-3 lg:grid-cols-3">
        {groups.map(({ level, items }) => {
          const isActive = level === activeLevel;
          const count = availableCount(items);
          return (
            <button
              key={level}
              type="button"
              onClick={() => selectLevel(level)}
              className={[
                "group flex h-[74px] items-center gap-4 rounded-[12px] border px-5 text-left shadow-[0_10px_24px_-20px_rgba(12,10,55,0.55)] transition-all",
                isActive
                  ? "border-brand-500 bg-gradient-to-r from-brand-700 to-brand-600 text-white shadow-[0_16px_34px_-18px_rgba(80,1,218,0.85)]"
                  : "border-slate-200 bg-white/95 text-ink-900 hover:border-brand-200 hover:bg-white",
              ].join(" ")}
            >
              <span
                className={[
                  "flex h-12 w-12 shrink-0 items-center justify-center rounded-[12px]",
                  isActive ? "bg-white/16 text-white" : "bg-sky-50 text-sky-600",
                ].join(" ")}
              >
                <Icon name={LEVEL_ICON[level]} className="h-7 w-7" strokeWidth={2.25} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-3">
                  <span className="text-[19px] font-black leading-none">{LEVEL_LABEL[level]}</span>
                  <span
                    className={[
                      "rounded-full px-3 py-1 text-xs font-black",
                      isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600",
                    ].join(" ")}
                  >
                    {count > 0 ? `${count} mapel` : "Segera"}
                  </span>
                </span>
                <span className={["mt-2 block text-sm", isActive ? "text-white/90" : "text-slate-600"].join(" ")}>
                  {LEVEL_SUBTITLE[level]}
                </span>
              </span>
              <Icon
                name="arrow-right"
                className={["h-5 w-5 shrink-0", isActive ? "text-white" : "text-ink-700"].join(" ")}
                strokeWidth={2.5}
              />
            </button>
          );
        })}
      </div>

      <section className="mt-9">


        {activeItems.length === 0 ? (
          <div className="mt-4 rounded-[12px] border border-dashed border-slate-300 bg-white p-6 text-sm leading-relaxed text-slate-600">
            Paket untuk jenjang {LEVEL_LABEL[activeLevel]} sedang disiapkan.
          </div>
        ) : (
          <>
            {mainItems.length > 0 ? (
              <ul className="mt-4 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {mainItems.map((summary) => (
                  <li key={summary.subject.id}>
                    <SubjectCard summary={summary} />
                  </li>
                ))}
              </ul>
            ) : null}

            {collapsedGroups.map(({ key, items }) => {
              const isOpen = openGroups.includes(key);
              const isExpanded = expandedGroups.includes(key);
              const panelId = `${panelBaseId}-${key}`;
              const visibleItems = isExpanded ? items : items.slice(0, 3);
              const hiddenCount = items.length - visibleItems.length;

              return (
                <div key={key} className="mt-5">
                  <SubjectGroupCard
                    title={GROUP_LABEL[key]}
                    description={GROUP_DESCRIPTION[key]}
                    preview={previewNames(items)}
                    count={items.length}
                    isOpen={isOpen}
                    onToggle={() => toggleGroup(key)}
                    panelId={panelId}
                  />
                  {isOpen ? (
                    <>
                      <ul id={panelId} className="mt-4 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {visibleItems.map((summary) => (
                          <li key={summary.subject.id}>
                            <SubjectCard summary={summary} />
                          </li>
                        ))}
                      </ul>
                      {hiddenCount > 0 ? (
                        <div className="mt-5 flex justify-center">
                          <button
                            type="button"
                            onClick={() => showAllGroupItems(key)}
                            className="inline-flex h-12 items-center justify-center gap-3 rounded-[10px] border border-brand-200 bg-white px-6 text-[15px] font-black text-brand-700 shadow-[0_10px_24px_-22px_rgba(12,10,55,0.6)] transition-colors hover:border-brand-400 hover:bg-brand-50"
                          >
                            Lihat selengkapnya
                            <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs text-brand-700">
                              +{hiddenCount} mapel
                            </span>
                            <Icon name="arrow-right" className="h-5 w-5 rotate-90" strokeWidth={2.5} />
                          </button>
                        </div>
                      ) : null}
                    </>
                  ) : null}
                </div>
              );
            })}
          </>
        )}
      </section>
    </div>
  );
}
