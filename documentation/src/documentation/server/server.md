# Server

## Running the server

Before beginning, ensure that you have a .env file containing the following variables:

```env
DB_URI=<your mongodb uri>
SECRET_KEY=<your secret key for hashing>
*optional* PORT=<port number>
```

Also ensure that you have Node >= 22 installed on your machine.

To run the server, navigate to the server directory and run the server start script:

```./startserver.sh```

Ensure the script is runnable (`chmod +x startserver.sh`). This script should install / update any required dependencies and start the server on the specified port. If no port is specified, the server will default to port 3000.

