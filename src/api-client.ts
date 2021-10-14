import { ContentApiClient, HaloRestAPIClient } from "@halo-dev/content-api";
const haloRestApiClient = new HaloRestAPIClient({
  baseUrl: 'https://ryanc.cc',
  auth: { apiToken: '11111111111111111111111' },
});
const haloContentClient = new ContentApiClient(haloRestApiClient);
export default haloContentClient