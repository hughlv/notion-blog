import fs from 'fs';
import path from 'path';

export const API_ENDPOINT = 'https://www.notion.so/api/v3';
export const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_BLOG_DATABASE_ID = process.env.NOTION_BLOG_DATABASE_ID;

// Clean up any previous build data
const cleanupOldData = () => {
  try {
    fs.unlinkSync(path.resolve('.blog_index_data'));
  } catch (_) {
    /* non fatal */
  }
  try {
    fs.unlinkSync(path.resolve('.blog_index_data_previews'));
  } catch (_) {
    /* non fatal */
  }
};

cleanupOldData();

const warnOrError = process.env.NODE_ENV !== 'production' ? console.warn : (msg) => {
  throw new Error(msg);
};

// Verify environment variables
if (!NOTION_API_KEY) {
  warnOrError(`
    \nNOTION_API_KEY is missing from env, this will result in an error\n
    Make sure to provide one before starting Next.js
  `);
}

if (!NOTION_BLOG_DATABASE_ID) {
  warnOrError(`
    \nNOTION_BLOG_DATABASE_ID is missing from env, this will result in an error\n
    Make sure to provide one before starting Next.js
  `);
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config, { dev, isServer }) {
    // Only compile build-rss in production server build
    if (dev || !isServer) return config;

    // Enable shared caching for Notion data in build mode
    process.env.USE_CACHE = 'true';

    return config;
  },
};

export default nextConfig;