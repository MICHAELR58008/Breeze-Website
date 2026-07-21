import { createClient } from "tinacms/dist/client";
import { queries } from "./types.js";
export const client = createClient({ cacheDir: 'C:/Users/SOL/Desktop/Projet for Breeze/wesite/tina/__generated__/.cache/1784609181707', url: 'https://content.tinajs.io/2.4/content/local-dev/github/main', token: 'local-dev-token', queries,  });
export default client;
  