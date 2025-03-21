const config = {
  key: "ROLES",
  name: "Role Management",
  description: "Role Management",
  permissions: [
    {
      action: "ROLES_FULL",
      description: "Full Access",
    },
    {
      action: "ROLES_VIEW",
      description: "View Access",
    },
  ],
} as const;

export default config;
