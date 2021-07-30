import Blog from "components/blog";
import Container from "components/container";
import PageTitle from "components/page-title";

interface BlogPageProps {}

function BlogPage({}: BlogPageProps) {
  return (
    <main>
      <PageTitle>Blog</PageTitle>
      <Blog />
    </main>
  );
}

export default BlogPage;
export type { BlogPageProps };
