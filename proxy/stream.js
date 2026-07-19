const axios = require("axios");


async function streamRequest(url, req, res, headers){


    try{


        const response =
        await axios({

            url:url,

            method:req.method,

            responseType:"stream",

            headers:{

                ...headers,

                range:req.headers.range || ""

            },

            validateStatus(){
                return true;
            }

        });



        res.status(
            response.status
        );


        Object.keys(
            response.headers
        ).forEach(key=>{

            const blocked=[
                "connection",
                "transfer-encoding"
            ];


            if(!blocked.includes(key)){

                res.setHeader(
                    key,
                    response.headers[key]
                );

            }

        });



        response.data.pipe(res);



    }catch(err){

        res.status(500)
        .send("Stream error");

    }


}



module.exports={
    streamRequest
};
