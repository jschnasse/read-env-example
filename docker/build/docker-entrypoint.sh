#!/bin/sh -eu


function generateConfigJs(){
    echo "/*<![CDATA[*/";
    echo "window.extended = window.extended || {};";
    for i in `env | grep '^MYAPP'`
    do
        key=$(echo "$i" | cut -d"=" -f1);
        val=$(echo "$i" | cut -d"=" -f2);
        echo "window.extended.${key}='${val}' ;";
    done
    echo "/*]]>*/";
}
generateConfigJs > /usr/share/nginx/html/config.js

nginx -g "daemon off;"