import { config } from "dotenv";
config();

import { createServer } from "./server";
export { TIME_INTERVALS } from "./server/storage";
export type { PodcastFlow, TimeInterval } from "./server/storage";

const port = process.env.PORT || 8888;
const host = process.env.HOST || "localhost";
const app = createServer();

// tslint:disable-next-line:no-console
app.listen(port, () => console.log(`Listening http://${host}:${port}`));
