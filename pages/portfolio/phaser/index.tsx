import ProjectPage from "components/project-page";
import ImageGallery from "components/image-gallery";
import image1 from "./images/phaser-1.png";
import image2 from "./images/phaser-newsletter-1.png";
import image3 from "./images/phaser-example-1.png";
import image4 from "./images/phaser-example-2.png";
import image5 from "./images/phaser-example-3.png";
import image6 from "./images/phaser-example-4.png";
import Section from "components/container/section";
import Link from "components/link";

function Phaser() {
  return (
    <ProjectPage pageTitle="Phaser" backTo="dev">
      <Section>
        <h1>Phaser</h1>
      </Section>
      <Section>
        <h2>Overview</h2>
        <p>
          I designed and modernized key parts of the API for the popular JS game engine{" "}
          <Link href="https://phaser.io/">Phaser</Link> (&gt;30K{" "}
          <Link href="https://github.com/photonstorm/phaser">GitHub stars</Link>) as the engine
          moved between major versions. I produced thoroughly tested code with extensive
          documentation and produced 40 guided and annotated code examples for the engine&apos;s
          newsletter, which has &gt;8800 developers subscribed.
        </p>
        <p>A few links:</p>
        <ul>
          <li>
            <Link href="https://madmimi.com/p/d7093b">Example newsletter writeup</Link>
          </li>
          <li>
            <Link href="https://labs.phaser.io/view.html?src=src\tilemap\collision\matter%20platformer%20with%20wall%20jumping.js">
              Wall Jumping Platformer Example
            </Link>
          </li>
          <li>
            <Link href="https://labs.phaser.io/view.html?src=src\tilemap\collision\matter%20platformer%20modify%20map.js">
              Modifying Map Example
            </Link>
          </li>
          <li>
            <Link href="https://labs.phaser.io/view.html?src=src\tilemap\dungeon%20generator.js">
              Dungeon Generator Example
            </Link>
          </li>
        </ul>
        <p>
          While I was solely responsible for my areas of the API, it also meant collaborating with a
          small team of other developers in a fast moving repository.
        </p>
      </Section>
      <ImageGallery images={[image1, image2, image3, image4, image5, image6]} />
    </ProjectPage>
  );
}

export default Phaser;
