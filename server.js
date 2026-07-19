require("events").EventEmitter.defaultMaxListeners = 50;
const express = require("express");
const compression = require("compression");
const fs = require("fs");
const crypto = require("crypto");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();

app.set("trust proxy", false);

const PORT = 8000;


app.use(compression());

app.use(express.static("public"));


const cookieFile="./data/cookies.json";

let cookies={};


if(fs.existsSync(cookieFile)){
    cookies=JSON.parse(
        fs.readFileSync(cookieFile)
    );
}


function saveCookies(){
    fs.writeFileSync(
        cookieFile,
        JSON.stringify(cookies)
    );
}


// Start proxy
app.get("/proxy",(req,res)=>{

    let url=req.query.url;

    if(!url)
        return res.send("Missing URL");


    if(!url.startsWith("http"))
        url="https://"+url;


    let encoded =
    Buffer.from(url).toString("base64");


    res.redirect(
        "/browse/"+encoded
    );

});



// Main proxy

app.use(
"/browse/:target/*?",
(req,res,next)=>{


let encoded=req.params.target;


let target =
Buffer.from(
encoded,
"base64"
).toString();


let urlObj =
new URL(target);



let proxy =
createProxyMiddleware({

target:
urlObj.origin,


changeOrigin:true,

secure:false,


pathRewrite(path){

let newPath =
path.replace(
"/browse/"+encoded,
""
);


return newPath || "/";

},



onProxyReq(proxyReq){



let host=urlObj.hostname;



if(cookies[host]){

proxyReq.setHeader(
"cookie",
cookies[host]
);

}



proxyReq.setHeader(
"user-agent",
"Mozilla/5.0 (X11; Linux x86_64) Chrome/120 Safari/537.36"
);



proxyReq.removeHeader(
"x-forwarded-for"
);

proxyReq.removeHeader(
"x-real-ip"
);



},



onProxyRes(proxyRes){


let host=urlObj.hostname;


let setCookie =
proxyRes.headers["set-cookie"];


if(setCookie){

cookies[host]=
setCookie
.map(
c=>c.split(";")[0]
)
.join("; ");


saveCookies();

}



proxyRes.headers[
"accept-ranges"
]="bytes";


}

});


proxy(req,res,next);


});



app.listen(PORT,()=>{

console.log(
"Proxy running on "+PORT
);

});
