import { createCookieSessionStorage } from "react-router";

export const themeSessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__theme",
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secrets: ["codedrift-theme"],
    secure: process.env.NODE_ENV === "production",
  },
});
