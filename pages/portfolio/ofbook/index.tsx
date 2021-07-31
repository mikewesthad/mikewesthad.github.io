import Image from "next/image";
import ProjectPage from "components/project-page";
import ImageGallery from "components/image-gallery";
import image1 from "./images/tangents.png";
import image2 from "./images/intro-screenshot.png";
import image3 from "./images/meshes-screenshot.png";
import image4 from "./images/rotating.png";
import image5 from "./images/editing-vectors.png";
import Section from "components/container/section";

function OFBook() {
  return (
    <ProjectPage backTo="dev">
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
      <ImageGallery images={[image1, image2, image3, image4, image5]} />
    </ProjectPage>
  );
}

export default OFBook;
