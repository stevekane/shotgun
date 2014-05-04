#Running locally
1. Install phantomjs globally ```npm install -g phantomjs```
2. Clone the repository
3. Run ```npm install```
4. Start a process for the simple appserver ```node appserver.js```
5. Start a process for the phantomjs app ```node node-phantom.js```
6. Point your browser to ```http://localhost:8081```.
7. Enter a complete url including ```http``` into the input and press <enter>

You should see a screen capture of the provided url appear after several seconds.

Alternatively, you can use cURL or Postman to send a POST request to 
```http://localhost:8080/capture```
with a payload
```{"url": "http://google.com"}
You will get back a json payload that includes a base64 encoded image.
