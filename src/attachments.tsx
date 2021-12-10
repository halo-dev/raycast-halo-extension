import { useEffect, useState } from "react";
import haloAdminClient from "./utils/api-client";
import type { Attachment } from "@halo-dev/admin-api";
import { ActionPanel, CopyToClipboardAction, List, OpenInBrowserAction, showToast, ToastStyle } from "@raycast/api";
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
              <OpenInBrowserAction url={attachment.path} />
              <CopyToClipboardAction title="Copy Attachment URL" content={attachment.path} />
              <CopyToClipboardAction title="Copy Markdown format URL" content={getMarkdownFormatUrl(attachment)} />
              <CopyToClipboardAction title="Copy HTML format URL" content={getHtmlFormatUrl(attachment)} />
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
        showToast(ToastStyle.Failure, "Could not fetch attachments", error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchAttachments();
  }, [keyword]);

  return { attachments, loading };
}
