import { StaticImage } from "gatsby-plugin-image";
import * as React from "react";
import Layout from "../../components/layout";

const EncodedObjectsPage = () => {
  return (
    <Layout pageTitle="Work - Encoded Objects">
      <h1>Encoded Objects is an art collective focused on information and interactivity.</h1>
      <ul>
        <li>2017 - Present</li>
        <li>GitHub</li>
        <li>Tags: Art</li>
      </ul>
      <StaticImage
        src="./bound-lines.png"
        alt="Bound Lines"
        placeholder="tracedSVG"
        loading="eager"
      ></StaticImage>
      <h2>Overview</h2>
      <p>
        Encoded Objects explores how information and interactivity can augment our understandings of
        image & object making. These investigations re-envision our current conditions by
        considering the history of art and information through a technological lens. Founding
        members Mike Hadley and Jonathan Rockford integrate their varied experiences by merging the
        physical and digital realms into singular works of art.
      </p>
      <h2>Coming Soon</h2>
      <p>
        The above piece - Bound Lines (source code) - is a digital print that visualizes 18th
        century ship logs and reveals the “footprints” of sailors as they explored the world. More
        project documentation & Encoded Objects website coming soon.
      </p>
    </Layout>
  );
};

export default EncodedObjectsPage;
