function cleanHeaders(){


return {


    // Server browser identity

    "User-Agent":
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120 Safari/537.36",



    "Accept":
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",



    "Accept-Language":
    "en-US,en;q=0.9",




    // Remove client information

    "X-Forwarded-For":
    "",


    "X-Real-IP":
    "",


    "Client-IP":
    "",


    "Forwarded":
    ""

};


}



module.exports = {

cleanHeaders

};
