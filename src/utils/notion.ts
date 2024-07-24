// @/lib/notion.ts

import { Client } from '@notionhq/client';
import type {
  QueryDatabaseResponse,
  BlockObjectResponse,
  PartialBlockObjectResponse,
} from '@notionhq/client/build/src/api-endpoints';

const notion = new Client({ auth: process.env.NOTION_API_KEY });

export default notion;

type Post = {
  Page: string;
  Slug: string;
  Date: string | null;
  Published: boolean;
  Authors: string[];
  Preview?: string[];
  Tags: string[];
  Content?: (BlockObjectResponse | PartialBlockObjectResponse)[]; // Add Content field
  hasTweet?: boolean; // Optionally track if the post has tweets
};

type PostsTable = {
  [slug: string]: Post;
};

type Users = {
  [id: string]: { full_name: string };
};

export async function getBlogIndex(): Promise<PostsTable> {
  const databaseId = process.env.NOTION_BLOG_DATABASE_ID;
  if (!databaseId) {
    throw new Error(
      'NOTION_BLOG_DATABASE_ID is not defined in the environment variables'
    );
  }

  const response: QueryDatabaseResponse = await notion.databases.query({
    database_id: databaseId,
  });

  const postsTable: PostsTable = response.results.reduce((acc, page) => {
    if ('properties' in page) {
      const properties = page.properties as any;
      const slug = properties.Slug?.rich_text[0]?.plain_text;
      if (slug) {
        acc[slug] = {
          Page: properties.Name?.title[0]?.plain_text,
          Slug: slug,
          Date: properties.Date?.date?.start || null,
          Published: properties.Published?.checkbox,
          Authors:
            properties.Authors?.people.map((author: any) => author.id) || [],
          Preview:
            properties.Preview?.rich_text.map((rt: any) => rt.plain_text) || [],
          Tags: properties.Tags?.multi_select.map((tag: any) => tag.name) || [],
        };
      }
    }
    return acc;
  }, {} as PostsTable);

  return postsTable;
}

export async function getNotionUsers(
  userIds: string[]
): Promise<{ users: Users }> {
  const users: Users = {};
  await Promise.all(
    userIds.map(async (userId) => {
      const user = await notion.users.retrieve({ user_id: userId });
      users[user.id] = { full_name: user.name || 'Unknown' };
    })
  );

  return { users };
}

async function getPageIdFromSlug(slug: string): Promise<string | undefined> {
  // Implement this function to map Slug to pageId
  // This is just a placeholder implementation
  // You might need to query Notion or have a pre-defined mapping
  const response = await notion.databases.query({
    database_id: process.env.NOTION_BLOG_DATABASE_ID as string,
    filter: {
      property: 'Slug',
      rich_text: {
        equals: slug,
      },
    },
  });
  const page = response.results[0];
  return page?.id;
}

export async function getPageData(post: Post): Promise<(BlockObjectResponse | PartialBlockObjectResponse)[]> {
  const blocks: (BlockObjectResponse | PartialBlockObjectResponse)[] = [];

  // Get pageId from the post's Slug
  const pageId = await getPageIdFromSlug(post.Slug);
  if (!pageId) {
    throw new Error(`Page not found for Slug: ${post.Slug}`);
  }

  let cursor: string | undefined;

  while (true) {
    const response = await notion.blocks.children.list({
      block_id: pageId,
      start_cursor: cursor,
    });

    blocks.push(...response.results);
    if (!response.has_more) break;
    cursor = response.next_cursor || undefined;
  }

  return blocks;
}

// Updated getPostData function
export async function getPostData(slug: string, preview: boolean) {
  const postsTable = await getBlogIndex();
  const post = postsTable[slug];

  if (!post || (!post.Published && !preview)) {
    console.log(`Failed to find post for slug: ${slug}`);
    return null;
  }

  // Get pageId from the post's Slug
  const pageId = await getPageIdFromSlug(post.Slug);
  if (!pageId) {
    throw new Error(`Page not found for Slug: ${post.Slug}`);
  }

  const postData = await getPageData(post);
  post.Content = postData;

  const authorIds = post.Authors || [];
  const authorFetchPromises = authorIds.map((id) =>
    notion.users.retrieve({ user_id: id })
  );
  const authorResults = await Promise.all(authorFetchPromises);
  post.Authors = authorResults.map((user) => user.name || 'Unknown');

  return post;
}
