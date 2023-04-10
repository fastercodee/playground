import { defineStore } from "pinia";

export const useSearchStore = defineStore("search", () => {
  const replace = ref("")

  return { replace }
});
