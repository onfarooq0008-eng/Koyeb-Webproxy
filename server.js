require("events").EventEmitter.defaultMaxListeners = 50;

const express = require("express");
const compression = require("compression");
const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");

const app = express();

const PORT = 8000;


app.use(compression());

app.use(express.static("public"));


const dataDir="./data";
const cookieFile="./data/cookies.json";


if(!fs.existsSync(dataDir)){
    fs.mkdirSync(dataDir);
}


let cookies={};


if(fs.existsSync(cookieFile)){
    cookies=JSON.parse(
        fs.readFileSync(cookieFile,"utf8")
    );
}


function saveCookies(){
    fs.writeFileSync(
        cookieFile,
        JSON.stringify(cookies,null,2)
    );
}



function encodeURL(url){

    return Buffer
    .from(url)
    .toString("base64");

}


function decodeURL(url){

    return Buffer
    .from(url,"base64")
    .toString();

}



function rewriteURL(base,value){

    if(!value) return value;


    if(
        value.startsWith("http") ||
        value.startsWith("data:")
    ){

        return "/browse/" + encodeURL(value);

    }


    if(value.startsWith("//")){

        return "/browse/" + 
        encodeURL("https:"+value);

    }


    try{

        let full =
        new URL(value,base)
        .href;


        return "/browse/" + encodeURL(full);


    }catch{

        return value;

    }

}




app.get("/",(req,res)=>{

    res.sendFile(
        path.join(
            __dirname,
            "public/index.html"
        )
    );

});





app.get("/proxy",(req,res)=>{


    let url=req.query.url;


    if(!url)
        return res.send("Missing URL");


    if(!url.startsWith("http"))
        url="https://"+url;


    res.redirect(
        "/browse/"+encodeURL(url)
    );


});







app.use("/browse/:encoded",async(req,res)=>{


    let target;


    try{

        target=
        decodeURL(req.params.encoded);


    }catch{

        return res.status(400)
        .send("Invalid URL");

    }



    try{


        let host =
        new URL(target).hostname;



        let response =
        await axios.get(target,{

            responseType:"arraybuffer",

            maxRedirects:5,


            headers:{


                "User-Agent":
                "Mozilla/5.0 (X11; Linux x86_64) Chrome/120 Safari/537.36",


                "Cookie":
                cookies[host] || ""

            },

            validateStatus(){
                return true;
            }

        });



        let setCookie =
        response.headers["set-cookie"];



        if(setCookie){

            cookies[host]=
            setCookie
            .map(x=>x.split(";")[0])
            .join("; ");


            saveCookies();

        }




        let contentType =
        response.headers["content-type"] || "";




        // HTML rewrite

        if(contentType.includes("text/html")){


            let html =
            response.data.toString();


            const $ =
            cheerio.load(html);



            $("a").each(function(){

                let href=$(this).attr("href");

                $(this).attr(
                    "href",
                    rewriteURL(target,href)
                );

            });



            $("form").each(function(){

                let action=$(this).attr("action");

                $(this).attr(
                    "action",
                    rewriteURL(target,action)
                );

                $(this).attr(
                    "method",
                    "GET"
                );

            });



            $("img").each(function(){

                let src=$(this).attr("src");

                $(this).attr(
                    "src",
                    rewriteURL(target,src)
                );

            });



            $("script").each(function(){

                let src=$(this).attr("src");

                if(src){

                    $(this).attr(
                        "src",
                        rewriteURL(target,src)
                    );

                }

            });



            $("link").each(function(){

                let href=$(this).attr("href");

                $(this).attr(
                    "href",
                    rewriteURL(target,href)
                );

            });



            res.set(
                "content-type",
                "text/html"
            );


            return res.send(
                $.html()
            );


        }



        // Images, videos, files streaming

        res.set(
            "content-type",
            contentType
        );


        res.send(response.data);



    }catch(err){

        console.log(err.message);

        res.status(500)
        .send("Proxy error");

    }



});





app.listen(PORT,()=>{

console.log(
"HTML Proxy running on port "+PORT
);

});
