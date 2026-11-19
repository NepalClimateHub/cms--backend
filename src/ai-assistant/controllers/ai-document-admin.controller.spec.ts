import { ROLE } from "../../auth/constants/role.constant";
import { ROLES_KEY } from "../../auth/decorators/role.decorator";
import { AiDocumentAdminController } from "./ai-document-admin.controller";

describe("AiDocumentAdminController visual settings authorization", () => {
  it.each(["settings", "updateSettings"] as const)(
    "restricts %s to superadmins",
    (method) => {
      const roles = Reflect.getMetadata(
        ROLES_KEY,
        AiDocumentAdminController.prototype[method],
      );

      expect(roles).toEqual([ROLE.SUPER_ADMIN]);
    },
  );
});
