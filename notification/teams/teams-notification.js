const core = require("@actions/core");

async function webhookCall(webhookUrl, adaptiveCardPayload) {
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(adaptiveCardPayload),
  });

  core.setOutput("response-status", String(response.status));

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Teams webhook failed: ${response.status} ${text}`);
  }

  core.info("Message sent to Teams successfully.");
}

async function run() {
  try {
    const webhookUrl = core.getInput("webhook-url", { required: true });
    const title = core.getInput("title");
    const message = core.getInput("message", { required: true });
    const status = core.getInput("status");
    const color = core.getInput("color");

    const adaptiveCardPayload = {
      type: "message",
      attachments: [
        {
          contentType: "application/vnd.microsoft.card.adaptive",
          content: {
            type: "AdaptiveCard",
            $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
            version: "1.4",
            body: [
              {
                type: "Container",
                style: "emphasis",
                items: [
                  {
                    type: "TextBlock",
                    text: title,
                    weight: "bolder",
                    size: "medium",
                    wrap: true,
                    color: status === "failure" ? "attention" : "default",
                  },
                ],
              },
              {
                type: "TextBlock",
                text: message,
                wrap: true,
                spacing: "medium",
              },
              {
                type: "FactSet",
                facts: [
                  {
                    title: "Repo",
                    value: process.env.GITHUB_REPOSITORY || "unknown",
                  },
                  {
                    title: "Branch",
                    value: process.env.GITHUB_REF_NAME || "unknown",
                  },
                  {
                    title: "Actor",
                    value: process.env.GITHUB_ACTOR || "unknown",
                  },
                  {
                    title: "Status",
                    value: status || "success",
                  },
                ],
              },
            ],
            actions: process.env.GITHUB_RUN_ID
              ? [
                  {
                    type: "Action.OpenUrl",
                    title: "View run",
                    url: `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`,
                  },
                ]
              : [],
          },
        },
      ],
    };

    await webhookCall(webhookUrl, adaptiveCardPayload);
  } catch (e) {
    core.setFailed(error.message);
  }
}

run();
