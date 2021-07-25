import * as React from "react";
import PageTitle from "../components/page-title";
import YouTubeEmbed from "../components/youtube-embed";

const YouTubePage = () => {
  return (
    <main>
      <PageTitle>YouTube</PageTitle>
      <h1>YouTube Playlists</h1>
      <h2>Introduction to Programming in C#</h2>
      <YouTubeEmbed
        width="560"
        height="315"
        videoId="9TqENGhldWs"
        playlistId="PL-LDQE9x9hLwldZPPGwqXixr-_DfINfxk"
      />

      <h2>Web Application Programming - Advanced Web Development (HTML/CSS/JS, React, Firebase)</h2>
      <YouTubeEmbed
        width="560"
        height="315"
        videoId="OnYyB0_lzcg"
        playlistId="PL-LDQE9x9hLwUAESe_YJxhXU5ZjLgtq4S"
      />

      <h2>Code Sprints - Beginner Web App Development (HTML/CSS/JS, React, Firebase)</h2>
      <YouTubeEmbed
        width="560"
        height="315"
        videoId="CLy35rh8DpA"
        playlistId="PL-LDQE9x9hLyowrXuGkk53uVPbljucpdK"
      />
    </main>
  );
};

export default YouTubePage;
