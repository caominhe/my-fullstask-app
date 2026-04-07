import { ROLES } from "../constants/roles";
import { ROUTES } from "../constants/routes";

/**
 * Điều hướng sau đăng nhập theo role (ưu tiên: ADMIN → SALES → CUSTOMER).
 * @param {{ roles?: { name: string }[] } | null | undefined} user
 */
export function getPostLoginPath(user) {
  if (!user?.roles?.length) {
    return ROUTES.PROFILE;
  }
  const names = user.roles.map((r) => r.name);
  if (names.includes(ROLES.ADMIN)) {
    return ROUTES.ADMIN_HOME;
  }
  if (names.includes(ROLES.SALES)) {
    return ROUTES.SHOWROOM_HOME;
  }
  return ROUTES.PROFILE;
}
