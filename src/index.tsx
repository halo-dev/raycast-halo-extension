import {
  List,
  ActionPanel,
  OpenInBrowserAction
} from "@raycast/api";
import { useState, useEffect } from 'react'
import haloContentClient from "./api-client";
import type { PostList } from '@halo-dev/content-api'

export default function main() {

  const { posts, isLoading } = useSearch()

  return (
    <List
      searchBarPlaceholder="Search posts by title..."
      throttle={true}
      isLoading={isLoading}
      navigationTitle={'Post List'}
    >
      <List.Section title={"Latest Posts"}>
        {posts?.map(post => (
          <List.Item
            id={post.id.toString()}
            key={post.id}
            title={post.title}
            subtitle={post.slug}
            accessoryTitle={post.createTime.toString()}
            actions={
              <ActionPanel>
                <OpenInBrowserAction url={post.fullPath} shortcut={{ modifiers: ["cmd"], key: "enter" }} />
              </ActionPanel>
            }
          />
        ))}
      </List.Section>
    </List>
  );
}

export function useSearch(): {
  posts?: PostList[];
  isLoading: boolean;
} {
  const [posts, setPosts] = useState<PostList[]>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    async function fetchPosts() {

      setIsLoading(true);
      try {
        const response = await haloContentClient.post.list({})
        setPosts(response.data.content)
      } finally {
        setIsLoading(false);
      }
    }

    fetchPosts();
  });

  return { posts, isLoading };
}