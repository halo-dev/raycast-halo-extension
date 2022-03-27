import { Action, ActionPanel, Form, popToRoot, showToast, Toast } from "@raycast/api";
import apiClient from "./utils/api-client";
import type { Journal } from "@halo-dev/admin-api";
import React from "react";

export default function main() {
  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Publish" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextArea id="sourceContent" title="Content" />
      <Form.Dropdown id="type" title="Type">
        <Form.Dropdown.Item key="PUBLIC" value="PUBLIC" title="Public" />
        <Form.Dropdown.Item key="INTIMATE" value="INTIMATE" title="Intimate" />
      </Form.Dropdown>
    </Form>
  );
}

async function handleSubmit(model: Journal) {
  try {
    if (!model.sourceContent) {
      throw Error("Please enter content");
    }
    await apiClient.journal.create(model);
    await showToast(Toast.Style.Success, "Journal created", "Journal creation successful");
    await popToRoot();
  } catch (error: any) {
    await showToast(Toast.Style.Failure, "Error", error.message);
  }
}
