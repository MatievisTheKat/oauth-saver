import { AxiosRequestOptions } from "axios";
import { EventEmitter } from "events";

declare module "oauth-saver" {
  export interface RequestHandlerEvents {
    refresh: PartialTokenInfo;
  }

  export interface StorageKeys {
    access_token?: string;
    refresh_token?: string;
    expires_in_ms?: number;
    fetched_timestamp?: number;
    type?: string;
    scope?: string;
  }

  export class RequestHandler extends EventEmitter {
    private storage: Storage;
    private clientSecret: string;

    public refreshUrl: string;
    public scope: string;
    public clientId: string;
    public redirectUri: string;

    constructor(options: RequestHandlerOptions);

    public on<E extends keyof RequestHandlerEvents>(e: E, cb: (data: RequestHandlerEvents[E]) => void): this;

    public request<RequestResponse extends any, TokenResponse extends any>(options: AxiosRequestOptions): AxiosPromise<RequestResponse | TokenResponse>;
    public setTokenInfo(tokenInfo: CompleteTokenInfo): void;
    public getTokenInfo(): PartialTokenInfo;

    public get isExpired(): boolean;
  }

  export class Storage {
    public set(key: keyof StorageKeys, value: any): Storage;
    public get<K extends keyof StorageKeys>(key: K): StorageKeys[K];
    public delete(key: string): Storage;
  }

  export interface RequestHandlerOptions {
    storage?: Storage;
    refreshUrl: string;
    scope: string;
  }

  export interface CompleteTokenInfo {
    accessToken: string;
    refreshToken?: string;
    expiresInMs: number;
    fetchedTimestamp: number;
    type: string;
  }

  export interface PartialTokenInfo {
    accessToken?: string;
    refreshToken?: string;
    expiresInMs?: number;
    fetchedTimestamp?: number;
    type?: string;
  }

  export type Method = "get" | "delete" | "head" | "options" | "post" | "put" | "patch" | "purge" | "link" | "unlink";
}
