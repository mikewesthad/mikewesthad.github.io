import Image from "next/image";
import ProjectPage from "components/project-page";
import ImageGallery from "components/image-gallery";
import image1 from "./images/togetheroo-1.png";
import image2 from "./images/togetheroo-2.png";
import YouTubeEmbed from "components/youtube-embed";
import Section from "components/container/section";

function Phaser() {
  return (
    <ProjectPage backTo="dev">
      <Section>
        <h1>Togetheroo</h1>
      </Section>
      <Section>
        <h2>Overview</h2>
        <p>
          I worked with the founder to build a real-time video chat platform, 
          <a href="https://togetheroo.com">Togetheroo</a>. The mission was to create a platform that
          connects family members over long distance. While video chatting, users can open a shared
          play space to play kid-friendly games and other educational apps. The current application
          library includes a collaborative drawing application and a mix-and-match smoothie game.
          See Bart Yeary’s (founder) demo and introduction videos below.
        </p>
        <p>
          Development was paused in 2016, but you can open up a play space 
          <a href="https://togetheroo.com/playspace">here</a> and invite a friend.
        </p>
      </Section>
      <ImageGallery>
        <Image src={image1} />
        <Image src={image2} objectFit="cover" />
      </ImageGallery>
      <Section>
        <YouTubeEmbed width="100%" height="400" videoId="wmhcIe4w8Q0"></YouTubeEmbed>
        <YouTubeEmbed width="100%" height="400" videoId="g3iunJW8spg"></YouTubeEmbed>
      </Section>
    </ProjectPage>
  );
}

export default Phaser;
