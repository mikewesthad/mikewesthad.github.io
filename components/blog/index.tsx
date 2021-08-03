import Main from "components/main";
import Section from "components/container/section";
import Post from "./post";
import PageTitle from "components/page-title";
import SocialPageMeta from "components/social-page-meta";
import css from "./index.module.scss";
import ogImage from "components/technical-writing-showcase/images/blog-1.png";
import post1Thumbnail from "./images/phaser-tilemaps-1.png";
import post2Thumbnail from "./images/phaser-tilemaps-2.png";
import post3Thumbnail from "./images/phaser-tilemaps-3.png";
import post4Thumbnail from "./images/phaser-tilemaps-4.png";
import post5Thumbnail from "./images/phaser-tilemaps-5.png";

interface BlogProps {}

function Blog({}: BlogProps) {
  return (
    <Main>
      <PageTitle>Blog</PageTitle>
      <SocialPageMeta
        title="Blog"
        description="Michael Hadley's personal coding blog."
        image={ogImage}
        path="/contact"
      />
      <Section>
        <h1>Blog</h1>
        <ul className={css.postList}>
          <Post
            imageSrc={post5Thumbnail}
            title="Modular Game Worlds in Phaser 3 (Tilemaps #5) — Matter Physics"
            description="This is the final post in a series of blog posts about creating modular worlds in Phaser 3. In this edition, we’ll step up our Matter.js knowledge and build a puzzle-y physics platformer."
            href="https://medium.com/@michaelwesthadley/modular-game-worlds-in-phaser-3-tilemaps-5-matter-physics-platformer-d14d1f614557"
          />
          <Post
            imageSrc={post4Thumbnail}
            title="Modular Game Worlds in Phaser 3 (Tilemaps #4) — Meet Matter.js"
            description="This is the fourth post in a series of blog posts about creating modular worlds with tilemaps in the Phaser 3. In this edition, we’ll get acquainted with Matter.js."
            href="https://itnext.io/modular-game-worlds-in-phaser-3-tilemaps-4-meet-matter-js-abf4dfa65ca1"
          />
          <Post
            imageSrc={post3Thumbnail}
            title="Modular Game Worlds in Phaser 3 (Tilemaps #3) — Procedural Dungeon"
            description="This is the third post in a series of blog posts about creating modular worlds with tilemaps in Phaser 3. In this edition, we’ll create an endless, procedurally-generated dungeon."
            href="https://itnext.io/modular-game-worlds-in-phaser-3-tilemaps-3-procedural-dungeon-3bc19b841cd"
          />
          <Post
            imageSrc={post2Thumbnail}
            title="Modular Game Worlds in Phaser 3 (Tilemaps #2) — Dynamic Platformer"
            description="This is a blog post series about creating modular game worlds with tilemaps in Phaser 3. In this post, we’ll create a puzzle-y platformer where the player can draw platforms to get around obstacles."
            href="https://medium.com/@michaelwesthadley/modular-game-worlds-in-phaser-3-tilemaps-2-dynamic-platformer-3d68e73d494a"
          />
          <Post
            imageSrc={post1Thumbnail}
            title="Modular Game Worlds in Phaser 3 (Tilemaps #1) — Static Maps"
            description="This is a series of blog posts about creating modular worlds with tilemaps in the Phaser 3 game engine. In this first post, we’ll go from zero to a Pokemon-style top down game."
            href="https://medium.com/@michaelwesthadley/modular-game-worlds-in-phaser-3-tilemaps-1-958fc7e6bbd6"
          />
        </ul>
      </Section>
    </Main>
  );
}

export default Blog;
export type { BlogProps };
