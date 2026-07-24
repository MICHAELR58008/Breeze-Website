import { createClient } from "tinacms/dist/client";
import { queries } from "./types.js";
export const client = createClient({ url: 'http://localhost:4001/graphql', token: '9e4f89469dd183ede361cd1b51ffdf902089aacf', queries,  });
export default client;
  