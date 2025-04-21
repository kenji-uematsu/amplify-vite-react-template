import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { EventBridgeHandler } from "aws-lambda";

const sesClient = new SESClient({ region: "ap-northeast-1" });
const cognitoClient = new CognitoIdentityProviderClient({
  region: "ap-northeast-1",
});

interface EmailEvent {
  subject: string;
  message: string;
}

export const handler: EventBridgeHandler<string, EmailEvent, void> = async (
  event
) => {
  try {
    const { subject, message } = event.detail;

    // Cognitoユーザープールからユーザー一覧を取得
    const listUsersCommand = new ListUsersCommand({
      UserPoolId: process.env.USER_POOL_ID,
      AttributesToGet: ["email"],
    });

    const users = await cognitoClient.send(listUsersCommand);

    if (!users.Users) {
      console.log("No users found");
      return;
    }

    // 各ユーザーにメールを送信
    for (const user of users.Users) {
      const email = user.Attributes?.find(
        (attr) => attr.Name === "email"
      )?.Value;

      if (!email) continue;

      const params = {
        Source: process.env.VERIFIED_EMAIL, // 環境変数から送信元メールアドレスを取得
        Destination: {
          ToAddresses: [email],
        },
        Message: {
          Subject: {
            Data: subject,
            Charset: "UTF-8",
          },
          Body: {
            Text: {
              Data: message,
              Charset: "UTF-8",
            },
          },
        },
      };

      await sesClient.send(new SendEmailCommand(params));
      console.log(`Email sent successfully to ${email}`);
    }
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};
