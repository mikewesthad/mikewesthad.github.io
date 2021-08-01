import Section from "components/container/section";
import Main from "components/main";
import PageTitle from "components/page-title";

function TeachingPage() {
  return (
    <Main>
      <PageTitle>Teaching</PageTitle>
      <Section>
        <h1>Teaching Porfolio</h1>
        <p>Coming soon!</p>
        <p>
          This website is in the process of being updated. This page will feature selected
          classes/workshops/etc. soon. Check back in a couple days 📅.
        </p>
        <p>For now, here's a list of some recent classes:</p>
        <ul>
          <li>
            Web App Programming (
            <a href="https://www.youtube.com/watch?v=OnYyB0_lzcg&list=PL-LDQE9x9hLwUAESe_YJxhXU5ZjLgtq4S&index=2">
              YouTube
            </a>
            ) at Columbia College Chicago.
          </li>
          <li>
            Intro to Programming in C# (
            <a href="https://www.youtube.com/watch?v=9TqENGhldWs&list=PL-LDQE9x9hLwldZPPGwqXixr-_DfINfxk&index=2">
              YouTube
            </a>
            ) at Columbia College Chicago.
          </li>
          <li>Code Sprints at Columbia College Chicago.</li>
          <li>Game Engine Scripting at Columbia College Chicago.</li>
          <li>
            Web Art (<a href="https://www.mikewesthad.com/saic-webart/">Class Site</a>) at The
            School of the Art Institute of Chicago.
          </li>
          <li>
            Interactive 3D (
            <a href="https://www.mikewesthad.com/uic-interactive3d-spring2017/">Class Site</a>) at
            University of Illinois Chicago.
          </li>
          <li>
            Game Play (<a href="https://www.mikewesthad.com/uic-gameplay-spring2017/">Class Site</a>
            ) at University of Illinois Chicago.
          </li>
          <li>
            Creative Coding Workshops at Uptake and Lafayette College (
            <a href="https://github.com/mikewesthad/lafayette-creative-coding-p5-workshop">
              materials
            </a>
            ).
          </li>
        </ul>
      </Section>
    </Main>
  );
}

export default TeachingPage;
