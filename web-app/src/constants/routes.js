export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  AUTHENTICATE: "/authenticate",
  ONBOARD: "/onboard",

  /** Khu khách hàng (CUSTOMER) — PublicLayout + menu Avatar */
  PROFILE: "/profile",
  MY_GARAGE: "/my-garage",
  PROMOTIONS: "/promotions",

  /** @deprecated Dùng PROFILE — giữ để tương thích */
  APP_HOME: "/profile",
  APP_PROFILE: "/profile",
  APP_VOUCHERS: "/promotions",
  APP_EVENTS: "/promotions",
  APP_LEADS: "/test-drive",
  APP_SALES: "/profile",
  APP_AFTERSALES: "/my-garage",

  SHOWROOM_HOME: "/showroom",
  SHOWROOM_CARS: "/showroom/sales",
  SHOWROOM_LEADS: "/showroom/leads",
  SHOWROOM_SALES: "/showroom/sales",
  SHOWROOM_FINANCE: "/showroom/finance",
  SHOWROOM_AFTERSALES: "/showroom/aftersales",

  ADMIN_HOME: "/admin",
  ADMIN_INVENTORY: "/admin/inventory",
  ADMIN_LEADS: "/admin/leads",
  ADMIN_CAMPAIGNS: "/admin/campaigns",
  ADMIN_USERS: "/admin/users",
  ADMIN_REPORTS: "/admin/reports",

  CARS_PUBLIC: "/cars",
  CAR_DETAIL: "/cars/:vin",
  TEST_DRIVE: "/test-drive",
};
