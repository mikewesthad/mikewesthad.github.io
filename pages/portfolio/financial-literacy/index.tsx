import Image from "next/image";
import ProjectPage from "components/project-page";
import Section from "components/container/section";
import ImageGallery from "components/image-gallery";
import image1 from "./images/loan-1.png";
import image2 from "./images/loan-2.png";
import image3 from "./images/loan-3.png";
import image4 from "./images/credit-1.png";
import image5 from "./images/credit-3.png";
import image6 from "./images/credit-4.png";
import image7 from "./images/budget-1.png";
import image8 from "./images/budget-2.png";

function Phaser() {
  return (
    <ProjectPage backTo="dev">
      <Section>
        <h1>Financial Literacy Games</h1>
      </Section>
      <Section>
        <h2>Overview</h2>
        <p>
          As part of my role as Learning Product Developer at{" "}
          <a href="https://www.colum.edu/">Columbia College Chicago</a>, I created a series of
          digital games and tools for partner organizations. One of those partners was the{" "}
          <a href="https://www.econcouncil.org/">Economic Awareness Council</a>, a non-profit whose
          mission is equip youth with the skills needed to make economic and financial decisions. I
          designed and developed a series of serious games (JS, React) for them around financial
          literacy, which have reached thousands of Chicago youth so far.
        </p>
        <p>
          These games and tools were launched as part of "learning playlists" on financial literacy,
          a sequence of resources, activities and videos designed to teach Chicago youth important
          concepts like budgeting and credit.
        </p>
      </Section>
      <ImageGallery images={[image1, image2, image3, image4, image5, image6, image7, image8]} />
    </ProjectPage>
  );
}

export default Phaser;
