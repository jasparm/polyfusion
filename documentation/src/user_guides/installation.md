# Installation Guide
This section will walk through how to access the application and how to run it locally.

This is entirely optional and Polyfusion can be accessed online via (URL to hosted link maybe?)
## Requirements
### Software Requirements
- Node.JS (version 16.x or later)
- npm
- A modern Web Browser
    - Google Chrome: Version 61 or later
    - Mozilla Firefox: Version 60 or later
    - Microsoft Edge: Version 79 or later
    - Safari: Version 11 or later.
    - Any other web browser with support for WebGL and ES6+
- git *(optional - only needed to run locally)*

### Hardware Requirements
Minimum System Requirements:
- CPU: Intel Core i3 or equivalent
- RAM: 4 GB (8GB recommended)
- GPU: Integrated graphics (better performance with dedicated GPU)
- Operating system:
    - Windows 10 or later
    - macOS 10.13 (High Sierra) or later
    - Linux: Any modern distribution with a desktop environment
- Recommended resolution: 1920x1080 or higher

Please note that these requirements have not been fully tested as long as there is a compatible desktop browser it should be able to run, performance may vary.


## Setup
Once the repository has been cloned we need to setup the node environment.
```shell
cd polyfusion
npm run install-all-deps
```
A local instance can now be run.
```shell
npm run dev
```  
Alternatively, back-end and front-end instances can be run by themselves. To do this you must install packages for the service you are requiring.
#### Front-End only example:
```shell
cd polyfusion/client
npm install
```
This will install all packages needed for the front-end.
```shell
npm start
```
This will now start just a front-end instance.