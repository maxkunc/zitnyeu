import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/site/Nav";
import { Hero } from "@/components/site/Hero";
import { About } from "@/components/site/About";
import { Achievements } from "@/components/site/Achievements";
import { Projects } from "@/components/site/Projects";
import { Workshops } from "@/components/site/Workshops";
import { Sponsors } from "@/components/site/Sponsors";
import { Support } from "@/components/site/Support";
import { Contacts } from "@/components/site/Contacts";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "zitny.eu — Mladí inženýři s pohledem k hvězdám" },
      { name: "description", content: "Nezisková organizace vyvíjející vesmírné projekty, satelity, stratosférické mise a vzdělávací workshopy pod patronací ESA." },
      { property: "og:title", content: "zitny.eu — Vesmírné projekty pro mladé" },
      { property: "og:description", content: "Projekty, workshopy a mise pod patronací ESA." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="relative">
      <Nav />
      <Hero />
      <About />
      <Achievements />
      <Projects />
      <Workshops />
      <Sponsors />
      <Support />
      <Contacts />
    </main>
  );
}
