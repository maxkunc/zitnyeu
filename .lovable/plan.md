## Co udělám

### 1) `src/components/site/Projects.tsx` — odstranit prokliky projektů
- Nahradit všechny `<Link to="/projekty/$id" …>` (3 sekce: major / minor / past) za obyčejné `<div>` (ponechat stylování karet, odebrat hover-translate/ring focus efekty vázané na klikání).
- Odstranit ikonu `ArrowUpRight` z nadpisů karet (vizuálně signalizuje proklik) i z importu.
- Odstranit import `Link` z `@tanstack/react-router`.
- Soubor route `src/routes/projekty.$id.tsx` ponechat beze změny (proklik jen není navigovaný z hlavní stránky; pokud chceš, můžu route smazat — řekni).

### 2) `src/routes/admin.tsx` — schovat mock účty u loginu
- Smazat blok řádky 164–169 (seznam "Účty (3): admin/esa2026, koordinator/stratos, editor/rocket").
- Placeholder uživatelského pole zkrátit na neutrální `"Uživatel"` (řádek 158), ať nenapovídá jména účtů.

### 3) `src/components/site/Contacts.tsx` — odebrat kontaktní formulář
- Z gridu odstranit celý `<form>` (řádky ~58–88) a stavy `form`, `sending`, `submit`, `schema`, importy `Input`, `Textarea`, `Button`, `addMessage`, `toast`, `z`, `useState`.
- Grid zjednodušit: kontaktní řádky (email/telefon) budou v jedné koloně, pod nimi krátká věta vyzývající k napsání na e-mail.
- Footer zůstává, ale odstraním `border-t border-border` (viz bod 5 — bez čar).

### 4) `src/components/site/Sponsors.tsx` — rámeček loga 1:1 vyplňující celý čtverec se zaoblenými rohy
- Změnit kontejner loga z `h-14 w-14 rounded-md bg-white/5 border border-border … p-1` na čtverec `aspect-square h-16 w-16 rounded-2xl bg-white/5 overflow-hidden` bez vnitřního paddingu.
- `<img>` na `h-full w-full object-cover` (vyplní celou plochu čtverce; pokud by to logo příliš ořezávalo, použiji `object-contain` bez paddingu — ale defaultně `cover` dle zadání "vyplňovaly celou plochu").
- Fallback iniciály vystředit do stejného `rounded-2xl` čtverce.

### 5) Nerozpoznatelné přechody mezi sekcemi (žádné čáry / crop lines)
- `src/components/site/Sponsors.tsx`: ponechat boční gradienty marquee, ale ujistit se, že žádná sekce nemá viditelný horní/dolní okraj.
- `src/components/site/Contacts.tsx`: odstranit `border-t border-border` z footeru, nahradit jemným odstupem (`mt-24 pt-8`).
- `src/styles.css`: přidat utility `.section-blend` (nebo upravit `section { … }`) — všechny `<section>` budou mít stejné `background: transparent` a žádné `border`/`outline`. Pro extra plynulost přidat jeden globální vertikální gradient přes `body`/`main` (např. `background: radial-gradient(...) , linear-gradient(...)`) tak, aby barva pozadí mezi sekcemi plynule přecházela a žádný řez nebyl viditelný.
- Projít rychle `Hero`, `About`, `Achievements`, `Workshops`, `Support` a odstranit případné `border-t` / `divide-y` / `hr` mezi sekcemi (pokud existují).

### Co se nezmění
- Logika store, i18n překlady (kromě případného odstranění klíčů formuláře, pokud už nebudou jinde použité — zkontroluji a smažu jen nepoužité).
- Backend, RLS, auth.
- Route `/projekty/$id` zůstane (jen nepřístupná z UI). Řekni, jestli ji mám smazat.
