import type { IndexData } from "@/types/index-page";

declare module "@/content/index/es.md" {
  export const frontmatter: IndexData;
}

declare module "@/content/index/en.md" {
  export const frontmatter: IndexData;
}
