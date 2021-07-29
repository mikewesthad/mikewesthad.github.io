import Link from "components/link";
import Container from "components/container/container";
import {
  GitHubIconLink,
  LinkedInIconLink,
  YouTubeIconLink,
} from "components/social-links/social-links";
import NavLink from "./nav-link";
import css from "./nav.module.scss";

function Nav() {
  return (
    <>
      <Container tagName="nav" className={css.nav}>
        <Link href="/" className={`unstyled-link ${css.navLogo}`}>
          mikewesthad
        </Link>
        <ul className={css.navList}>
          <NavLink href="/" exact={true}>
            Home
          </NavLink>
          <li className={css.dropdownTrigger}>
            <NavLink href="/work">Portfolio</NavLink>
            <ul className={css.dropdownList}>
              <li>
                <NavLink href="/work/dev">Dev</NavLink>
              </li>
              <li>
                <NavLink href="/work/edu">Edu</NavLink>
              </li>
              <li>
                <NavLink href="/work/art">Art</NavLink>
              </li>
            </ul>
          </li>
          <li>
            <NavLink href="/blog">Blog</NavLink>
          </li>
          <li>
            <NavLink href="/contact">Contact</NavLink>
          </li>
          <li>
            <ul className={css.socialLinks}>
              <li>
                <GitHubIconLink />
              </li>
              <li>
                <LinkedInIconLink />
              </li>
              <li>
                <YouTubeIconLink />
              </li>
            </ul>
          </li>
        </ul>
      </Container>
      <div className={css.divider} />
    </>
  );
}

export default Nav;
