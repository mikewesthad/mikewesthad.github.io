import Image from "next/image";
import Link from "components/link";
import profileImage from "images/mike-hadley-profile.jpg";
import PageTitle from "components/page-title";
import Container from "components/container";

const Grid = ({ children }: { children: React.ReactNode }) => (
  <div>
    {children}
    <style jsx>{`
      div {
        display: flex;
        justify-content: space-between;
      }
    `}</style>
  </div>
);

const IndexPage = () => {
  return (
    <Container tagName="main">
      <PageTitle>Home</PageTitle>
      <Grid>
        <div>
          <h1>Hi 👋, I’m Mike Hadley</h1>
          <h2>Mission Statement</h2>
          <p>
            I’m a developer, educator and artist who translates creative ideas into code and teaches
            others how to do the same. My mission is to make the world of technology more accessible
            – both in terms of who has access to learning materials as well as through introducing
            people to the creative side of technology.
          </p>
        </div>
        <Image src={profileImage} alt="Mike Hadley" objectFit="scale-down" />
        <style jsx global>{`
          div {
          }
          img {
            border-radius: 50%;
          }
        `}</style>
      </Grid>
      <p>
        Have a creative vision that you want to bring to life? Get in touch and{" "}
        <Link href="/contact">let's chat</Link>.
      </p>
      <h2>Portfolio</h2>
      <p>Want to see examples of my work? It's broken down into the following categories:</p>
      <ul>
        <li>
          <Link href="/portfolio/dev">Development</Link>
        </li>
        <li>
          <Link href="/portfolio/edu">Teaching</Link>
        </li>
        <li>
          <Link href="/portfolio/art">Art</Link>
        </li>
      </ul>
    </Container>
  );
};

export default IndexPage;
