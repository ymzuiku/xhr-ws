interface IOptions {
    headers: any;
    timeout: number;
}
interface IBodyData {
    url?: any;
    headers?: any;
    body?: any;
    [other: string]: any;
}
declare function createHttpClient(url: string, options?: IOptions): (data: IBodyData) => Promise<unknown>;
declare function createWsClient(url: string): (data: IBodyData) => Promise<unknown>;
export { createHttpClient, createWsClient };
