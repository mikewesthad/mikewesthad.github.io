import Image from "next/image";
import ProjectPage from "components/project-page";
import ImageGallery from "components/image-gallery";
import image1 from "./images/togetheroo-1.png";
import image2 from "./images/togetheroo-2.png";
import image3 from "./images/togetheroo-3.png";
import image4 from "./images/togetheroo-4.png";
import image5 from "./images/togetheroo-5.png";
import image6 from "./images/togetheroo-6.png";
import image7 from "./images/togetheroo-7.png";
import YouTubeEmbed from "components/youtube-embed";
import Section from "components/container/section";

function Phaser() {
  return (
    <ProjectPage pageTitle="Togetheroo" backTo="dev">
      <Section>
        <h1>Togetheroo</h1>
      </Section>
      <Section>
        <h2>Overview</h2>
        <p>
          I worked with Bart Yeary (founder, designer) to build a real-time video chat platform, 
          <a href="https://togetheroo.com">Togetheroo</a>. The mission was to create a platform that
          connects family members over long distance. While video chatting, users can open a shared
          play space to play kid-friendly games and other educational apps. The current application
          library includes a collaborative drawing application and a mix-and-match smoothie game.
        </p>
        <p>
          Development was paused in 2016, but you can open up a play space 
          <a href="https://togetheroo.com/playspace">here</a> and invite a friend. See the founder's
          demos and introduction videos below.
        </p>
      </Section>
      <ImageGallery images={[image1, image3, image2, image4]} />
      <Section>
        <YouTubeEmbed width="100%" height="400" videoId="8OP9vCfPxIU" />
      </Section>
      <Section>
        <YouTubeEmbed width="100%" height="400" videoId="VcAhOZSEwDY" />
      </Section>
    </ProjectPage>
  );
}

export default Phaser;
