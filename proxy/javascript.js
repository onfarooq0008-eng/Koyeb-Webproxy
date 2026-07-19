function rewriteJS(code){

    // Basic URL protection
    code = code.replace(
        /window\.location/g,
        "window.__proxy_location"
    );


    code = code.replace(
        /location\.href/g,
        "window.__proxy_location"
    );


    return code;

}


module.exports={
    rewriteJS
};
