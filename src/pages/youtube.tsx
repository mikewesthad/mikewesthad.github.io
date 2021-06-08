import * as React from "react";
import Layout from "../components/layout";

const YouTubePage = () => {
  return (
    <Layout pageTitle="YouTube">
      <h1>YouTube</h1>
      <h2>Introduction to Programming in C#</h2>
      <iframe
        width="560"
        height="315"
        src="https://www.youtube.com/embed/9TqENGhldWs?list=PL-LDQE9x9hLwldZPPGwqXixr-_DfINfxk"
        frameBorder="0"
        allow="autoplay; encrypted-media"
        allowFullScreen
      ></iframe>

      <h2>Web Application Programming - Advanced Web Development (HTML/CSS/JS, React, Firebase)</h2>
      <iframe
        width="560"
        height="315"
        src="https://www.youtube.com/embed/OnYyB0_lzcg?list=PL-LDQE9x9hLwUAESe_YJxhXU5ZjLgtq4S"
        frameBorder="0"
        allow="autoplay; encrypted-media"
        allowFullScreen
      ></iframe>

      <h2>Code Sprints - Beginner Web App Development (HTML/CSS/JS, React, Firebase)</h2>
      <iframe
        width="560"
        height="315"
        src="https://www.youtube.com/embed/CLy35rh8DpA?list=PL-LDQE9x9hLyowrXuGkk53uVPbljucpdK"
        frameBorder="0"
        allow="autoplay; encrypted-media"
        allowFullScreen
      ></iframe>
    </Layout>
  );
};

export default YouTubePage;
