import { AxiosRequestOptions } from "axios";

declare module "oauth-saver" {
  export class RequestHandler {
    private storage: Storage;

    constructor(options: RequestHandlerOptions);

    request<T = any>(options: AxiosRequestOptions): AxiosPromise<T>;
    setTokenInfo(tokenInfo: CompleteTokenInfo): void;
    getTokenInfo(): PartialTokenInfo;
  }

  export class Storage {
    set(key: string, value: any): Storage;
    get<T = any>(key: string): T | void;
    delete(key: string): Storage;
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
