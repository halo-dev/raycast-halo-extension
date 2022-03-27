import { Action, ActionPanel, Form, popToRoot, showToast, Toast } from "@raycast/api";
import haloAdminClient from "./utils/api-client";
import type { Journal } from "@halo-dev/admin-api";

export default function main() {
  return (
    <Form
      onSubmit={handleSubmit}
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Create Journal" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextArea id="sourceContent" title="Content" placeholder="Have a good time~" />
      <Form.Dropdown id="type" title="Public">
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
    await haloAdminClient.journal.create(model);
    await showToast(Toast.Style.Success, "Journal created", "Journal creation successful");
    popToRoot();
  } catch (error: any) {
    await showToast(Toast.Style.Failure, "Error", error.message);
  }
}
