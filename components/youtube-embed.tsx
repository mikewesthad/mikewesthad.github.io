import React from "react";

interface YouTubeEmbedProps {
  width: string | number;
  height: string | number;
  videoId: string;
  playlistId?: string;
}

// If more control is needed, see: https://developers.google.com/youtube/player_parameters.
function YouTubeEmbed({ width, height, videoId, playlistId }: YouTubeEmbedProps) {
  let url = `https://www.youtube.com/embed/${videoId}`;
  if (playlistId) {
    url += `?list=playlistId`;
  }
  return (
    <iframe
      width={width}
      height={height}
      src={url}
      frameBorder="0"
      allow="autoplay; encrypted-media"
      allowFullScreen
    ></iframe>
  );
}

export default YouTubeEmbed;
export type { YouTubeEmbedProps };
