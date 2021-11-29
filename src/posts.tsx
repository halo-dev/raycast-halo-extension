import {
  ActionPanel,
  CopyToClipboardAction,
  Detail,
  Image,
  ImageMask,
  List,
  OpenInBrowserAction,
  PushAction,
  showToast,
  ToastStyle
} from "@raycast/api";
import { useEffect, useState } from "react";
import haloAdminClient from "./utils/api-client";
import type { BasePostSimple, PostDetail } from "@halo-dev/admin-api";
import dayjs from "dayjs";

export default function main() {

  const [keyword, setKeyword] = useState<string>();
  const [categoryId, setCategoryId] = useState<number>();
  const { posts, loading } = useSearch(keyword, categoryId);

  return (
    <List
      searchBarPlaceholder="Search posts by keyword..."
      onSearchTextChange={setKeyword}
      throttle={true}
      isLoading={loading}
      navigationTitle={"Search Posts"}
    >
      {posts?.map(post => (
        <List.Item
          id={post.id.toString()}
          key={post.id}
          title={post.title}
          subtitle={post.slug}
          accessoryTitle={dayjs(post.createTime).format("YYYY-MM-DD")}
          icon={renderPostThumbnail(post.thumbnail)}
          actions={
            <ActionPanel>
              <PushAction
                title="Show Details"
                target={<RenderPostDetail post={post} />}
              />
              <OpenInBrowserAction url={post.fullPath} />
              <CopyToClipboardAction title="Copy Post URL" content={post.fullPath} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}

export function RenderPostDetail(props: { post: BasePostSimple }) {
  const { id } = props.post;
  const [post, setPost] = useState<PostDetail>();
  const [loading, setLoading] = useState<boolean>(false);
  useEffect(() => {
    async function fetchPost() {
      setLoading(true);
      try {
        const response = await haloAdminClient.post.get(id);
        setPost(response.data);
      } catch (error: any) {
        showToast(ToastStyle.Failure, "Could not get post details", error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchPost();
  }, []);

  return (
    <Detail
      markdown={post?.originalContent}
      isLoading={loading}
      navigationTitle={post?.title}
      actions={
        <ActionPanel>
          <OpenInBrowserAction url={post?.fullPath} />
        </ActionPanel>
      }
    />
  );
}

function renderPostThumbnail(thumbnail: string): Image {
  return {
    source: thumbnail,
    mask: ImageMask.RoundedRectangle
  };
}

export function useSearch(keyword: string | undefined, categoryId: number | undefined): {
  posts?: BasePostSimple[];
  loading: boolean;
} {
  const [posts, setPosts] = useState<BasePostSimple[]>();
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    async function fetchPosts() {

      setLoading(true);
      try {
        const response = await haloAdminClient.post.list({
          keyword,
          categoryId
        });
        setPosts(response.data.content);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, [keyword, categoryId]);

  return { posts, loading };
}
