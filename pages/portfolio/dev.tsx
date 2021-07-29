import PageTitle from "components/page-title";
import Showcase, { ShowcaseItem } from "components/showcase";
import participateImage from "./participate/images/participate-action-plan-1.png";
import gamefrootImage from "images/gamefroot/gamefroot-1.png";
import phaserImage from "images/phaser/phaser-1.png";
import eacImage from "images/eac/budget-guessing.png";
import togetherooImage from "images/togetheroo/togetheroo-1.png";
import Container from "components/container";

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
        <ShowcaseItem
          image={participateImage}
          title="Games for Educators"
          subtitle="Client: Participate"
        />
        <ShowcaseItem
          image={gamefrootImage}
          title="Educational Game Engine"
          subtitle="Client: Gamefroot"
        />
        <ShowcaseItem
          image={phaserImage}
          title="Game Engine Development"
          subtitle="Client: Phaser"
        />
        <ShowcaseItem image={eacImage} title="Financial Literacy Games" subtitle="Client: CCC" />
        <ShowcaseItem
          image={togetherooImage}
          title="Multiplayer Video Chat App"
          subtitle="Client: Togetheroo"
        />
      </Showcase>
      <h2>Open Source Tools</h2>
      <p>I make...</p>
      <h2>Art</h2>
      <p>I make...</p>
    </Container>
  );
}

export default DevelopmentPage;
