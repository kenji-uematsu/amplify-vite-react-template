import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  VixNotification: a
    .model({
      email: a.string().required(),
      isEnabled: a.boolean(),
      dailyEnabled: a.boolean(),
      dailyTime: a.string(),
      thresholdEnabled: a.boolean(),
      thresholdValue: a.integer(),
      lastNotified: a.string(),
    })
    .authorization((allow) => [allow.owner()]), // ownerベースの認証
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});
