## Accessing container environment at startup time with typescript / react / docker

1. **Create example app**

```
npx create-react-app read-env-example --template typescript

```

2. **Navigate to fresh app**
```
cd read-env-example
```

3. **Create Dockerfile**

```
mkdir -p docker/build
```

*docker/build/Dockerfile*
```
# build environment
FROM node:19-alpine3.15 as builder
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH

COPY package.json ./
COPY package-lock.json ./
RUN npm ci
RUN npm install react-scripts@5.0.1 -g
COPY . ./
RUN PUBLIC_URL="." npm run build

# production environment
FROM nginx:stable-alpine
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

COPY docker/build/docker-entrypoint.sh /
RUN chmod +x docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]

```

4. **Create docker-entrypoint.sh**

This script will be executed at container start. 
It generates the `config.js` file containing all environment variables starting with 'MYAPP' under `window.extended`.

*docker/build/docker-entrypoint.sh*
```
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
```

5. **Create docker-compose.yml**

```
mkdir docker/run
```

*docker/run/docker-compose.yml*
```
version: "3.2"
services:

  read-env-example:
    image: read-env-example:0.1.0
    ports:
      - 80:80
    env_file:
      - myapp.env
    
```

6. **Create runtime config for your app**

*docker/run/myapp.env*
```
MYAPP_API_ENDPOINT='http://elasticsearch:9200'
```

7. **Create config.js** <-- this is where .env will be injected.

*public/config.js*
```
/*<![CDATA[*/
window.extended = window.extended || {};
window.extended.MYAPP_API_ENDPOINT='http://localhost:9200';
/*]]>*/
```

Note: This file will be completely overwritten by the `docker-entrypoint.sh`. For development purposes you can set it to any value that is appropriate, e.g. when used together with `npm start`.


8. **Include config.js in index.html**

*public/index.html*
```
   <head>
     ...
    <script type="text/javascript" src="%PUBLIC_URL%/config.js" ></script>
     ...
   </head>
   <body>
```

9. **Make use of your environment variable**

*src/App.tsx*
```
declare global {
    interface Window { extended: any; }
}
function App() {
  return (
    <div className="App">
      <header className="App-header">
        
          You have configured {window.extended.MYAPP_API_ENDPOINT}

      </header>
    </div>
  );
}
```
10. **Build**

```
npm install
```

11. **Create docker image**

```
docker build -f docker/build/Dockerfile -t read-env-example:0.1.0 .
```

12. **Run container**

```
docker-compose -f ./docker/run/docker-compose.yml up
```

13. **Navigate to your app**

Open http://localhost in your browser. 
You will see the content of `MYAPP_API_ENDPOINT` like you provided in your `docker/run/myapp.env`.

14. **Further usage**

You can provide additional variables starting with `MYAPP`. The `docker-entrypoint.sh` script will search for all variables starting with `MYAPP` and make them available through the `windows` object.

