import Image from "next/image";
import Link from "components/link";
import PageTitle from "components/page-title";
import Section from "components/container/section";
import profileImage from "images/mike-hadley-profile.jpg";

const IndexPage = () => {
  return (
    <main>
      <PageTitle>Home</PageTitle>
      <Section>
        <figure>
          <Image
            src={profileImage}
            alt="Mike Hadley"
            layout="fill"
            objectFit="cover"
            placeholder="blur"
          />
        </figure>
        <style jsx>{`
          figure {
            position: relative;
            width: 10rem;
            height: 10rem;
            border-radius: 50%;
            overflow: hidden;
            margin: 0 auto;
          }
        `}</style>
      </Section>

      <Section>
        <h1>Hi 👋, I’m Mike Hadley</h1>
        <h2>Mission Statement</h2>
        <p>
          I’m a developer, educator and artist who translates creative ideas into code and teaches
          others how to do the same. My mission is to make the world of technology more accessible –
          both in terms of who has access to learning materials as well as through introducing
          people to the creative side of technology.
        </p>
        <p>
          Have a creative vision that you want to bring to life? Get in touch and{" "}
          <Link href="/contact">let's chat</Link>.
        </p>
      </Section>
      <Section>
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
      </Section>
    </main>
  );
};

export default IndexPage;
