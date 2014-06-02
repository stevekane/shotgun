#Running locally

1. Install phantomjs globally ```npm install -g phantomjs```
2. Clone the repository
3. Run ```npm install```
4. Start a process for the simple appserver ```node appserver.js```
5. Start a process for the phantomjs app ```node batch-phantom.js```
6. Point your browser to ```http://localhost:8081```.
7. Enter a complete url including ```http``` into the input and press <enter>

#Design

HTTP server listening to POST requests
-Request body must have all properties required to create a Job

jobs are queued onto a JOB queue
-each job is processed with a phantomJS process and maximum concurrency

When a page is processed, all available meta data about the page is returned
from the phantom capturing process.  

The PageVaultServerIP and IP of the website targetted must be captured as 
well before the final Payload can be constructed and sent to the image-processing 
pipeline for processing and uploads to the Page Vault API/Storage.

POST REQ -> 
  Job ->
    PageData && CaptureWebsiteIp && PageVaultServerIp
    ProcessingBundle -> POST REQ to Image Processor
      ResultFromImageProc
        Build JobResult 
