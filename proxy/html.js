const cheerio = require("cheerio");


function rewriteURL(base, value, encode){


    if(!value)
        return value;



    // already proxy links

    if(value.startsWith("/web/")){
        return value;
    }



    // Ignore special links

    if(
        value.startsWith("#") ||
        value.startsWith("javascript:") ||
        value.startsWith("mailto:")
    ){

        return value;

    }




    try{


        let full =
        new URL(
            value,
            base
        ).href;



        return "/web/" + encode(full);



    }catch(e){


        return value;


    }


}





function rewriteHTML(html,base,encode){


    const $ =
    cheerio.load(html);



    // Links

    $("a").each(function(){


        let href =
        $(this).attr("href");


        if(href){

            $(this).attr(
                "href",
                rewriteURL(
                    base,
                    href,
                    encode
                )
            );

        }


    });





    // Forms

    $("form").each(function(){


        let action =
        $(this).attr("action");



        if(action){

            $(this).attr(
                "action",
                rewriteURL(
                    base,
                    action,
                    encode
                )
            );


        }


    });







    // Images

    $("img").each(function(){


        let src =
        $(this).attr("src");


        if(src){

            $(this).attr(
                "src",
                rewriteURL(
                    base,
                    src,
                    encode
                )
            );

        }


    });







    // JavaScript files

    $("script").each(function(){


        let src =
        $(this).attr("src");



        if(src){

            $(this).attr(
                "src",
                rewriteURL(
                    base,
                    src,
                    encode
                )
            );

        }


    });







    // CSS files

    $("link").each(function(){


        let href =
        $(this).attr("href");



        if(href){

            $(this).attr(
                "href",
                rewriteURL(
                    base,
                    href,
                    encode
                )
            );

        }


    });







    // Video sources

    $("video").each(function(){


        let src =
        $(this).attr("src");



        if(src){

            $(this).attr(
                "src",
                rewriteURL(
                    base,
                    src,
                    encode
                )
            );

        }


    });




    return $.html();

}



module.exports = {

rewriteHTML

};
