interface IOptions {
  headers: any;
  timeout: number;
}

interface IBodyData {
  db?: string;
  col?: string;
  block?: { [name: string]: any };
  method: string;
  args?: any[];
  // 用来标记需要转化为 sha256 的args路径
  argsSha256?: string[];
  // 用来标记需要转化为 ObjectId 的args路径
  argsObjectId?: string[];
  remove?: string[];
  [other: string]: any;
}

function createHttpClient(url: string, options?: IOptions) {
  return function(data: IBodyData) {
    return new Promise(function(cb) {
      const { headers, timeout = 4000 } = options || {};
      const xhr = new XMLHttpRequest();
      function loaded(res: any) {
        if (res && res.target) {
          cb(res.target.response);
        } else {
          cb({ error: 'XMLHttpRequest callback is error' });
        }
      }
      xhr.addEventListener('load', loaded);
      xhr.addEventListener('error', loaded);
      xhr.addEventListener('timeour', function() {
        cb({ error: `time out: ${timeout}ms`, url });
      });
      xhr.open('POST', url, true);
      xhr.timeout = timeout;
      xhr.responseType = 'json';
      xhr.setRequestHeader('content-type', 'application/json');
      if (headers) {
        Object.keys(headers).forEach(function(k) {
          xhr.setRequestHeader(k, headers[k]);
        });
      }
      xhr.send(JSON.stringify(data));
    });
  };
}

function createWsClient(url: string) {
  let ws: WebSocket;
  let wsNum = 0;

  const callbacks = {};

  function connectWs() {
    if (ws) {
      ws.close();
    }

    ws = new WebSocket(url);
    ws.onmessage = function(msg) {
      const res = JSON.parse(msg.data);

      if (res._ws && callbacks[res._ws]) {
        callbacks[res._ws](res);
      }
    };
  }
  connectWs();

  return (data: IBodyData) => {
    return new Promise(cb => {
      wsNum += 1;
      if (wsNum > 60000) {
        wsNum = 0;
      }
      const _ws = wsNum;
      data._ws = _ws;

      const msg = JSON.stringify(data);
      let timer;

      function safeSend() {
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
        if (ws.readyState > 1) {
          connectWs();
          timer = setTimeout(() => {
            safeSend();
          }, 3000);
        } else {
          ws.send(msg);
        }
      }
      safeSend();

      callbacks[_ws] = function(res: any) {
        const theWs = res.theWs;
        res._ws = undefined;
        cb(res);
        delete callbacks[theWs];
      };
    });
  };
}

(window as any).createHttpClient = createHttpClient;
(window as any).createWsClient = createWsClient;

export { createHttpClient, createWsClient };
