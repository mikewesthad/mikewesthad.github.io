import PageTitle from "components/page-title";
import Showcase, { ShowcaseItem } from "components/showcase";
import phaserImage from "images/phaser/phaser-1.png";
import eacImage from "images/eac/budget-guessing.png";
import togetherooImage from "images/togetheroo/togetheroo-1.png";
import Container from "components/container";
import ParticipateShowcaseItem from "./participate/participate-showcase-item";
import OpenSourceShowcase from "components/open-source-showcase";
import GamefrootShowcaseItem from "./gamefroot/gamefroot-showcase-item";
import PhaserShowcaseItem from "./phaser/phaser-showcase-item";

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
        <ShowcaseItem
          href="#"
          image={eacImage}
          title="Financial Literacy Games"
          subtitle="Client: CCC"
        />
        <ShowcaseItem
          href="#"
          image={togetherooImage}
          title="Multiplayer Video Chat App"
          subtitle="Client: Togetheroo"
        />
      </Showcase>
      <h2>Open Source Tools</h2>
      <OpenSourceShowcase />
      <p>I make...</p>
      <h2>Art</h2>
      <p>I make...</p>
    </Container>
  );
}

export default DevelopmentPage;
