import Image from "next/image";
import ProjectPage from "components/project-page";
import Section from "components/container/section";
import ImageGallery from "components/image-gallery";
import image1 from "./images/codevolve-1.png";
import image2 from "./images/reading-html-3.png";
import image3 from "./images/reading-css-09.png";
import Link from "components/link";
import SocialPageMeta from "components/social-page-meta";

function Edovo() {
  return (
    <ProjectPage pageTitle="Edovo Web Dev Courses" backTo="dev">
      <SocialPageMeta
        title="Edovo Web Dev Courses"
        description="I created a pair of courses to help incarcerated individuals – who have no prior coding
        experience – start building employable, front-end web development skills."
        image={image3}
        path="/portfolio/edovo"
      />
      <Section>
        <h1>Edovo Web Dev Courses</h1>
      </Section>
      <Section>
        <h2>Overview</h2>
        <p>
          I created a pair of courses to help incarcerated individuals – who have no prior coding
          experience – start building employable, front-end web development skills. The courses were
          built for the <Link href="https://www.edovo.com/">Edovo</Link> tablet-based learning
          platform, which is available in facilities across the US.
        </p>
        <p>
          The courses take a hands-on and project-based approach to HTML & CSS. In each lesson of
          the courses, a new concept is introduced through readings & examples and then is
          immediately reinforced and practiced in an interactive coding lab.
        </p>
        <p>
          The coding labs were built with the{" "}
          <Link href="https://www.codevolve.com/">Codevolve</Link> coding environment which can
          check a student’s code as they type it. Using regular expressions, I could provide
          students with positive reinforcement for completing a step successfully, or give them
          directed hints and encouragement when they miss a step.
        </p>
      </Section>
      <ImageGallery images={[image2, image3, image1]} />
    </ProjectPage>
  );
}

export default Edovo;
