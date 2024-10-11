# Installation Guide
This section will walk through how to access the application and how to run it locally.
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
- vite

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
```
Two instances must now be run: the front-end and the back-end.

### Front-end
To start the front-end:
```shell
cd expressThree
npm i
npm run start
```
This will begin a front-end instance.

### Backend
To start the backend:
```shell
cd server
npm i
npx ts-node index.ts
```
This will start the back-end instance.