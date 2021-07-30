import Image from "next/image";
import Container from "components/container";
import ImageGallery from "components/image-gallery";
import ProjectPage from "components/project-page";
import actionImage1 from "./images/participate-action-plan-1.png";
import actionImage2 from "./images/participate-action-plan-2.png";
import sdgImage1 from "./images/participate-sdg-1.png";
import sdgImage2 from "./images/participate-sdg-2.png";

function Participate() {
  return (
    <ProjectPage backTo="dev">
      <Container tagName="section">
        <h1>Participate</h1>
      </Container>
      <Container tagName="section">
        <h2>Overview</h2>
        <p>
          I designed and developed a pair of serious games for educators (React, JS) that drew new
          users into the <a href="https://www.participate.com/">Participate</a> platform and helped
          existing users develop new lessons.
        </p>
        <p>
          Participate is a platform that helps organizations build online communities for
          collaboration and knowledge creation. In this collaboration, we were focused on building
          new experiences for the community of teachers around the United Nation's
          <a href="https://sdgs.un.org/goals">Sustainable Development Goals</a> (SDGs), a set of
          goals for achieving a better and more sustainable future for all.
        </p>
      </Container>
      <Container tagName="section">
        <h2>Unit Planning Card Game</h2>
        <p>
          The unit planning card game helps teachers plan new units around the SDGs through picking
          cards from three decks - goals, solutions and reading/writing/math standards. Players pick
          an SDG (e.g. ending hunger) they want to address, select an idea for solution (e.g. change
          policy) and then standards (e.g. the reading standard of evaluate an argument). The app
          then generates a downloadable unit plan based on those cards that teachers can use to
          jumpstart the planning process.
        </p>
      </Container>
      <ImageGallery>
        <Image src={sdgImage1} />
        <Image src={sdgImage2} />
      </ImageGallery>
      <Container tagName="section">
        <h2>Find Your Action Plan Quiz</h2>
        <p>
          In the "Find Your Action Plan" quiz, teachers (or students) answer a series of short
          questions and then are presented with a personalized activity they can do to make a
          difference in the world (e.g. plant a pollinator garden or remix a sexist ad). Each
          activity comes with a PDF explaining how to get started and how to connect it with
          standards.
        </p>
      </Container>
      <ImageGallery>
        <Image src={actionImage1} />
        <Image src={actionImage2} />
      </ImageGallery>
    </ProjectPage>
  );
}

export default Participate;
