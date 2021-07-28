import React from "react";
import { IoLogoGithub, IoLogoLinkedin, IoLogoYoutube } from "react-icons/io5";
import css from "./footer.module.scss";
import { GitHubIconLink, LinkedInIconLink, YouTubeIconLink } from "../social-links/social-links";

function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className={css.footerContainer}>
      <div>&copy; Michael Hadley {year}</div>
      <div className={css.socialLinks}>
        <GitHubIconLink />
        <LinkedInIconLink />
        <YouTubeIconLink />
      </div>
    </footer>
  );
}

export default Footer;
