import Image from "next/image";
import ProjectPage from "components/project-page";
import ImageGallery from "components/image-gallery";
import image1 from "./images/phaser-1.png";
import image2 from "./images/phaser-newsletter-1.png";
import Section from "components/container/section";

function Phaser() {
  return (
    <ProjectPage backTo="dev">
      <Section>
        <h1>Phaser</h1>
      </Section>
      <Section>
        <h2>Overview</h2>
        <p>
          I designed and modernized key parts of the API for the popular JS game engine Phaser
          (&gt;30K GitHub stars) as the engine moved between major versions. I produced thoroughly
          tested code with extensive JSDocs and produced 40 guided and annotated code examples for
          the engine's newsletter (example), which has &gt;8800 developers subscribed.
        </p>
        <p>
          While I was solely responsible for my parts of the API, it also meant collaborating with a
          small team of other developers in a fast moving repository.
        </p>
      </Section>
      <ImageGallery>
        <Image src={image1} placeholder="blur" />
        <Image src={image2} placeholder="blur" />
      </ImageGallery>
    </ProjectPage>
  );
}

export default Phaser;
