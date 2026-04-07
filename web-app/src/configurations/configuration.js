/** Base URL API (CRA: ghi đè bằng REACT_APP_API_BASE_URL trong .env.local) */
export const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8080/api/v1";

export const OAuthConfig = {
  clientId:
    process.env.REACT_APP_GOOGLE_CLIENT_ID ||
    "280079627898-nub8b8uks9hb19i5i40rkmfr3c3mlcbn.apps.googleusercontent.com",
  redirectUri: process.env.REACT_APP_GOOGLE_REDIRECT_URI || "http://localhost:3000/authenticate",
  authUri: "https://accounts.google.com/o/oauth2/auth",
};
