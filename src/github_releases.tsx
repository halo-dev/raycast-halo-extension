import { useEffect, useState } from "react";
import type { Environment } from "@halo-dev/admin-api";
import { HaloRestAPIClient } from "@halo-dev/admin-api";
import {
  ActionPanel,
  Detail,
  Icon,
  ImageMask,
  List,
  OpenInBrowserAction,
  PushAction,
  showToast,
  ToastStyle,
} from "@raycast/api";
import dayjs from "dayjs";
import haloAdminClient from "./utils/api-client";

export interface Author {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: boolean;
}

export interface Uploader {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: boolean;
}

export interface Asset {
  url: string;
  id: number;
  node_id: string;
  name: string;
  label: string;
  uploader: Uploader;
  content_type: string;
  state: string;
  size: number;
  download_count: number;
  created_at: Date;
  updated_at: Date;
  browser_download_url: string;
}

export interface Reactions {
  url: string;
  total_count: number;
  laugh: number;
  hooray: number;
  confused: number;
  heart: number;
  rocket: number;
  eyes: number;
}

export interface Release {
  url: string;
  assets_url: string;
  upload_url: string;
  html_url: string;
  id: number;
  author: Author;
  node_id: string;
  tag_name: string;
  target_commitish: string;
  name: string;
  draft: boolean;
  prerelease: boolean;
  created_at: Date;
  published_at: Date;
  assets: Asset[];
  tarball_url: string;
  zipball_url: string;
  body: string;
  reactions: Reactions;
  mentions_count: number;
}

export default function main() {
  const { releases, loading } = useSearch();
  const { environments, loading: environmentsLoading } = useEnvironments();

  return (
    <List
      searchBarPlaceholder="Search releases by keyword..."
      throttle={true}
      isLoading={loading || environmentsLoading}
      navigationTitle={"Check Halo releases"}
    >
      {releases?.map((release) => (
        <List.Item
          id={release.id.toString()}
          key={release.id}
          title={release.name}
          subtitle={`${getAssetsDownloadCount(release).toString()} downloads`}
          accessoryTitle={dayjs(release.created_at).format("YYYY-MM-DD")}
          icon={environments?.version === release.name ? Icon.Circle : Icon.Dot}
          accessoryIcon={{ source: release.author.avatar_url, mask: ImageMask.Circle }}
          actions={
            <ActionPanel>
              <PushAction title="Show Details" target={<RenderReleaseDetail release={release} />} />
              <OpenInBrowserAction url={release.html_url} />
              {release.assets.map((asset) => (
                <OpenInBrowserAction key={asset.id} url={asset.browser_download_url} title={`Download ${asset.name}`} />
              ))}
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}

export function RenderReleaseDetail(props: { release: Release }) {
  const { release } = props;

  return (
    <Detail
      markdown={release?.body}
      navigationTitle={release?.name}
      actions={
        <ActionPanel>
          <OpenInBrowserAction url={release?.html_url} />
        </ActionPanel>
      }
    />
  );
}

export function getAssetsDownloadCount(release: Release): number {
  const { assets } = release;
  return assets.map((asset) => asset.download_count).reduce((prev, current) => prev + current);
}

export function useSearch() {
  const [releases, setReleases] = useState<Release[]>();
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    async function fetchReleases() {
      setLoading(true);
      try {
        const haloRestApiClient = new HaloRestAPIClient({
          baseUrl: "https://api.github.com",
        });
        const client = haloRestApiClient.buildHttpClient();
        const response = await client.get("/repos/halo-dev/halo/releases", {});
        setReleases(response);
      } catch (error: any) {
        showToast(ToastStyle.Failure, "Could not fetch halo github releases", error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchReleases();
  }, []);

  return { releases, loading };
}

export function useEnvironments() {
  const [environments, setEnvironments] = useState<Environment>();
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    async function fetchEnvironments() {
      setLoading(true);
      try {
        const response = await haloAdminClient.getEnvironment();
        setEnvironments(response.data);
      } catch (error: any) {
        showToast(ToastStyle.Failure, "Could not fetch halo environments", error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchEnvironments();
  }, []);
  return { environments, loading };
}
