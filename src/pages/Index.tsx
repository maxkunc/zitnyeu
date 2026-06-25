import { useEffect } from "react";
import { Nav } from "@/components/site/Nav";
import { Hero } from "@/components/site/Hero";
import { About } from "@/components/site/About";
import { Achievements } from "@/components/site/Achievements";
import { Projects } from "@/components/site/Projects";
import { Workshops } from "@/components/site/Workshops";
import { Sponsors } from "@/components/site/Sponsors";
import { Support } from "@/components/site/Support";
import { Contacts } from "@/components/site/Contacts";

export default function IndexPage() {
  useEffect(() => {
    document.title = "zitny.eu — Mladí inženýři s pohledem k hvězdám";
  }, []);
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
