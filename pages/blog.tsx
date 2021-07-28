import * as React from "react";
import Image from "next/image";
import post1Thumbnail from "../images/blog/phaser-tilemaps-1.gif";
import post2Thumbnail from "../images/blog/phaser-tilemaps-2.gif";
import post3Thumbnail from "../images/blog/phaser-tilemaps-3.gif";
import post4Thumbnail from "../images/blog/phaser-tilemaps-4.gif";
import post5Thumbnail from "../images/blog/phaser-tilemaps-5.gif";
import PageTitle from "../components/page-title";
import Container from "../components/container/container";

type PostProps = {
  imageSrc: any;
  title: string;
  description: string;
  link: string;
};

const Post = ({ imageSrc, title, description, link }: PostProps) => {
  const linkStyle: React.CSSProperties = {
    position: "relative",
    display: "block",
    width: 150,
    height: 100,
  };
  return (
    <div>
      <a href={link} style={linkStyle}>
        <Image src={imageSrc} alt="" layout="fill" objectFit="contain" />
      </a>
      <h2>{title}</h2>
      <p>{description}</p>
      <a href={link}>Read →</a>
    </div>
  );
};

const BlogPage = () => {
  return (
    <Container>
      <PageTitle>Blog</PageTitle>
      <main>
        <h1>Blog</h1>
        <Post
          imageSrc={post5Thumbnail}
          title="Modular Game Worlds in Phaser 3 (Tilemaps #5) — Matter Physics"
          description="This is the final post in a series of blog posts about creating modular worlds in Phaser 3. In this edition, we’ll step up our Matter.js knowledge and build a puzzle-y physics platformer."
          link="https://medium.com/@michaelwesthadley/modular-game-worlds-in-phaser-3-tilemaps-5-matter-physics-platformer-d14d1f614557"
        />
        <Post
          imageSrc={post4Thumbnail}
          title="Modular Game Worlds in Phaser 3 (Tilemaps #4) — Meet Matter.js"
          description="This is the fourth post in a series of blog posts about creating modular worlds with tilemaps in the Phaser 3. In this edition, we’ll get acquainted with Matter.js."
          link="https://itnext.io/modular-game-worlds-in-phaser-3-tilemaps-4-meet-matter-js-abf4dfa65ca1"
        />
        <Post
          imageSrc={post3Thumbnail}
          title="Modular Game Worlds in Phaser 3 (Tilemaps #3) — Procedural Dungeon"
          description="This is the third post in a series of blog posts about creating modular worlds with tilemaps in Phaser 3. In this edition, we’ll create an endless, procedurally-generated dungeon."
          link="https://itnext.io/modular-game-worlds-in-phaser-3-tilemaps-3-procedural-dungeon-3bc19b841cd"
        />
        <Post
          imageSrc={post2Thumbnail}
          title="Modular Game Worlds in Phaser 3 (Tilemaps #2) — Dynamic Platformer"
          description="This is a blog post series about creating modular game worlds with tilemaps in Phaser 3. In this post, we’ll create a puzzle-y platformer where the player can draw platforms to get around obstacles."
          link="https://medium.com/@michaelwesthadley/modular-game-worlds-in-phaser-3-tilemaps-2-dynamic-platformer-3d68e73d494a"
        />
        <Post
          imageSrc={post1Thumbnail}
          title="Modular Game Worlds in Phaser 3 (Tilemaps #1) — Static Maps"
          description="This is a series of blog posts about creating modular worlds with tilemaps in the Phaser 3 game engine. In this first post, we’ll go from zero to a Pokemon-style top down game."
          link="https://medium.com/@michaelwesthadley/modular-game-worlds-in-phaser-3-tilemaps-1-958fc7e6bbd6"
        />
      </main>
    </Container>
  );
};

export default BlogPage;
