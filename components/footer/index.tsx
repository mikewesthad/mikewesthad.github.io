import css from "./index.module.scss";
import { GitHubIconLink, LinkedInIconLink, YouTubeIconLink } from "components/social-links";

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
