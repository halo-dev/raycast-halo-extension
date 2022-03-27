import React, { useEffect, useState } from "react";
import haloAdminClient from "./utils/api-client";
import type { Journal } from "@halo-dev/admin-api";
import { Action, ActionPanel, Detail, ImageMask, List, showToast, Toast } from "@raycast/api";
import dayjs from "dayjs";

export default function main() {
  const [keyword, setKeyword] = useState<string>();
  const { journals, loading } = useSearch(keyword);

  return (
    <List
      searchBarPlaceholder="Search journals by keyword..."
      onSearchTextChange={setKeyword}
      throttle={true}
      isLoading={loading}
      navigationTitle={"Search journals"}
    >
      {journals?.map((journal) => (
        <List.Item
          id={journal.id?.toString()}
          key={journal.id}
          title={journal.sourceContent}
          subtitle={journal.type.toLowerCase()}
          accessoryTitle={dayjs(journal.createTime).format("YYYY-MM-DD")}
          icon={{ source: `https://ryanc.cc/avatar`, mask: ImageMask.Circle }}
          actions={
            <ActionPanel>
              <Action.Push title="Show Details" target={<RenderJournalDetail journal={journal} />} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}

export function RenderJournalDetail(props: { journal: Journal }) {
  const { journal } = props;
  return <Detail markdown={journal?.sourceContent} navigationTitle={dayjs(journal.createTime).format("YYYY-MM-DD")} />;
}

export function useSearch(keyword: string | undefined) {
  const [journals, setJournals] = useState<Journal[]>();
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    async function fetchJournals() {
      setLoading(true);
      try {
        const response = await haloAdminClient.journal.list({
          keyword,
        });
        setJournals(response.data.content);
      } catch (error: any) {
        showToast(Toast.Style.Failure, "Could not fetch journals", error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchJournals();
  }, [keyword]);

  return { journals, loading };
}
