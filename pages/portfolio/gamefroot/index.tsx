import ImageGallery from "components/image-gallery";
import ProjectPage from "components/project-page";
import gamefrootImage1 from "./images/gamefroot-1.png";
import gamefrootImage4 from "./images/gamefroot-4.png";
import gamefrootImage5 from "./images/gamefroot-5.png";
import gamefrootImage6 from "./images/gamefroot-6.png";
import Section from "components/container/section";
import Link from "components/link";

function Gamefroot() {
  return (
    <ProjectPage pageTitle="Gamefroot" backTo="dev">
      <Section>
        <h1>Gamefroot</h1>
      </Section>
      <Section>
        <h2>Overview</h2>
        <p>
          I rebuilt and modernized Gamefroot's game editor from the ground up (TypeScript, Phaser
          game engine, React). <a href="https://make.gamefroot.com/">Gamefroot</a> is a cloud-based
          platform for making 2D games. It aims to make learning how to design and code a game as
          accessible and exciting as possible.
        </p>
        <p>
          Their existing web game editor was built on their own custom game engine, which had become
          a drain on their development team to maintain. They brought me in based on{" "}
          <Link href="/portfolio/phaser">my game engine work</Link> to rebuild their editor in a
          more maintainable way and add new features to their platform.
        </p>
      </Section>
      <ImageGallery images={[gamefrootImage1, gamefrootImage4, gamefrootImage5, gamefrootImage6]} />
    </ProjectPage>
  );
}

export default Gamefroot;
