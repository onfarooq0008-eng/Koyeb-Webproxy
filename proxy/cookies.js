const fs=require("fs");


const file="./data/cookies.json";


if(!fs.existsSync("./data")){
fs.mkdirSync("./data");
}



let database={};


if(fs.existsSync(file)){

database=
JSON.parse(
fs.readFileSync(file)
);

}



function save(){

fs.writeFileSync(
file,
JSON.stringify(database,null,2)
);

}



function getCookies(host){

return database[host] || "";

}



function setCookies(host,value){

if(!value)
return;


database[host]=
value
.map(
x=>x.split(";")[0]
)
.join("; ");


save();

}



module.exports={
getCookies,
setCookies
};
