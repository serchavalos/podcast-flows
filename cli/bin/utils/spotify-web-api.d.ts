import SpotifyWebApi from "spotify-web-api-node";
/**
 * Setup an instance from Spotify Web API by setting up the credentials, authenticating and authorizing
 */
export declare function createAuthorizedInstance(): Promise<SpotifyWebApi>;
