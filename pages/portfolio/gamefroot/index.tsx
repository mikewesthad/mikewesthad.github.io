import Image from "next/image";
import ImageGallery from "components/image-gallery";
import ProjectPage from "components/project-page";
import gamefrootImage1 from "./images/gamefroot-1.png";
import gamefrootImage2 from "./images/gamefroot-2.png";
import Section from "components/container/section";

function Gamefroot() {
  return (
    <ProjectPage backTo="dev">
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
          a drain on their development team to maintain. They brought me in based on my game engine
          work to rebuild their editor in the open source Phaser game engine and add new features to
          their platform.
        </p>
      </Section>
      <ImageGallery>
        <Image src={gamefrootImage1} />
        <Image src={gamefrootImage2} />
      </ImageGallery>
    </ProjectPage>
  );
}

export default Gamefroot;
