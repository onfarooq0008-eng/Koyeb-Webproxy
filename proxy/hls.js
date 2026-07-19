const axios=require("axios");


async function proxyHLS(url,res){


try{


let r=
await axios.get(
url
);



let playlist =
r.data;



let base =
url.substring(
0,
url.lastIndexOf("/")
);



playlist =
playlist.replace(
/([^\n#][^\n]*)/g,
(match)=>{


if(
match.startsWith("http")
)
return "/web/"+Buffer
.from(match)
.toString("base64");


return "/web/"+Buffer
.from(
base+"/"+match
)
.toString("base64");


});



res.setHeader(
"content-type",
"application/vnd.apple.mpegurl"
);


res.send(
playlist
);



}catch(e){

res.status(500)
.send(
"HLS error"
);

}


}



module.exports={
proxyHLS
};
