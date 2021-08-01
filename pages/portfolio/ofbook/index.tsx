import ProjectPage from "components/project-page";
import ImageGallery from "components/image-gallery";
import Section from "components/container/section";
import image1 from "./images/ofbook-1.png";
import image2 from "./images/ofbook-3.png";
import image3 from "./images/ofbook-4.png";
import image4 from "./images/ofbook-6.png";
import image5 from "./images/fig-2.png";
import image6 from "./images/fig-3.png";

function OFBook() {
  return (
    <ProjectPage pageTitle="ofBook" backTo="dev">
      <Section>
        <h1>ofBook</h1>
      </Section>
      <Section>
        <h2>Overview</h2>
        <p>
          ofBook is an open source book about creative coding in C++ using the{" "}
          <a href="http://openframeworks.cc/">openFrameworks</a> library. It covers everything from
          getting started to iOS applications to game design. ofBook is available online as a web
          book <a href="http://openframeworks.cc/ofBook/chapters/foreword.html">here</a>.
        </p>
        <p>
          I wrote two chapters on graphics for the book.{" "}
          <a href="http://openframeworks.cc/ofBook/chapters/intro_to_graphics.html">
            Introduction to Graphics
          </a>{" "}
          is a chapter that guides the reader through the world of 2D graphics by creating complex
          forms from simple shapes.{" "}
          <a href="http://openframeworks.cc/ofBook/chapters/generativemesh.html">
            Generative Meshes
          </a>{" "}
          is a chapter about generating 3D graphics by applying simple rules to some data.
        </p>
        <p>
          I also helped develop the pipelines that convert the source material of the book into a
          formatted web book and a PDF book. See more in the the{" "}
          <a href="https://github.com/openframeworks/ofBook">GitHub repository</a>.
        </p>
      </Section>
      <ImageGallery images={[image1, image2, image3, image4, image5, image6]} />
    </ProjectPage>
  );
}

export default OFBook;
