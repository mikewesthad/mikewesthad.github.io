import * as React from "react";
import { StaticImage } from "gatsby-plugin-image";
import Layout from "../components/layout";
import { Link } from "gatsby";

const IndexPage = () => {
  return (
    <Layout pageTitle="Home">
      <StaticImage
        src="../images/mike-hadley-profile.jpg"
        alt="Mike Hadley"
        placeholder="tracedSVG"
        loading="eager"
        width={100}
        height={100}
      ></StaticImage>
      <p>Hi, I’m Mike Hadley.</p>
      <p>
        I’m a <Link to="">developer</Link>, <Link to="">educator</Link> and{" "}
        <Link to="">artist</Link> who translates creative ideas into code and teaches others how to
        do the same. My mission is to make the world of technology more accessible – both in terms
        of who has access to learning materials as well as through introducing people to the
        creative side of technology.
      </p>
      <p>
        Have a creative vision that you want to bring to life? Get in touch and let’s <a>chat</a>.
      </p>
    </Layout>
  );
};

export default IndexPage;
