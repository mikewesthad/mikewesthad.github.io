import { IoLogoGithub, IoLogoLinkedin, IoLogoYoutube } from "react-icons/io5";
import IconLink from "./icon-link";

const GitHubIconLink = () => (
  <IconLink href="https://github.com/mikewesthad">
    <IoLogoGithub />
  </IconLink>
);

const LinkedInIconLink = () => (
  <IconLink href="https://www.linkedin.com/in/michaelwesthadley/">
    <IoLogoLinkedin />
  </IconLink>
);

const YouTubeIconLink = () => (
  <IconLink href="https://www.youtube.com/user/mikewesthad">
    <IoLogoYoutube />
  </IconLink>
);

export { LinkedInIconLink, GitHubIconLink, YouTubeIconLink };
