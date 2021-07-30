import Image from "next/image";
import Container from "components/container";
import ProjectPage from "components/project-page";
import ImageGallery from "components/image-gallery";
import image1 from "./images/budget-1.png";
import image2 from "./images/credit-power-1.png";

function Phaser() {
  return (
    <ProjectPage backTo="dev">
      <Container tagName="section">
        <h1>Financial Literacy Games</h1>
      </Container>
      <Container tagName="section">
        <h2>Overview</h2>
        <p>
          As part of my role as Learning Product Developer at Columbia College Chicago, I created
          digital games and tools for partner organizations. I designed and developed a series of
          serious games (JS, React) for clients around topics like financial literacy for the{" "}
          <a href="https://www.econcouncil.org/">Economic Awareness Council</a> and{" "}
          <a href="https://www.home.lrng.org/">LRNG</a>, which reached thousands of Chicago youth.
        </p>
        <p>
          These games and tools were launched as part of "learning playlists" on financial literacy,
          a sequence of resources, activities and videos designed to teach Chicago youth important
          concepts like budgeting and credit.
        </p>
      </Container>
      <ImageGallery>
        <Image src={image1} />
        <Image src={image2} />
      </ImageGallery>
    </ProjectPage>
  );
}

export default Phaser;
