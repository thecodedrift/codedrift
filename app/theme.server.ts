import { createThemeSessionResolver } from "remix-themes";
import { themeSessionStorage } from "./sessions.server";

export const themeSessionResolver =
  createThemeSessionResolver(themeSessionStorage);
