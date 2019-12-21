# xhr-ws

## Simple http require and websocket require

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>Test client</title>
    <script src="https://unpkg.com/xhr-ws@0.1.1/umd/xhr-ws.js"></script>
  </head>
  <body>
    <!-- http example -->
    <script>
      var httpClient = createHttpClient('http://127.0.0.1:4010/less');

      window.onHttpClick = function() {
        httpClient({
          db: 'test',
          col: 'test',
          method: 'insertOne',
          args: [{ name: 'dog', age: '11', createAt: Date.now() }],
        }).then(function(res) {
          document.getElementById('response-http').innerHTML = JSON.stringify(res);
        });
      };
    </script>
    <button onclick="onHttpClick()">test http</button>
    <div>response-http:</div>
    <div id="response-http"></div>

    <!-- websocket example -->
    <script>
      var wsClient = createWsClient('ws://127.0.0.1:4010');

      window.onWsClick = function() {
        wsClient({
          db: 'test',
          col: 'test',
          method: 'insertOne',
          args: [{ name: 'dog', age: '22', createAt: Date.now() }],
        }).then(function(res) {
          document.getElementById('response-ws').innerHTML = JSON.stringify(res);
        });
      };
    </script>
    <button onclick="onWsClick()">test websocket</button>
    <div>response-ws:</div>
    <div id="response-ws"></div>
  </body>
</html>
```
