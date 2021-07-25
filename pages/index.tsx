import * as React from "react";
import Image from "next/image";
import Link from "../components/link";
import profileImage from "../images/mike-hadley-profile.jpg";
import PageTitle from "../components/page-title";

const IndexPage = () => {
  return (
    <main>
      <PageTitle>Home</PageTitle>
      <Image src={profileImage} alt="Mike Hadley"></Image>
      <p>Hi, I’m Mike Hadley.</p>
      <p>
        I’m a <Link href="/">developer</Link>, <Link href="/">educator</Link> and{" "}
        <Link href="/">artist</Link> who translates creative ideas into code and teaches others how
        to do the same. My mission is to make the world of technology more accessible – both in
        terms of who has access to learning materials as well as through introducing people to the
        creative side of technology.
      </p>
      <p>
        Have a creative vision that you want to bring to life? Get in touch and let’s <a>chat</a>.
      </p>
    </main>
  );
};

export default IndexPage;
