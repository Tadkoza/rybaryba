import { useState } from "react";
import FishArt from "./FishArt";
import type { FishMode } from "../game/fishing";
import { BAITS, BaitId, Journal, METHODS, RODS, RodId, SPECIES, SpeciesId, fmtWeight } from "../game/fishdata";

export interface FishCfg {
  rod: RodId;
  bait: BaitId;
  mode: FishMode;
}

type Card = { t: string; d: React.ReactNode };

const EASY_CARDS: Card[] = [
  { t: "1 · Rzut — celowanie kursorem", d: <><b>Przytrzymaj LPM (lub F)</b> — na wodzie pojawi się zielony celownik. <b>Kursorem (środek ekranu) wybierz miejsce</b>, puść przycisk, a spławik poleci dokładnie tam. Czerwony celownik = zbyt płytko lub ląd.</> },
  { t: "2 · Branie — z podpowiedziami", d: <>Gdy spławik drga, ekran napisze, że ryba skubie przynętę — <b>jeszcze nie zacinaj</b>. Gdy spławik zniknie, pojawi się <b>„ZACINAJ TERAZ”</b> z paskiem czasu (kilka sekund) — kliknij <b>LPM</b>.</> },
  { t: "3 · Zwijanie zawsze możliwe", d: <><b>PPM</b> zwija żyłkę o każdej porze — także przy skubaniu i braniu. Zwinięcie w chwili brania też zacina rybę. Kółko myszy zmienia prędkość zwijania.</> },
  { t: "4 · Hol", d: <>Trzymaj <b>PPM</b> i zwijaj. Pilnuj paska napięcia: gdy ryba ucieka lub pasek robi się czerwony, <b>puść PPM</b>. W trybie łatwym hamulec jest łagodny, a ryba szybciej się męczy.</> },
];

const HARD_CARDS: Card[] = [
  { t: "1 · Rzut — zamach", d: <>Trzymając <b>rolkę myszy (lub F)</b> pociągnij mysz <b>do siebie</b>, potem <b>szybko do przodu</b> i puść w zielonej strefie. Samo przytrzymanie ładuje rzut, a krótkie kliknięcie opuszcza przynętę pod nogi.</> },
  { t: "2 · Branie — bez podpowiedzi", d: <>Nic nie krzyczy ani nie dzwoni. Obserwuj spławik: <b>drgnięcia to skubanie</b>, a zacinać trzeba dopiero, gdy spławik <b>zniknie pod wodą albo się położy / wynurzy</b>. Branie trwa ok. sekundy.</> },
  { t: "3 · Zacięcie — szarpnięcie", d: <>Najlepsze zacięcie to <b>gwałtowne szarpnięcie myszą do góry</b>. Zadziała też <b>LPM</b> (słabsze) oraz <b>PPM</b> (najsłabsze). Zbyt wcześnie = ryba się spłoszy, a słabe zacięcie = ryba może się wypiąć.</> },
  { t: "4 · Zwijanie i hol", d: <><b>PPM</b> zwija o każdej porze (przy skubaniu jednak spłoszysz rybę). Ryba mocniej ciągnie, a hamulec jest ostry — puszczaj przy odjazdach, nie dopuszczaj do luźnej żyłki.</> },
];

interface Props {
  journal: Journal;
  cfg: FishCfg;
  equipped: boolean;
  lakeName: string;
  onCfg: (c: FishCfg) => void;
  onStart: () => void;
  onStow: () => void;
  onClose: () => void;
}

type Tab = "gear" | "atlas" | "log";

export default function FishingMenu({ journal, cfg, equipped, lakeName, onCfg, onStart, onStow, onClose }: Props) {
  const [tab, setTab] = useState<Tab>("gear");
  const total = journal.catches.length;
  const totalKg = journal.catches.reduce((s, c) => s + c.weight, 0);
  const tabs: [Tab, string][] = [
    ["gear", "🎣 Sprzęt"],
    ["atlas", "🐟 Atlas ryb"],
    ["log", "📒 Dziennik połowów"],
  ];
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 p-4 backdrop-blur-[3px]">
      <div className="flex max-h-full w-[min(1040px,100%)] flex-col overflow-hidden rounded-3xl border border-white/15 bg-slate-950/92 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-7 py-5">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-amber-200/70">Wędkarstwo · {lakeName}</div>
            <h2 className="mt-1 font-serif text-3xl font-semibold">Przygotuj zestaw</h2>
          </div>
          <div className="flex gap-1 rounded-full border border-white/15 bg-white/5 p-1">
            {tabs.map(([id, label]) => (
              <button key={id} onClick={() => setTab(id)} className={`rounded-full px-4 py-2 text-sm transition ${tab === id ? "bg-white text-slate-900 font-semibold" : "text-white/75 hover:text-white"}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-7 py-6">
          {tab === "gear" && (
            <div className="grid gap-6 lg:grid-cols-3">
              <section className="lg:col-span-3">
                <h3 className="mb-3 text-xs uppercase tracking-widest text-white/50">Tryb łowienia</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  {([
                    ["easy", "🟢 Łatwy", "Rzut kursorem w wybrane miejsce, podpowiedzi kiedy zacinać, wyrozumiały hol. Dobry na start."],
                    ["hard", "🔴 Trudny", "Rzut zamachem myszy, zero podpowiedzi — zacinasz po samym spławiku, szarpnięciem. Ostrzejszy hol."],
                  ] as [FishMode, string, string][]).map(([id, name, desc]) => (
                    <button
                      key={id}
                      onClick={() => onCfg({ ...cfg, mode: id })}
                      className={`rounded-2xl border p-4 text-left transition ${cfg.mode === id ? (id === "easy" ? "border-emerald-300/80 bg-emerald-300/10" : "border-red-300/80 bg-red-300/10") : "border-white/10 bg-white/5 hover:bg-white/10"}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold">{name}</span>
                        {cfg.mode === id && <span className="rounded-full bg-white/15 px-2 py-0.5 text-[11px]">wybrany</span>}
                      </div>
                      <p className="mt-1 text-sm text-white/70">{desc}</p>
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="mb-3 text-xs uppercase tracking-widest text-white/50">1 · Wędka</h3>
                <div className="space-y-3">
                  {RODS.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => onCfg({ ...cfg, rod: r.id })}
                      className={`w-full rounded-2xl border p-4 text-left transition ${cfg.rod === r.id ? "border-amber-300/80 bg-amber-300/10" : "border-white/10 bg-white/5 hover:bg-white/10"}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{r.name}</span>
                        <span className="text-xs text-white/50">rzut do {r.maxCast} m</span>
                      </div>
                      <p className="mt-1 text-sm text-white/65">{r.desc}</p>
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="mb-3 text-xs uppercase tracking-widest text-white/50">2 · Metoda połowu</h3>
                <div className="space-y-3">
                  {METHODS.map((m) => (
                    <div key={m.id} className={`rounded-2xl border p-4 ${m.available ? "border-amber-300/80 bg-amber-300/10" : "border-white/10 bg-white/[0.03] opacity-60"}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{m.name}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[11px] ${m.available ? "bg-emerald-500/25 text-emerald-200" : "bg-white/10 text-white/50"}`}>{m.available ? "wybrana" : "wkrótce"}</span>
                      </div>
                      <p className="mt-1 text-sm text-white/65">{m.desc}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="mb-3 text-xs uppercase tracking-widest text-white/50">3 · Przynęta</h3>
                <div className="space-y-3">
                  {BAITS.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => onCfg({ ...cfg, bait: b.id })}
                      className={`w-full rounded-2xl border p-4 text-left transition ${cfg.bait === b.id ? "border-amber-300/80 bg-amber-300/10" : "border-white/10 bg-white/5 hover:bg-white/10"}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="inline-block h-3.5 w-3.5 rounded-full" style={{ background: b.color }} />
                        <span className="font-semibold">{b.name}</span>
                        <span className="ml-auto text-xs text-white/50">najlepsza na: {b.best}</span>
                      </div>
                      <p className="mt-1 text-sm text-white/65">{b.desc}</p>
                    </button>
                  ))}
                </div>
              </section>

              <div className="grid gap-3 lg:col-span-3 md:grid-cols-2 xl:grid-cols-4">
                {(cfg.mode === "easy" ? EASY_CARDS : HARD_CARDS).map((c) => (
                  <div key={c.t} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-relaxed text-white/75">
                    <div className="mb-1 text-xs uppercase tracking-widest text-amber-200/80">{c.t}</div>
                    {c.d}
                  </div>
                ))}
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-xs text-white/55 md:col-span-2 xl:col-span-4">
                  Bez środkowego przycisku lub kółka (np. touchpad): <kbd className="rounded bg-white/15 px-1.5">F</kbd> trzymana zamiast rolki / LPM, <kbd className="rounded bg-white/15 px-1.5">R</kbd> trzymany zamiast PPM,{" "}
                  <kbd className="rounded bg-white/15 px-1.5">Z</kbd>/<kbd className="rounded bg-white/15 px-1.5">X</kbd> zmniejsza/zwiększa prędkość zwijania. Na spławik złowisz: wzdręgę, płoć, leszcza i karpia.
                </div>
              </div>
            </div>
          )}

          {tab === "atlas" && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {SPECIES.map((s) => {
                const ok = s.methods.includes("float");
                const rec = journal.records[s.id as SpeciesId];
                return (
                  <div key={s.id} className={`rounded-2xl border p-4 ${ok ? "border-white/15 bg-white/5" : "border-white/10 bg-white/[0.03]"}`}>
                    <FishArt id={s.id} width={290} dim={!ok} className="mx-auto" />
                    <div className="mt-2 flex items-baseline justify-between">
                      <h4 className="font-serif text-xl font-semibold">{s.name}</h4>
                      <span className={`rounded-full px-2 py-0.5 text-[11px] ${ok ? "bg-emerald-500/25 text-emerald-200" : "bg-white/10 text-white/50"}`}>{ok ? "na spławik ✓" : s.needs}</span>
                    </div>
                    <div className="text-xs italic text-white/45">{s.latin}</div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-white/70">
                      <div className="rounded-lg bg-black/25 px-2 py-1">Długość: {s.minL}–{s.maxL} cm</div>
                      <div className="rounded-lg bg-black/25 px-2 py-1">
                        Masa: {fmtWeight(s.k * Math.pow(s.minL / 100, 3))} – {fmtWeight(s.k * Math.pow(s.maxL / 100, 3))}
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-white/65">{s.desc}</p>
                    <p className="mt-1 text-xs text-white/45">Środowisko: {s.habitat}</p>
                    {rec && (
                      <div className="mt-2 rounded-lg bg-amber-300/10 px-2 py-1 text-xs text-amber-100">
                        Twój rekord: {rec.length} cm · {fmtWeight(rec.weight)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {tab === "log" && (
            <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
              <div>
                <div className="mb-3 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white/5 p-4">
                    <div className="text-xs uppercase tracking-wider text-white/45">Złowione ryby</div>
                    <div className="text-3xl font-semibold">{total}</div>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-4">
                    <div className="text-xs uppercase tracking-wider text-white/45">Łączna masa</div>
                    <div className="text-3xl font-semibold">{totalKg.toFixed(1).replace(".", ",")} kg</div>
                  </div>
                </div>
                <h3 className="mb-2 text-xs uppercase tracking-widest text-white/50">Rekordy</h3>
                <div className="space-y-1.5">
                  {SPECIES.map((s) => {
                    const r = journal.records[s.id as SpeciesId];
                    const n = journal.catches.filter((c) => c.species === s.id).length;
                    return (
                      <div key={s.id} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-1.5 text-sm">
                        <span className={r ? "" : "text-white/35"}>{s.name}</span>
                        <span className="text-white/70">{r ? `${r.length} cm · ${fmtWeight(r.weight)} · ×${n}` : "—"}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div>
                <h3 className="mb-2 text-xs uppercase tracking-widest text-white/50">Ostatnie połowy</h3>
                {journal.catches.length === 0 && <p className="text-sm text-white/50">Jeszcze nic nie złowiłeś. Zarzuć wędkę i cierpliwie czekaj na branie.</p>}
                <div className="space-y-1.5">
                  {journal.catches.slice(0, 14).map((c) => {
                    const sp = SPECIES.find((s) => s.id === c.species)!;
                    return (
                      <div key={c.id} className="flex items-center gap-3 rounded-lg bg-white/5 px-3 py-1.5 text-sm">
                        <FishArt id={c.species} width={64} />
                        <span className="font-semibold">{sp.name}</span>
                        <span className="text-white/65">
                          {c.length} cm · {fmtWeight(c.weight)}
                        </span>
                        <span className="ml-auto text-xs text-white/40">{c.lake === "kortowskie" ? "Kortowskie" : "Klebarskie"}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-7 py-4">
          <div className="text-xs text-white/45">G — zamknij · Esc — pauza</div>
          <div className="flex gap-3">
            {equipped && (
              <button onClick={onStow} className="rounded-full border border-white/20 px-5 py-2.5 text-sm text-white/80 transition hover:bg-white/10">
                Schowaj wędkę
              </button>
            )}
            <button onClick={onClose} className="rounded-full border border-white/20 px-5 py-2.5 text-sm text-white/80 transition hover:bg-white/10">
              Zamknij
            </button>
            <button onClick={onStart} className="rounded-full bg-amber-400 px-7 py-2.5 text-sm font-semibold text-slate-900 shadow-lg transition hover:brightness-110 active:scale-95">
              {equipped ? "Zastosuj i łów" : "Zacznij łowić"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
