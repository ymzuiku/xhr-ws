interface IOptions {
    headers: any;
    timeout: number;
}
interface IBodyData {
    db?: string;
    col?: string;
    block?: {
        [name: string]: any;
    };
    method: string;
    args?: any[];
    argsSha256?: string[];
    argsObjectId?: string[];
    remove?: string[];
    [other: string]: any;
}
declare function createHttpClient(url: string, options?: IOptions): (data: IBodyData) => Promise<unknown>;
declare function createWsClient(url: string): (data: IBodyData) => Promise<unknown>;
export { createHttpClient, createWsClient };
