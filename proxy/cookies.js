const fs = require("fs");

const file = "./data/cookies.json";


if(!fs.existsSync("./data")){
    fs.mkdirSync("./data");
}


let cookieDB = {};


if(fs.existsSync(file)){

    cookieDB =
    JSON.parse(
        fs.readFileSync(
            file,
            "utf8"
        )
    );

}




function save(){

    fs.writeFileSync(
        file,
        JSON.stringify(
            cookieDB,
            null,
            2
        )
    );

}




function getCookies(host){

    return cookieDB[host] || "";

}





function saveCookies(host,setCookies){


    if(!setCookies)
        return;



    cookieDB[host] =
    setCookies
    .map(
        c => c.split(";")[0]
    )
    .join("; ");



    save();

}





module.exports = {

    getCookies,

    saveCookies

};
