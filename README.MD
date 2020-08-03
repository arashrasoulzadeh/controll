# index
- [Description](#description)
- [Development](#development) 
- [Changelog](CHANGELOG.MD)

# Description 
Controll is a `under-development` bare-metal server controller, it launches a websocket server on client and has a simple ui to controll the server with websocket.
its fully customizable. please feel free to help.
sample modules config available [here](modules.json)

# Development 
To help developing `controll`, you need to clone the repo and to run the ws server, simply enter `npm start` in root directory, and to launch the dashboard pleaser navigate to `dashboard` folder and enter `npm run dev` to run `angular` dev server.

`controll` has two servers, first a `websocket` server that should run in the server, and a `dashbord` that you may run in server and/or local machine. this dashboard will connect the websocket server to exchange commands and data.

Concepts of server : 
- `modules` is the server list file, normally loaded from `modules.json` in root folder
- `probe` is the readines/liveness probe files,written in `js`, probes called in `health.js` file.




to do : 
- [X] add liveness check
- [X] add readiness check
- [ ] add ssh(remote) jobs
- [ ] add authentication
- [ ] better ui
