import css from "./index.module.scss";
import { GitHubIconLink, LinkedInIconLink, YouTubeIconLink } from "components/social-links";
import AnimatedEmoji from "components/animated-emoji";

const emoji = ["🌕", "🌖", "🌗", "🌘", "🌑", "🌒", "🌓", "🌔"];

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
      <div>
        <AnimatedEmoji emoji={emoji} className={css.emoji} frameMs={1500} />
      </div>
    </footer>
  );
}

export default Footer;
