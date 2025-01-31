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
import Link from "components/link";
import Main from "components/main";
import SocialPageMeta from "components/social-page-meta";
import ogImage from "images/og-dev.png";

function DevelopmentPage() {
  return (
    <Main>
      <PageTitle>Development</PageTitle>
      <SocialPageMeta
        title="Development Portfolio"
        description="Michael Hadley's portfolio as a developer."
        image={ogImage}
        path="/portfolio/dev"
      />
      <Section>
        <h1>Development</h1>
        <p>
          As a developer, I build web apps, games and playful tools, often focused on helping
          educators or learners engage with complex systems. Projects range from digital card games
          for teachers to help them plan new lessons, to interactive experiences that teach
          financial literacy concepts to youth.
        </p>
        <p>
          I also maintain a set of open source tools to make web game development easier, write
          about programming and use code as my medium to produce art installations.
        </p>
        <p>
          Below is a selection of my work. If you want to learn more, or want to know what else
          I&apos;ve worked on, <Link href="/contact">drop me a line</Link>.
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
    </Main>
  );
}

export default DevelopmentPage;
