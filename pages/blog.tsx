import Blog from "components/blog";
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
