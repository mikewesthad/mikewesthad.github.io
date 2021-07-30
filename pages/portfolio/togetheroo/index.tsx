import Image from "next/image";
import Container from "components/container";
import ProjectPage from "components/project-page";
import ImageGallery from "components/image-gallery";
import image1 from "./images/togetheroo-1.png";
import image2 from "./images/togetheroo-2.png";
import YouTubeEmbed from "components/youtube-embed";

function Phaser() {
  return (
    <ProjectPage backTo="dev">
      <Container tagName="section">
        <h1>Togetheroo</h1>
      </Container>
      <Container tagName="section">
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
      </Container>
      <ImageGallery>
        <Image src={image1} />
        <Image src={image2} objectFit="cover" />
      </ImageGallery>
      <Container tagName="section">
        <YouTubeEmbed width="100%" height="400" videoId="wmhcIe4w8Q0"></YouTubeEmbed>
        <YouTubeEmbed width="100%" height="400" videoId="g3iunJW8spg"></YouTubeEmbed>
      </Container>
    </ProjectPage>
  );
}

export default Phaser;
