const express = require("express");
const compression = require("compression");
const NodeCache = require("node-cache");
const { CookieJar } = require("tough-cookie");
const { createProxyMiddleware } = require("http-proxy-middleware");
const crypto = require("crypto");
const fs = require("fs");

const app = express();

const PORT = 8000;

// cache
const cache = new NodeCache({
    stdTTL: 300,
    checkperiod: 600
});

// cookie storage
const cookieFile = "./data/cookies.json";

let cookies = {};

if (fs.existsSync(cookieFile)) {
    cookies = JSON.parse(
        fs.readFileSync(cookieFile)
    );
}


function saveCookies(){

    fs.writeFileSync(
        cookieFile,
        JSON.stringify(cookies,null,2)
    );

}


app.use(compression());

app.use(express.static("public"));


// Home page
app.get("/",(req,res)=>{

    res.sendFile(
        __dirname + "/public/index.html"
    );

});



// Proxy start
app.get("/proxy",(req,res)=>{

    let url=req.query.url;


    if(!url){
        return res.send("No URL");
    }


    if(!url.startsWith("http")){
        url="https://"+url;
    }


    res.redirect(
        "/browse?url="+encodeURIComponent(url)
    );

});



// Browser proxy

app.use("/browse",(req,res,next)=>{


    let target=req.query.url;


    if(!target){
        return res.status(400)
        .send("Missing URL");
    }



    let cacheKey =
    crypto
    .createHash("md5")
    .update(target)
    .digest("hex");



    const proxy =
    createProxyMiddleware({

        target:target,

        changeOrigin:true,

        secure:false,

        followRedirects:true,


        selfHandleResponse:false,


        headers:{


            // hide mobile headers

            "user-agent":
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120 Safari/537.36",


            "accept-language":
            "en-US,en;q=0.9",


            "x-forwarded-for":
            "",


            "x-real-ip":
            "",


            "client-ip":
            ""

        },



        onProxyReq(proxyReq,req){


            // send stored cookies

            let host =
            new URL(target).hostname;


            if(cookies[host]){

                proxyReq.setHeader(
                    "cookie",
                    cookies[host]
                );

            }


            // remove identifying headers

            proxyReq.removeHeader(
                "referer"
            );

            proxyReq.removeHeader(
                "origin"
            );


        },



        onProxyRes(proxyRes){


            let setCookie =
            proxyRes.headers[
                "set-cookie"
            ];


            if(setCookie){


                let host =
                new URL(target)
                .hostname;


                cookies[host] =
                setCookie
                .map(x=>x.split(";")[0])
                .join("; ");


                saveCookies();

            }



            // allow video streaming

            proxyRes.headers[
                "accept-ranges"
            ]="bytes";


        }


    });


    proxy(req,res,next);


});



app.listen(PORT,()=>{

console.log(
"Proxy running on port "+PORT
);

});
