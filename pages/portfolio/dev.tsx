import PageTitle from "components/page-title";
import Showcase from "components/showcase";
import ParticipateShowcaseItem from "./participate/showcase-item";
import OpenSourceShowcase from "components/open-source-showcase";
import GamefrootShowcaseItem from "./gamefroot/showcase-item";
import PhaserShowcaseItem from "./phaser/showcase-item";
import TogetherooShowcaseItem from "./togetheroo/showcase-item";
import FinancialLiteracyShowcaseItem from "./financial-literacy/showcase-item";
import TechnicalWritingShowcase from "components/technical-writing-showcase";
import ArtDevShowcase from "components/art-dev-showcase";
import Section from "components/container/section";

function DevelopmentPage() {
  return (
    <main>
      <PageTitle>Development</PageTitle>
      <Section>
        <h1>Development</h1>
        <p>
          As a developer, I build web apps and game-like tools, often focused on education. Projects
          range from working on game engines intended to teach programming to digital card games for
          teachers to help them plan lessons.
        </p>
        <p>
          In my off time, I also maintain a set of open source tools on GitHub, write about
          programming and use code as my medium to produce art.
        </p>
        <p>
          Below is a selection of my work. If you want to learn more, or want to know what else I've
          worked on, drop me a line.
        </p>
      </Section>
      <Section>
        <h2>Web Apps, Games and Tools</h2>
        <Showcase>
          <ParticipateShowcaseItem />
          <GamefrootShowcaseItem />
          <PhaserShowcaseItem />
          <FinancialLiteracyShowcaseItem />
          <TogetherooShowcaseItem />
        </Showcase>
      </Section>
      <Section>
        <h2>Selected Open Source Work</h2>
        <OpenSourceShowcase />
      </Section>
      <Section>
        <h2>Technical Writing</h2>
        <TechnicalWritingShowcase />
      </Section>
      <Section>
        <h2>Code-Based Art</h2>
        <ArtDevShowcase />
      </Section>
    </main>
  );
}

export default DevelopmentPage;
