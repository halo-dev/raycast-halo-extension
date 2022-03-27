import React, { useEffect, useState } from "react";
import haloAdminClient from "./utils/api-client";
import type { Attachment } from "@halo-dev/admin-api";
import { Action, ActionPanel, List, showToast, Toast } from "@raycast/api";
import dayjs from "dayjs";

export default function main() {
  const [keyword, setKeyword] = useState<string>();
  const { attachments, loading } = useSearch(keyword);

  return (
    <List
      searchBarPlaceholder="Search attachments by keyword..."
      onSearchTextChange={setKeyword}
      throttle={true}
      isLoading={loading}
      navigationTitle={"Search attachments"}
    >
      {attachments?.map((attachment) => (
        <List.Item
          id={attachment.id.toString()}
          key={attachment.id}
          title={attachment.name}
          subtitle={attachment.mediaType}
          accessoryTitle={dayjs(attachment.createTime).format("YYYY-MM-DD")}
          icon={attachment.thumbPath}
          actions={
            <ActionPanel>
              <Action.OpenInBrowser url={attachment.path} />
              <Action.CopyToClipboard title="Copy Attachment URL" content={attachment.path} />
              <Action.CopyToClipboard title="Copy Markdown format URL" content={getMarkdownFormatUrl(attachment)} />
              <Action.CopyToClipboard title="Copy HTML format URL" content={getHtmlFormatUrl(attachment)} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}

function getMarkdownFormatUrl(attachment: Attachment) {
  return `![${attachment.name}](${attachment.path})`;
}

function getHtmlFormatUrl(attachment: Attachment) {
  return `<img src="${attachment.path}" alt="${attachment.name}" />`;
}

export function useSearch(keyword: string | undefined) {
  const [attachments, setAttachments] = useState<Attachment[]>();
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    async function fetchAttachments() {
      setLoading(true);
      try {
        const response = await haloAdminClient.attachment.list({
          keyword,
        });
        setAttachments(response.data.content);
      } catch (error: any) {
        await showToast(Toast.Style.Failure, "Could not fetch attachments", error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchAttachments();
  }, [keyword]);

  return { attachments, loading };
}
