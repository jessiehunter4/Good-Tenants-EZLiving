import { adminListQuery } from "./crud";

/** Topics, used by every content editor's topic picker. */
export const topicsQuery = adminListQuery("topics", [{ column: "name" }]);
