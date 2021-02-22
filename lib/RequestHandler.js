import Axios from "axios";
import qs from "querystring";
import { EventEmitter } from "events";
import { Storage } from "./Storage";

export default class RequestHandler extends EventEmitter {
  constructor({ storage, refreshUrl, clientId, clientSecret, redirectUri }) {
    super();

    if (storage && !(storage instanceof Storage)) throw new TypeError(`[(oauth-saver) RequestHandler.constructor] config.storage must be an instance of the 'Storage' class`);

    if (typeof refreshUrl !== "string")
      throw new TypeError(`[(oauth-saver) RequestHandler.constructor] config.refreshUrl must be of type 'string' received type '${typeof refreshUrl}'`);

    if (typeof clientId !== "string") throw new TypeError(`[(oauth-saver) RequestHandler.constructor] config.clientId must be of type 'string' received type '${typeof clientId}'`);

    if (typeof clientSecret !== "string")
      throw new TypeError(`[(oauth-saver) RequestHandler.constructor] config.clientSecret must be of type 'string' received type '${typeof clientSecret}'`);

    if (typeof redirectUri !== "string")
      throw new TypeError(`[(oauth-saver) RequestHandler.constructor] config.redirectUri must be of type 'string' received type '${typeof redirectUri}'`);

    this.storage = storage || new Storage();
    this.refreshUrl = refreshUrl;
    this.scope = scope;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.redirectUri = redirectUri;
  }

  setTokenInfo({ accessToken, refreshToken, expiresInMs, type, scope, fetchedTimestamp = Date.now() }) {
    if (typeof accessToken !== "string")
      throw new TypeError(`[(oauth-saver) RequestHandler.setTokens] options.accessToken must be of type 'string' received type '${typeof accessToken}'`);

    if (typeof expiresInMs !== "number")
      throw new TypeError(`[(oauth-saver) RequestHandler.setTokens] options.expiresInMs must be of type 'number' received type '${typeof expiresInMs}'`);

    if (typeof type !== "string") throw new TypeError(`[(oauth-saver) RequestHandler.setTokens] options.type must be of type 'string' received type '${typeof type}'`);

    if (typeof scope !== "string") throw new TypeError(`[(oauth-saver) RequestHandler.setTokenInfo] options.scope must be of type 'string' received type '${typeof scope}'`);

    this.storage.set("access_token", accessToken).set("expires_in_ms", expiresInMs).set("fetched_timestamp", fetchedTimestamp).set("type", type).set("scope", scope);

    if (refreshToken) this.storage.set("refresh_token", refreshToken);
  }

  getTokenInfo() {
    return {
      accessToken: this.storage.get("access_token"),
      refreshToken: this.storage.get("refresh_token"),
      expiresInMs: this.storage.get("expires_in_ms"),
      fetchedTimestamp: this.storage.get("fetched_timestamp"),
      type: this.storage.get("type"),
      scope: this.storage.get("scope"),
    };
  }

  refresh() {
    return new Promise((resolve, reject) => {
      const refresh_token = this.storage.get("refresh_token");
      const scope = this.storage.get("scope");
      const type = this.storage.get("type");

      if (!refresh_token) return reject("[(oauth-saver) RequestHandler.refresh] refresh_token not found. Make sure to run RequestHandler.setTokenInfo before refreshing");
      if (!scope) return reject("[(oauth-saver) RequestHandler.refresh] scope not found. Make sure to run RequestHandler.setTokenInfo before refreshing");
      if (!type) return reject("[(oauth-saver) RequestHandler.refresh] type not found. Make sure to run RequestHandler.setTokenInfo before refreshing");

      Axios.post(
        this.refreshUrl,
        qs.stringify({
          refresh_token,
          scope,
          grant_type: "refresh_token",
          redirect_uri: this.redirectUri,
          client_id: this.clientId,
          client_secret: this.clientSecret,
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      )
        .then((res) => {
          const listenedTo = this.emit("refresh", res.data);
          if (listenedTo) resolve();
          else
            reject(
              new Error("[(oauth-saver) RequestHandler.refresh] 'refresh' event has no listeners. Please listen to the 'refresh' event and set new information in the callback")
            );
        })
        .catch(reject);
    });
  }

  async request(options, authenticate) {
    const expired = this.isExpired;

    if (expired === true) return await this.refresh();

    const tokenInfo = this.getTokenInfo();
    if (authenticate && tokenInfo.accessToken) {
      if (!options.headers) options.headers = {};
      options.headers.Authorization = `${tokenInfo.type || "Bearer"} ${tokenInfo.accessToken}`;
    }

    return await Axios(options);
  }

  get isExpired() {
    const expiresInMs = this.storage.get("expires_in_ms");
    const fetched = this.storage.get("fetched_timestamp");
    const now = Date.now();

    if (!fetched || !expiresInMs) return;

    return fetched + expiresInMs > now;
  }
}
