require("events").EventEmitter.defaultMaxListeners = 50;

const express = require("express");
const compression = require("compression");
const fs = require("fs");
const crypto = require("crypto");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();

const PORT = 8000;

app.set("trust proxy", false);

app.use(compression());

app.use(express.static("public"));


const cookieFile = "./data/cookies.json";

let cookies = {};

if (fs.existsSync(cookieFile)) {
    cookies = JSON.parse(
        fs.readFileSync(cookieFile, "utf8")
    );
}


function saveCookies() {

    fs.writeFileSync(
        cookieFile,
        JSON.stringify(cookies, null, 2)
    );

}



// Home
app.get("/", (req, res) => {

    res.sendFile(
        __dirname + "/public/index.html"
    );

});



// Start proxy
app.get("/proxy", (req, res) => {

    let url = req.query.url;


    if (!url) {
        return res.send("Missing URL");
    }


    if (!url.startsWith("http")) {
        url = "https://" + url;
    }


    const encoded = Buffer
        .from(url)
        .toString("base64");


    res.redirect(
        "/browse/" + encoded
    );

});




// Proxy handler
app.use("/browse/:target", (req, res, next) => {


    let encoded = req.params.target;


    let target;

    try {

        target = Buffer
            .from(encoded, "base64")
            .toString();

    } catch(e){

        return res.status(400)
        .send("Invalid URL");

    }



    let parsed;


    try {

        parsed = new URL(target);

    } catch(e){

        return res.status(400)
        .send("Bad URL");

    }



    const host = parsed.hostname;



    const proxy = createProxyMiddleware({

        target: parsed.origin,

        changeOrigin: true,

        secure: false,

        followRedirects: true,


        pathRewrite: function(path, req) {


            let original =
            req.originalUrl;


            let remove =
            "/browse/" + encoded;


            let newPath =
            original.replace(remove,"");


            if(newPath === ""){
                newPath="/";
            }


            return newPath;

        },



        onProxyReq(proxyReq){


            // Fake desktop browser

            proxyReq.setHeader(
                "user-agent",
                "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
            );


            proxyReq.removeHeader(
                "x-forwarded-for"
            );


            proxyReq.removeHeader(
                "x-real-ip"
            );


            proxyReq.removeHeader(
                "client-ip"
            );


            proxyReq.removeHeader(
                "referer"
            );


            proxyReq.removeHeader(
                "origin"
            );



            // Send stored cookies

            if(cookies[host]){

                proxyReq.setHeader(
                    "cookie",
                    cookies[host]
                );

            }


        },



        onProxyRes(proxyRes){


            // Save cookies

            let setCookie =
            proxyRes.headers["set-cookie"];


            if(setCookie){


                cookies[host] =
                setCookie
                .map(
                    c => c.split(";")[0]
                )
                .join("; ");


                saveCookies();

            }



            // Video streaming support

            proxyRes.headers[
                "accept-ranges"
            ] = "bytes";


        }


    });


    proxy(req,res,next);


});





app.listen(PORT,()=>{

    console.log(
        "Proxy running on port " + PORT
    );

});
