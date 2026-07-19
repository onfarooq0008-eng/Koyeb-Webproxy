require("events").EventEmitter.defaultMaxListeners = 50;

const express = require("express");
const compression = require("compression");
const axios = require("axios");
const path = require("path");

const {
    getCookies,
    saveCookies
} = require("./proxy/cookies");

const {
    cleanHeaders
} = require("./proxy/headers");

const {
    rewriteHTML
} = require("./proxy/html");


const app = express();

const PORT = 8000;


app.use(compression());

app.use(express.static("public"));



app.get("/",(req,res)=>{

    res.sendFile(
        path.join(
            __dirname,
            "public/index.html"
        )
    );

});





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






// Main proxy route

app.use("/web/:url",async(req,res)=>{


    let target;


    try{

        target =
        decode(req.params.url);


    }catch(e){

        return res.status(400)
        .send("Bad URL");

    }




    if(!target.startsWith("http")){

        target =
        "https://" + target;

    }





    try{


        let host =
        new URL(target).hostname;




        let response =
        await axios({

            url:target,

            method:req.method,


            responseType:"arraybuffer",


            maxRedirects:5,


            headers:{

                ...cleanHeaders(),

                Cookie:
                getCookies(host)

            },


            validateStatus(){
                return true;
            }


        });






        // Save cookies

        if(response.headers["set-cookie"]){

            saveCookies(
                host,
                response.headers["set-cookie"]
            );

        }






        let content =
        response.headers["content-type"] || "";





        // HTML pages

        if(content.includes("text/html")){


            let html =
            response.data.toString();



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







        // Images, videos, files

        res.setHeader(
            "content-type",
            content
        );


        if(response.headers["content-length"]){

            res.setHeader(
                "content-length",
                response.headers["content-length"]
            );

        }



        return res.send(
            response.data
        );





    }catch(err){


        console.log(
            err.message
        );


        res.status(500)
        .send(
            "Proxy failed"
        );


    }



});







app.listen(PORT,()=>{

console.log(
"Web Proxy running on port "+PORT
);


});
