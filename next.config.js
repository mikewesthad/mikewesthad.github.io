// In moving to Next, things have been restructured/omitted, so make sure to set
// up some redirects to make sure all relevant resume links still work.
// TODO: fill these in with the final routes.
const oldSiteRedirects = [
  // Old urls that match 1-to-1 new urls:
  { from: "/work", to: "/" },
  { from: "/projects/togetheroo", to: "/portfolio/togetheroo" },
  { from: "/projects/edovo", to: "/portfolio/edovo" },
  { from: "/projects/ofbook", to: "/portfolio/ofbook" },

  // Old urls that don't match anything yet:
  { from: "/projects/encoded-objects", to: "/" },
  { from: "/projects/sporadic-labs", to: "/" },
  { from: "/projects/msp-game-design", to: "/portfolio/edu" },
  { from: "/projects/cps-convergence", to: "/portfolio/edu" },
  { from: "/projects/uptake-game-design", to: "/portfolio/edu" },
  { from: "/projects/laf-creative-coding", to: "/portfolio/edu" },
  { from: "/projects/codeabode-teaching", to: "/portfolio/edu" },
  { from: "/projects/saic-web-art", to: "/portfolio/edu" },
  { from: "/projects/uic-interactive-3d", to: "/portfolio/edu" },
  { from: "/projects/uic-gameplay", to: "/portfolio/edu" },
  { from: "/projects/berkeley-retinal-modeling", to: "/portfolio/science" },
  { from: "/projects/laf-network-analysis", to: "/portfolio/science" },
  { from: "/projects/laf-multisensory", to: "/portfolio/science" },
  { from: "/projects/view-history", to: "/portfolio/art" },
  { from: "/projects/promise-foods", to: "/portfolio/art" },
  { from: "/projects/gratuitous-gram", to: "/portfolio/art" },
  { from: "/projects/blink", to: "/portfolio/art" },
  { from: "/projects/public-insecurities", to: "/portfolio/art" },
  { from: "/projects/j4kdart", to: "/" },
  { from: "/projects/youtube-spaces", to: "/" },
  { from: "/projects/emojify-tracking", to: "/" },
  { from: "/projects/html-form-renderer", to: "/" },
  { from: "/projects/render-sketch-game", to: "/" },
  { from: "/projects/video-collapse", to: "/" },
  { from: "/projects/natural-symmetries", to: "/" },
  { from: "/projects/disconnect", to: "/" },
];

// Redirects for npm packages / gh repos that used to point to my GH pages site:
const ghRedirects = [
  "navmesh",
  "lafayette-creative-coding-p5-workshop",
  "phaser-3-tilemap-blog-posts",
  "phaser-matter-collision-plugin",
  "sdg-quiz-game",
  "sdg-unit-planning-game",
  "financial-literacy-playlist-games",
  "phaser-tiled-hull",
  "emojify",
  "frontend-javascript-demos",
  "saic-webart",
  "uic-interactive3d-spring2017",
  "uic-gameplay-spring2017",
];

module.exports = {
  async redirects() {
    const old = oldSiteRedirects.map(({ from, to }) => ({
      source: `${from}(.html)?`,
      destination: to,
      permanent: true,
    }));
    const gh = ghRedirects.map((repo) => ({
      source: `/${repo}/:slug*`,
      destination: `https://mikewesthad.github.io/${repo}/:slug*`,
      permanent: true,
    }));
    return [...old, ...gh];
  },
};
