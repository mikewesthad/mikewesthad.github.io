import Link from "components/link";
import { GitHubIconLink, LinkedInIconLink, YouTubeIconLink } from "components/social-links";
import NavLink from "./nav-link";
import css from "./index.module.scss";

function Nav() {
  return (
    <>
      <nav className={css.nav}>
        <Link href="/" className={`unstyled-link ${css.navLogo}`}>
          mikewesthad
        </Link>
        <ul className={css.navList}>
          <NavLink href="/" exact={true} tiltLeft={true}>
            Home
          </NavLink>
          <li className={css.dropdownTrigger}>
            <NavLink href="/portfolio" tiltLeft={false}>
              Portfolio▼
            </NavLink>
            <ul className={css.dropdownList}>
              <li>
                <NavLink href="/portfolio/dev" tiltLeft={true}>
                  Dev
                </NavLink>
              </li>
              <li>
                <NavLink href="/portfolio/edu" tiltLeft={false}>
                  Edu
                </NavLink>
              </li>
              <li>
                <NavLink href="/portfolio/art" tiltLeft={true}>
                  Art
                </NavLink>
              </li>
            </ul>
          </li>
          <li>
            <NavLink href="/blog" tiltLeft={true}>
              Blog
            </NavLink>
          </li>
          <li>
            <NavLink href="/contact" tiltLeft={false}>
              Contact
            </NavLink>
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
      </nav>
      <div className={css.divider} />
    </>
  );
}

export default Nav;
