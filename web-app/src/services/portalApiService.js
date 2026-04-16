import { adminApi } from "./portalApi/adminApi";
import { aftersalesApi } from "./portalApi/aftersalesApi";
import { customerApi } from "./portalApi/customerApi";
import { publicApi } from "./portalApi/publicApi";
import { showroomApi } from "./portalApi/showroomApi";

export const portalApi = {
  ...publicApi,
  ...adminApi,
  ...showroomApi,
  ...customerApi,
  ...aftersalesApi,
};

