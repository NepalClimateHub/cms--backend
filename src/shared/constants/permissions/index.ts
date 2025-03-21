import userPermissions from "./users.permissions";
import rolePermissions from "./roles.permissions";

export type Permission = {
  action: string;
  description: string;
};

export type PermissionModule = {
  key: string;
  name: string;
  description: string;
  permissions: Permission[];
};

const permissions = [userPermissions, rolePermissions] as const;

export type PermissionActions =
  (typeof permissions)[number]["permissions"][number]["action"];

export default permissions;
