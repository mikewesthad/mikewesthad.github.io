import PageTitle from "components/page-title";
import Showcase from "components/showcase";
import Container from "components/container";
import ParticipateShowcaseItem from "./participate/participate-showcase-item";
import OpenSourceShowcase from "components/open-source-showcase";
import GamefrootShowcaseItem from "./gamefroot/gamefroot-showcase-item";
import PhaserShowcaseItem from "./phaser/phaser-showcase-item";
import TogetherooShowcaseItem from "./togetheroo/showcase-item";
import FinancialLiteracyShowcaseItem from "./financial-literacy/showcase-item";
import TechnicalWritingShowcase from "components/technical-writing-showcase";
import ArtDevShowcase from "components/art-dev-showcase";

function DevelopmentPage() {
  return (
    <Container tagName="main">
      <PageTitle>Development</PageTitle>
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
      <h2>Web Apps, Games and Tools</h2>
      <Showcase>
        <ParticipateShowcaseItem />
        <GamefrootShowcaseItem />
        <PhaserShowcaseItem />
        <FinancialLiteracyShowcaseItem />
        <TogetherooShowcaseItem />
      </Showcase>
      <h2>Selected Open Source Work</h2>
      <OpenSourceShowcase />
      <h2>Technical Writing</h2>
      <TechnicalWritingShowcase />
      <h2>Code-Based Art</h2>
      <ArtDevShowcase />
    </Container>
  );
}

export default DevelopmentPage;
