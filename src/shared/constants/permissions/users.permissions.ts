const config = {
  key: "USERS",
  name: "User Management",
  description: "User Management",
  permissions: [
    {
      action: "USERS_FULL",
      description: "Full Access",
    },
    {
      action: "USERS_VIEW",
      description: "View Access",
    },
  ],
} as const;

export default config;
