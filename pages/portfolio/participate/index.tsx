import ImageGallery from "components/image-gallery";
import ProjectPage from "components/project-page";
import sdgImage3 from "./images/sdg-3.png";
import sdgImage4 from "./images/sdg-4.png";
import sdgImage5 from "./images/sdg-5.png";
import sdgImage6 from "./images/sdg-6.png";
import sdgImage7 from "./images/sdg-7.png";
import sdgImage8 from "./images/sdg-8.png";
import quizImage1 from "./images/quiz-1.png";
import quizImage2 from "./images/quiz-2.png";
import quizImage4 from "./images/quiz-4.png";
import quizImage7 from "./images/quiz-7.png";

import Section from "components/container/section";

function Participate() {
  return (
    <ProjectPage backTo="dev">
      <Section>
        <h1>Educator Tools for Participate</h1>
      </Section>
      <Section>
        <h2>Overview</h2>
        <p>
          I designed and developed two serious games for educators (React, JS) that drew new users
          into the <a href="https://www.participate.com/">Participate</a> platform and helped
          existing users develop new lesson plans.
        </p>
        <p>
          Participate is a platform that helps organizations build online communities for
          collaboration and knowledge creation. In this collaboration, we were focused on building
          new experiences for the community of teachers around the United Nation's{" "}
          <a href="https://sdgs.un.org/goals">Sustainable Development Goals</a> (SDGs), a set of
          goals for achieving a better and more sustainable future for everyone.
        </p>
      </Section>
      <Section>
        <h2>Unit Planning Card Game</h2>
        <p>
          The unit planning card game (
          <a href="https://explore.participate.com/unit-planning-game">play</a>) helps teachers plan
          new units around the SDGs through picking cards from three decks - goals, solutions and
          teaching standards. Players pick an SDG card (e.g. ending hunger) they want to address,
          select an idea for solution card (e.g. change policy) and then standards cards (e.g. the
          reading standard of evaluate an argument). The app then generates a downloadable unit plan
          based on those cards that teachers can use to jumpstart the planning process.
        </p>
      </Section>
      <ImageGallery images={[sdgImage3, sdgImage4, sdgImage5, sdgImage6, sdgImage7, sdgImage8]} />
      <Section>
        <h2>Find Your Action Plan Quiz</h2>
        <p>
          In the "Find Your Action Plan" quiz (
          <a href="https://explore.participate.com/find-your-action-plan">play</a>), teachers and/or
          students answer a series of short questions and then are presented with a personalized
          activity they can do to make a difference in the world (e.g. plant a pollinator garden or
          remix a sexist ad). Each activity comes with a PDF explaining how to get started and how
          to connect it with teaching standards.
        </p>
      </Section>
      <ImageGallery images={[quizImage1, quizImage2, quizImage4, quizImage7]} />
    </ProjectPage>
  );
}

export default Participate;
