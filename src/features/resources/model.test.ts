import { umich } from "../../data/schools";
import { getResourceRecommendations, selectAcademicSource } from "./model";

const assert = (condition: boolean, message: string) => {
  if (!condition) throw new Error(message);
};

const resources = getResourceRecommendations("Computer Science", umich);

assert(resources.length === 3, "returns one resource for each job to be done");
assert(
  resources[0].provider === "YouTube search" &&
    resources[0].description.includes("unreviewed search"),
  "does not present personalized video results as curated",
);
assert(
  resources[0].url.includes("Computer%20Science"),
  "safely encodes the field in search URLs",
);
assert(
  selectAcademicSource("Computer Science", umich)?.label ===
    "U-M majors and degrees",
  "prefers the official program source over a broad school directory",
);
assert(
  resources[2].url ===
    "https://www.onetonline.org/find/quick?s=Computer%20Science",
  "creates a deterministic O*NET occupation search",
);
