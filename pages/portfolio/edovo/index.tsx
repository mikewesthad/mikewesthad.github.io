import Image from "next/image";
import Container from "components/container";
import ProjectPage from "components/project-page";
import ImageGallery from "components/image-gallery";
import image1 from "./images/codevolve-1.png";
import image2 from "./images/reading-html-3.png";
import image3 from "./images/reading-css-09.png";

function Edovo() {
  return (
    <ProjectPage backTo="dev">
      <Container tagName="section">
        <h1>Edovo Web Dev Courses</h1>
      </Container>
      <Container tagName="section">
        <h2>Overview</h2>
        <p>
          I created a pair of courses to help incarcerated individuals – who have no prior coding
          experience – start building employable, front-end web development skills. The courses were
          built for the <a href="https://www.edovo.com/">Edovo</a> tablet-based learning platform,
          which is available in facilities across the US.
        </p>
        <p>
          The courses take a hands-on and project-based approach to HTML & CSS. In each lesson of
          the courses, a new concept is introduced through readings & examples and then is
          immediately reinforced and practiced in an interactive coding lab.
        </p>
        <p>
          The coding labs were built with the <a href="https://www.codevolve.com/">Codevolve</a>{" "}
          coding environment which can check a student’s code as they type it. Using regular
          expressions, I could provide students with positive reinforcement for completing a step
          successfully, or give them directed hints and encouragement when they miss a step.
        </p>
      </Container>
      <ImageGallery>
        <Image src={image1} />
        <Image src={image2} />
        <Image src={image3} />
      </ImageGallery>
    </ProjectPage>
  );
}

export default Edovo;
