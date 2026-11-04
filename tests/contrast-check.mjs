// WCAG 2.2 contrast check for every palette in app.css, light and dark.
// Run from the repo root: node tests/contrast-check.mjs        (prints tables, exits 1 on any current failure)
//                         node tests/contrast-check.mjs --md   (Markdown tables for docs/reviews)
// No dependencies. Reads the tokens straight from app.css so it stays current when palettes change.
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../app.css", import.meta.url), "utf8");
const MD = process.argv.includes("--md");

// ---- color math (WCAG 2.x relative luminance) ----
const hex = h => { h = h.replace("#", ""); if (h.length === 3) h = [...h].map(c => c + c).join(""); return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16)); };
const toHex = rgb => "#" + rgb.map(v => Math.round(v).toString(16).padStart(2, "0")).join("");
const lum = c => { const [r, g, b] = hex(c).map(v => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
// color-mix(in srgb, a p, b) and "a at opacity p over b" are the same sRGB blend
const mix = (a, p, b) => toHex(hex(a).map((v, i) => v * p + hex(b)[i] * (1 - p)));

// self-check
console.assert(Math.abs(ratio("#000", "#fff") - 21) < 1e-9 && Math.abs(ratio("#777", "#fff") - 4.48) < 0.01, "contrast math is off");

// ---- read tokens ----
const block = sel => {
  const i = css.indexOf(sel + " {"); if (i < 0) return {};
  const body = css.slice(css.indexOf("{", i) + 1, css.indexOf("}", i));
  return Object.fromEntries([...body.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{3,6})/g)].map(m => [m[1], m[2].toLowerCase()]));
};
const baseLight = block(":root"), baseDark = block(':root[data-theme="dark"]');
const PALS = [["green", "Green"], ["blue", "Blue"], ["red", "Red"], ["orange", "Orange"], ["purple", "Purple"], ["teal", "Teal"], ["mono", "Monochrome"]];
const tokens = (key, mode) => {
  if (key === "green") return mode === "light" ? { ...baseLight } : { ...baseLight, ...baseDark };
  const light = block(`:root[data-palette="${key}"]`), dark = block(`:root[data-palette="${key}"][data-theme="dark"]`);
  const sys = block(`  :root[data-palette="${key}"]:not([data-theme="light"])`.trim());
  if (JSON.stringify(dark) !== JSON.stringify(sys)) console.warn(`! ${key}: system-dark and picked-dark blocks differ`);
  return mode === "light" ? { ...baseLight, ...light } : { ...baseLight, ...baseDark, ...light, ...dark };
};

// Designer's proposal (docs/design/settings-options.md), Green values applied to every palette
const PROPOSED = { light: { "err-ink": "#ffffff", "line-strong": "#7a867c" }, dark: { "err-ink": "#1a0b0a", "line-strong": "#6f7f72" } };

// ---- the pairs the app actually draws (selector -> fg on bg) ----
// need: 4.5 normal text, 3 large text (>= 24px, or >= 18.66px bold) and UI/graphics
const pairs = t => {
  const soon = mix(t["wait-bg"], 0.55, t.surface);           // .mrow.soonrow tint over the card
  const bar = mix(t.surface, 0.94, t.bg);                    // .tabbar background
  const dropBorder = mix(t.accent, 0.55, t.line);            // .filebtn dashed border
  return [
    // text
    ["ink on surface", "body text in cards, inputs, .btn2", t.ink, t.surface, 4.5, "text"],
    ["ink on bg", "page text", t.ink, t.bg, 4.5, "text"],
    ["muted on surface", "labels, hints, .meta, .tab (unselected), chart text", t.muted, t.surface, 4.5, "text"],
    ["muted on bg", ".sub, .hint on page, .chip, .mcar-head, .pv", t.muted, t.bg, 4.5, "text"],
    ["muted on tab bar", ".tabbar a (12px labels)", t.muted, bar, 4.5, "text"],
    ["accent on surface", "links, .mbtn, .hidebtn, .stat.main", t.accent, t.surface, 4.5, "text"],
    ["accent on bg", "links on the page", t.accent, t.bg, 4.5, "text"],
    ["accent on tab bar", ".tabbar a[aria-current]", t.accent, bar, 4.5, "text"],
    ["accent-ink on accent", ".save, .go, selected .tab (15-17px)", t["accent-ink"], t.accent, 4.5, "text"],
    ["ok on surface", ".status.ok, .check.ok", t.ok, t.surface, 4.5, "text"],
    ["ok on ok-bg", ".done-mark", t.ok, t["ok-bg"], 4.5, "text"],
    ["wait on surface", ".status.warn, .check.warn, .lifetime.flag", t.wait, t.surface, 4.5, "text"],
    ["wait on wait-bg", ".alert, .mbanner", t.wait, t["wait-bg"], 4.5, "text"],
    ["ink on wait-bg", ".mbanner .mb-sub", t.ink, t["wait-bg"], 4.5, "text"],
    ["wait on soon-row tint", ".mrow.soonrow .mmeta.soon", t.wait, soon, 4.5, "text"],
    ["muted on soon-row tint", ".mrow.soonrow .mmeta", t.muted, soon, 4.5, "text"],
    ["err on surface", ".status.err, .danger-link, .del.armed, .mmeta.over", t.err, t.surface, 4.5, "text"],
    ["err on err-bg", ".alert.bad, .fatal", t.err, t["err-bg"], 4.5, "text"],
    ["#fff on err (today)", ".save.danger delete button (19px bold = large)", "#ffffff", t.err, 3, "text"],
    ["err-ink on err (proposed)", ".save.danger with --err-ink", t["err-ink"], t.err, 4.5, "text"],
    ["display-fg on display-bg", ".display pump readout values", t["display-fg"], t["display-bg"], 4.5, "text"],
    ["display labels (65% opacity)", ".display odd spans, 12px", mix(t["display-fg"], 0.65, t["display-bg"]), t["display-bg"], 4.5, "text"],
    ["bg on ink", ".chart .tip", t.bg, t.ink, 4.5, "text"],
    ["chart tip run text", ".chart .tip .run, 12px", mix(t.run, 0.55, t.bg), t.ink, 4.5, "text"],
    // non-text (1.4.11)
    ["line on surface (today)", "input, .btn2, .msel, .card borders", t.line, t.surface, 3, "ui"],
    ["line-strong on surface (proposed)", "control borders, switch tracks", t["line-strong"], t.surface, 3, "ui"],
    ["line-strong on bg (proposed)", "control borders on the page", t["line-strong"], t.bg, 3, "ui"],
    ["focus ring on surface", ":focus-visible accent outline", t.accent, t.surface, 3, "ui"],
    ["focus ring on bg", ":focus-visible accent outline", t.accent, t.bg, 3, "ui"],
    ["selected tab fill", ".tab[aria-selected] accent vs .tabs surface", t.accent, t.surface, 3, "ui"],
    ["invalid border", "input[aria-invalid] err border", t.err, t.surface, 3, "ui"],
    ["file-drop border", ".filebtn dashed border", dropBorder, t.surface, 3, "ui"],
    ["tab-bar dot (today)", ".tabbar .dot display-fg", t["display-fg"], bar, 3, "ui"],
    ["tab-bar dot as err (proposed)", "jar dot in the Settings mockups", t.err, bar, 3, "ui"],
    ["chart MPG line", "accent stroke on surface", t.accent, t.surface, 3, "ui"],
    ["chart running line", "run stroke on surface", t.run, t.surface, 3, "ui"],
    ["step bar (off)", ".steps li vs surface", t.line, t.surface, 3, "ui"],
  ];
};

// ---- per-palette fixes ----
// --line-strong: the palette's muted, mixed toward surface as far as it can go while keeping >= 3.4:1 (the designer's Green margin) on surface and bg
const lineStrong = t => { for (let p = 0.2; p <= 1.0001; p += 0.01) { const c = mix(t.muted, p, t.surface); if (Math.min(ratio(c, t.surface), ratio(c, t.bg)) >= 3.4) return c; } return t.muted; };
// --err-ink: whichever of white / the palette's accent-ink / near-black gives the most contrast on --err
const errInk = t => ["#ffffff", t["accent-ink"], "#1a0b0a"].reduce((b, c) => ratio(c, t.err) > ratio(b, t.err) ? c : b);

// --ok (only where it misses 4.5 on --ok-bg): darken toward black until >= 4.6
const okFix = t => { for (let p = 1; p >= 0.5; p -= 0.01) { const c = mix(t.ok, p, "#000000"); if (ratio(c, t["ok-bg"]) >= 4.6) return c; } };
// smallest share that passes everywhere, for the three color-mix / opacity rules in app.css
const minShare = (make, need) => { for (let p = 0.3; p <= 1.0001; p += 0.05) if (PALS.every(([k]) => ["light", "dark"].every(m => { const t = { ...tokens(k, m), ...PROPOSED[m] }; const [fg, bg] = make(t, p); return ratio(fg, bg) >= need; }))) return +p.toFixed(2); };

const out = [];
const results = [];
for (const [key, name] of PALS) for (const mode of ["light", "dark"]) {
  const t = { ...tokens(key, mode), ...PROPOSED[mode] };
  const rows = pairs(t).map(([pair, where, fg, bg, need, kind]) => ({ pair, where, fg, bg, need, kind, r: ratio(fg, bg) }));
  const fix = { "line-strong": lineStrong(t), "err-ink": errInk(t) };
  if (ratio(t.ok, t["ok-bg"]) < 4.5) { fix.ok = okFix(t); fix.okR = ratio(fix.ok, t["ok-bg"]); }
  fix.lsS = ratio(fix["line-strong"], t.surface); fix.lsB = ratio(fix["line-strong"], t.bg); fix.ei = ratio(fix["err-ink"], t.err);
  results.push({ key, name, mode, rows, fix, t });
}

const f = n => n.toFixed(2);
let fails = 0;
for (const { name, mode, rows, fix } of results) {
  if (MD) out.push(`### ${name}, ${mode}\n\n| Pair | Used by | Colors | Ratio | Needs | Result |\n|---|---|---|---|---|---|`);
  else out.push(`\n== ${name} ${mode}`);
  for (const x of rows) {
    const ok = x.r >= x.need, proposed = x.pair.includes("proposed");
    if (!ok && !proposed) fails++;
    const res = ok ? (x.r < x.need + 0.1 ? "Pass (no margin)" : "Pass") : "**Fail**";
    if (MD) out.push(`| ${x.pair} | ${x.where} | \`${x.fg}\` on \`${x.bg}\` | ${f(x.r)} | ${x.need} | ${res} |`);
    else out.push(`${ok ? "  ok " : "FAIL "} ${f(x.r).padStart(5)} / ${x.need}  ${x.pair}  (${x.fg} on ${x.bg})`);
  }
  const fixLine = `Per-palette fix: --line-strong ${fix["line-strong"]} (${f(fix.lsS)} on surface, ${f(fix.lsB)} on bg); --err-ink ${fix["err-ink"]} (${f(fix.ei)} on err)` + (fix.ok ? `; --ok ${fix.ok} (${f(fix.okR)} on ok-bg)` : "");
  out.push(MD ? `\n${fixLine}\n` : "  " + fixLine);
}
out.push(`\nRule fixes (smallest share passing in all 14 themes):`,
  `  .display label opacity: ${minShare((t, p) => [mix(t["display-fg"], p, t["display-bg"]), t["display-bg"]], 4.5)}`,
  // here less --run means more contrast, so search the largest passing share (1 - p of bg)
  `  .chart .tip .run run share (largest passing): ${+(1 - minShare((t, p) => [mix(t.run, 1 - p, t.bg), t.ink], 4.5)).toFixed(2)}`,
  `  .filebtn border accent share over --line: ${minShare((t, p) => [mix(t.accent, p, t.line), t.surface], 3)}; over --line-strong: ${minShare((t, p) => [mix(t.accent, p, t["line-strong"]), t.surface], 3)}`);
console.log(out.join("\n"));
if (!MD) { console.log(`\n${fails} current failure(s) (proposed-token rows not counted)`); process.exitCode = fails ? 1 : 0; }
