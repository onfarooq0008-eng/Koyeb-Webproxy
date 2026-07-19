const WebSocket = require("ws");
const httpProxy = require("http-proxy");


const proxy =
httpProxy.createProxyServer({
    ws:true,
    changeOrigin:true
});


function setupWebSocket(server){


server.on(
"upgrade",
(req,socket,head)=>{


try{


let target =
req.headers.host;


proxy.ws(
req,
socket,
head,
{
target:
"wss://"+target
}
);


}catch(e){

socket.destroy();

}


});


}


module.exports={
setupWebSocket
};
