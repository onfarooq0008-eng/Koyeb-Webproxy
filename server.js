require("events").EventEmitter.defaultMaxListeners = 50;

const express = require("express");
const compression = require("compression");
const axios = require("axios");
const path = require("path");
const fs = require("fs");

const {
    rewriteHTML
} = require("./proxy/html");

const {
    cleanHeaders
} = require("./proxy/headers");


const app = express();

const PORT = 8000;


app.use(compression());

app.use(express.static("public"));



// Cookie database

const cookieFile =
"./data/cookies.json";


if(!fs.existsSync("./data")){
    fs.mkdirSync("./data");
}


let cookies={};


if(fs.existsSync(cookieFile)){

    cookies =
    JSON.parse(
        fs.readFileSync(cookieFile)
    );

}



function saveCookies(){

    fs.writeFileSync(
        cookieFile,
        JSON.stringify(
            cookies,
            null,
            2
        )
    );

}





function encode(url){

    return Buffer
    .from(url)
    .toString("base64");

}


function decode(url){

    return Buffer
    .from(url,"base64")
    .toString();

}





// Homepage

app.get("/",(req,res)=>{

    res.sendFile(
        path.join(
            __dirname,
            "public/index.html"
        )
    );

});






// Start proxy

app.get("/proxy",(req,res)=>{


    let url =
    req.query.url;


    if(!url){

        return res.send(
            "Missing URL"
        );

    }



    if(!url.startsWith("http")){

        url =
        "https://" + url;

    }



    res.redirect(
        "/web/" + encode(url)
    );


});









// Main web proxy

app.use("/web/:target",
async(req,res)=>{


    let target;


    try{

        target =
        decode(
            req.params.target
        );

    }
    catch(e){

        return res
        .status(400)
        .send("Invalid URL");

    }





    let parsed;


    try{

        parsed =
        new URL(target);

    }
    catch(e){

        return res
        .status(400)
        .send("Bad URL");

    }




    let host =
    parsed.hostname;



    try{


        let response =
        await axios({

            url:target,

            method:req.method,


            responseType:
            "arraybuffer",


            maxRedirects:0,



            headers:{


                ...cleanHeaders(),


                Cookie:
                cookies[host] || ""


            },


            validateStatus(){

                return true;

            }


        });

if(
response.status >= 300 &&
response.status < 400 &&
response.headers.location
){

    let redirectURL =
    new URL(
        response.headers.location,
        target
    ).href;


    return res.redirect(
        "/web/" + encode(redirectURL)
    );

}




        // Save cookies

        if(
        response.headers["set-cookie"]
        ){


            cookies[host] =
            response.headers["set-cookie"]
            .map(
                c=>c.split(";")[0]
            )
            .join("; ");


            saveCookies();

        }






        let type =
        response.headers[
            "content-type"
        ] || "";







        // HTML processing

        if(
        type.includes("text/html")
        ){


            let html =
            response.data
            .toString();


            html =
            rewriteHTML(
                html,
                target,
                encode
            );


            res.setHeader(
                "content-type",
                "text/html"
            );


            return res.send(html);

        }







        // Files / images / video

        res.setHeader(
            "content-type",
            type
        );


        if(
        response.headers["content-length"]
        ){

            res.setHeader(
                "content-length",
                response.headers["content-length"]
            );

        }



        return res.send(
            response.data
        );




    }
    catch(err){


        console.log(
            err.message
        );


        res.status(500)
        .send(
            "Proxy error"
        );


    }



});







app.listen(PORT,()=>{

console.log(
"🚀 Koyeb WebProxy Pro running on port "
+PORT
);

});
