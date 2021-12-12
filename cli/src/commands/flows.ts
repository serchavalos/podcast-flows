import { createAuthorizedInstance } from "../utils/spotify-web-api.js";
import { green, red } from "../utils/log.js";

type Opts = {
  shows: string[];
};

export async function createNewFlow(name: string, { shows }: Opts) {
  const api = await createAuthorizedInstance();
  let data;

  try {
    data = await api.getMe();
  } catch (err) {
    red(`Oooops! something went wrong ${err}`);
    process.exit(1);
  }

  const username = data.body["display_name"];

  green(
    `Welcone ${username}!\nA new podcast flow called "${name}" and subscribed to ${shows.join(
      ", "
    )} has been created for you.`
  );
  process.exit(0);
}
