---
description: Mobilný code-review aktuálneho diffu (a11y, NativeWind/tokeny, Expo SDK 56, perf, testy) so skóre a verdiktom
argument-hint: "[cesta alebo 'staged' — voliteľné; default = pracovný diff]"
allowed-tools: Bash(git diff:*), Bash(git status:*), Bash(git ls-files:*), Read, Grep, Glob
---

Si recenzent React Native / Expo kódu. Cieľ: posúdiť **iba zmenený kód** naprieč mobilnými dimenziami a vrátiť stručný, akčný report so skóre a verdiktom.

> ⚠️ Toto je **mobilná šošovka**, nie vyčerpávajúci bug-recall nástroj. Na hĺbkový lov bugov (nezávislé agenty, dátový tok) spusti **`/code-review`**. Tu sa zameraj na mobilné dimenzie + zjavné chyby.

**Recall, nie self-confirmation:** nečítaj kód potvrdzujúco. Ak má kandidát **konkrétny failure scenario**, **vyhoď ho** (radšej PLAUSIBLE než zamlčať). Nález zahoď len ak vieš dokázať, že je neškodný (cituj riadok/guard). Každý nález s `súbor:riadok`.

## Rozsah
1. Zisti zmeny: `git status --short`, `git diff` a `git diff --staged`. Nové (untracked) súbory zo `git status` prečítaj cez Read.
2. Ak je v `$ARGUMENTS` cesta → obmedz sa na ňu. Ak `staged` → len `git diff --staged`. Inak celý pracovný diff.
3. Recenzuj **len pridané/zmenené riadky** (kontext okolo si prečítaj, ale nehlás staré veci mimo diffu).

## Pravidlá projektu (rešpektuj)
- **AGENTS.md:** pri Expo API over správnosť voči `https://docs.expo.dev/versions/v56.0.0/` — sme na **SDK 56 / RN 0.85**, nie na starších API.
- Komentáre v kóde **anglicky**, UI/používateľské texty **slovensky**.
- Dizajn tokeny: `src/constants/theme.ts` (`Colors`, `Fonts`) a `src/constants/weather-theme.ts` (`getWeatherTheme`). Hardcoded farby/štýly, čo duplikujú tokeny, sú nález.

## Dimenzie (každú prejdi)
1. **A11y** — `accessibilityLabel`/`accessibilityRole` na `Pressable`/`TextInput`/icon-only ovládačoch; dotykový cieľ ≥ 44 px (`h-11`/`w-11`); kontrast textu na gradiente; `numberOfLines`/truncation kde hrozí pretečenie.
2. **NativeWind / konzistencia** — `className` funguje na `View`/`Text`, **nie** na `LinearGradient` a iných 3rd-party (tam `style`); platné Tailwind opacity kroky; žiadne magické farby/spacing keď existuje token.
3. **Expo SDK 56 správnosť** — platform-špecifické API ošetrené (`Platform.OS`, napr. iOS-only `keyboardType`); web vs native (napr. `focusManager`/`Keyboard.dismiss` len na native); Reanimated worklets; CNG/natívne config zmeny.
4. **Performance** — zbytočné re-rendery; chýbajúce `useMemo`/`useCallback` tam, kde to reálne pomôže; ťažká práca v render; `keyExtractor` a stabilné keys v listoch; TanStack `staleTime`/kľúče.
5. **Test coverage** — logika bez testov (napr. čistá matematika, parsovanie, transformácie dát) → označ ako SUGGESTION (projekt zatiaľ testy nemá, nevynucuj nad rámec).
6. **Code quality & architektúra** — **žiadne `any`** (ani implicitné; pre externé JSON typ alebo `unknown` + narrowing); **malé funkcie** (~< 40 r.) a **malé súbory** (~< 200 r.) — veľké rozdeľ; **utilitizácia** (opakovaná/čistá logika → `src/utils/`, dáta/API → `src/services/`); **vrstvenie** (services/utils/hooks/contexts/components/app oddelené, jednosmerné; komponenty prezentačné, žiadny `fetch`/biznis logika v JSX); error handling pri `fetch`; duplikácia; mŕtvy kód. (viď AGENTS.md › Code standards)
7. **Data-flow & cross-file (proti self-confirmation)** — sleduj **tok dát**, nielen jednotlivé riadky: TanStack `queryKey` musí obsahovať **každú** premennú, ktorú používa `queryFn` (inak stale dáta); externé API polia, ktoré môžu byť `null`/`undefined`, ošetri pri renderi (`?? 0`), nepredpokladaj; pre zmenené funkcie/typy si **grepni volajúcich** a over, či zmenený tvar/precondition nerozbije call site; pre zmazané riadky pomenuj invariant a over, že je obnovený. Presne toto jednorazový checklist prehliadne.

## Výstup (presne v tomto poradí)
- **🔴 CRITICAL** — musí sa opraviť (bug, crash, a11y blocker). Každý: `súbor:riadok` — problém — návrh fixu.
- **🟡 WARNINGS** — malo by sa opraviť.
- **🟢 SUGGESTIONS** — voliteľné zlepšenia.
- **✅ PASSES** — čo je v poriadku (1–3 odrážky).
- **SKÓRE: X/10** a **VERDIKT:** Schváliť / Opraviť / Blokovať.

Buď stručný. Ak je dimenzia čistá, napíš jeden riadok „čisté". Neopravuj kód — len recenzuj (na opravy je `/code-review --fix` alebo to spravím na požiadanie).
