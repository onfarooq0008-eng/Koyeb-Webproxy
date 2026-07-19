const cheerio=require("cheerio");


function makeURL(base,url,encode){


if(!url)
return url;


if(
url.startsWith("#") ||
url.startsWith("javascript:")
)
return url;



try{


let full=
new URL(url,base)
.href;


return "/web/"+encode(full);


}catch(e){

return url;

}


}





function rewriteHTML(html,base,encode){


const $=
cheerio.load(html);



$("a").each(function(){

let v=$(this).attr("href");

if(v)
$(this).attr(
"href",
makeURL(base,v,encode)
);

});



$("img").each(function(){

let v=$(this).attr("src");

if(v)
$(this).attr(
"src",
makeURL(base,v,encode)
);

});



$("script").each(function(){

let v=$(this).attr("src");

if(v)
$(this).attr(
"src",
makeURL(base,v,encode)
);

});



$("link").each(function(){

let v=$(this).attr("href");

if(v)
$(this).attr(
"href",
makeURL(base,v,encode)
);

});



$("form").each(function(){

let v=$(this).attr("action");

if(v)
$(this).attr(
"action",
makeURL(base,v,encode)
);

});



return $.html();

}



module.exports={
rewriteHTML
};
