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
      var { headers, timeout = 4000 } = options || {};
      var xhr = new XMLHttpRequest();
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
  var wsUrl = url;
  var ws: WebSocket;
  var callbacks = {};
  var wsNameNubmer = 0;

  function connectWs() {
    ws = new WebSocket(wsUrl);
    ws.onmessage = function(msg) {
      var res = JSON.parse(msg.data);
      if (res.wsName && callbacks[res.wsName]) {
        callbacks[res.wsName](res);
      }
    };
  }
  connectWs();

  return (data: IBodyData) => {
    return new Promise(cb => {
      wsNameNubmer += 1;
      if (wsNameNubmer > 60000) {
        wsNameNubmer = 0;
      }
      var wsName = wsNameNubmer;
      data.wsName = wsName;

      var msg = JSON.stringify(data);
      var timer;
      function safeSend() {
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
        if (ws.readyState !== 1) {
          connectWs();
          timer = setTimeout(() => {
            safeSend();
          }, 2000);
        } else {
          ws.send(msg);
        }
      }
      safeSend();

      callbacks[wsName] = function(res: any) {
        cb(res);
        delete callbacks[wsName];
      };
    });
  };
}

(window as any).createHttpClient = createHttpClient;
(window as any).createWsClient = createWsClient;

export { createHttpClient, createWsClient };
