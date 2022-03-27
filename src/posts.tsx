import { Action, ActionPanel, Detail, Image, List, showToast, Toast, getPreferenceValues } from "@raycast/api";
import React, { useEffect, useState } from "react";
import apiClient from "./utils/api-client";
import type { BasePostSimple, PostDetail } from "@halo-dev/admin-api";
import dayjs from "dayjs";
import { Category } from "@halo-dev/admin-api/lib/types";

const preferenceValues = getPreferenceValues();
const siteUrl = preferenceValues.siteurl as string;

export default function main() {
  const [keyword, setKeyword] = useState<string>();
  const [categoryId, setCategoryId] = useState<string>("");
  const { posts, loading } = useSearch(keyword, Number(categoryId));

  return (
    <List
      searchBarPlaceholder="Search posts by keyword..."
      onSearchTextChange={setKeyword}
      throttle={true}
      isLoading={loading}
      navigationTitle={"Search Posts"}
      searchBarAccessory={<CategoryDropdown onChange={setCategoryId} />}
    >
      {posts?.map((post) => (
        <List.Item
          id={post.id.toString()}
          key={post.id}
          title={post.title}
          subtitle={post.slug}
          accessoryTitle={dayjs(post.createTime).format("YYYY-MM-DD")}
          icon={renderPostThumbnail(post.thumbnail)}
          actions={
            <ActionPanel>
              <Action.Push title="Show Details" target={<RenderPostDetail post={post} />} />
              <Action.OpenInBrowser url={post.fullPath} />
              <Action.OpenInBrowser
                title="Open In Browser To Edit"
                url={`${siteUrl}/manage/index.html#/posts/edit?postId=${post.id}`}
              />
              <Action.CopyToClipboard title="Copy Post URL" content={post.fullPath} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}

function CategoryDropdown({ onChange }: { onChange: (value: string) => void }) {
  const { categories } = useCategories();

  return (
    <List.Dropdown
      tooltip="Select Category"
      placeholder="Select Category"
      storeValue={false}
      onChange={(value) => {
        onChange(value);
      }}
    >
      <List.Dropdown.Section>
        <List.Dropdown.Item title="全部（all）" value={""} />
        {categories.map((category) => (
          <List.Dropdown.Item
            key={category.id}
            title={`${category.name}（${category.slug}）`}
            value={category.id.toString()}
          />
        ))}
      </List.Dropdown.Section>
    </List.Dropdown>
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
        const response = await apiClient.post.get(id);
        setPost(response.data);
      } catch (error: any) {
        showToast(Toast.Style.Failure, "Could not get post details", error.message);
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
          <Action.OpenInBrowser url={post?.fullPath || ""} />
        </ActionPanel>
      }
    />
  );
}

function renderPostThumbnail(thumbnail: string): Image {
  return {
    source: thumbnail,
    mask: Image.Mask.RoundedRectangle,
  };
}

export function useSearch(
  keyword: string | undefined,
  categoryId: number | undefined
): {
  posts?: BasePostSimple[];
  loading: boolean;
} {
  const [posts, setPosts] = useState<BasePostSimple[]>();
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    async function fetchPosts() {
      setLoading(true);
      try {
        const response = await apiClient.post.list({
          keyword,
          categoryId: categoryId || undefined,
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

export function useCategories(): { categories: Category[]; loading: boolean } {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    async function fetchCategories() {
      setLoading(true);
      try {
        const response = await apiClient.category.list({});
        setCategories(response.data);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  return { categories, loading };
}
