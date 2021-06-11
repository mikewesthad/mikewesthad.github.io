import React from "react";
import { IoLogoGithub, IoLogoLinkedin } from "react-icons/io5";
import { footerContainer, socialLinks } from "./footer.module.css";

function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className={footerContainer}>
      <div>&copy; Michael Hadley {year}</div>
      <div className={socialLinks}>
        <a href="https://github.com/mikewesthad">
          <IoLogoGithub />
        </a>
        <a href="https://www.linkedin.com/in/michaelwesthadley/">
          <IoLogoLinkedin />
        </a>
      </div>
    </footer>
  );
}

export default Footer;
