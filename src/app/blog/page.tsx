import Link from 'next/link';
import Header from '@/components/header';

import blogStyles from '@/styles/blog.module.css';
import sharedStyles from '@/styles/shared.module.css';

import {
  getBlogLink,
  getDateStr,
  postIsPublished,
} from '../../utils/blog-helpers';
import { getBlogIndex, getNotionUsers } from '@/utils/notion';

// Fetch data during build time
export const revalidate = 10; // Revalidate data every 10 seconds

export default async function BlogPage({ searchParams }: any) {
  const preview = searchParams.preview === 'true';

  const postsTable = await getBlogIndex();

  const authorsToGet = new Set<string>();
  const posts: any[] = Object.keys(postsTable)
    .map((slug) => {
      const post = postsTable[slug];
      // remove draft posts in production
      if (!preview && !postIsPublished(post)) {
        return null;
      }
      post.Authors = post.Authors || [];
      for (const author of post.Authors) {
        authorsToGet.add(author);
      }
      return post;
    })
    .filter(Boolean);

  const { users } = await getNotionUsers([...authorsToGet]);

  posts.forEach((post) => {
    post.Authors = post.Authors.map(
      (id: string) => users[id]?.full_name || 'Unknown'
    );
  });

  return (
    <>
      <Header titlePre="Blog" />
      {preview && (
        <div className={blogStyles.previewAlertContainer}>
          <div className={blogStyles.previewAlert}>
            <b>Note:</b>
            {` `}Viewing in preview mode{' '}
            <Link href={`/api/clear-preview`}>
              <button className={blogStyles.escapePreview}>Exit Preview</button>
            </Link>
          </div>
        </div>
      )}
      <div className={`${sharedStyles.layout} ${blogStyles.blogIndex}`}>
        <h1>My Notion Blog</h1>
        {posts.length === 0 && (
          <p className={blogStyles.noPosts}>There are no posts yet</p>
        )}
        {posts.map((post) => (
          <div className={blogStyles.postPreview} key={post.Slug}>
            <h3>
              <span className={blogStyles.titleContainer}>
                {!post.Published && (
                  <span className={blogStyles.draftBadge}>Draft</span>
                )}
                <Link href={`/blog/${post.Slug}`}>{post.Page}</Link>
              </span>
            </h3>
            {post.Authors.length > 0 && (
              <div className="authors">By: {post.Authors.join(' ')}</div>
            )}
            {post.Date && (
              <div className="posted">Posted: {getDateStr(post.Date)}</div>
            )}

            {(!post.Preview || post.Preview.length === 0) && (
              <p>'No preview available'</p>
            )}
            {(post.Preview || []).map((block: string, idx: number) => (
              <p key={idx}>{block}</p>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}
