# Elige la imagen de Ubuntu
FROM ubuntu:trusty

# Autora
MAINTAINER Mariano Estevez

# Instalar Node.js y algunas dependencias
RUN apt-get update && \
    apt-get -y install curl && \
    curl -sL https://deb.nodesource.com/setup_6.x | sudo bash - && \
    apt-get -y install python build-essential nodejs

# Pasa módulos de node (node_modules) para caché
ADD package.json /src/package.json

# Elige el directorio de trabajo
WORKDIR /src

EXPOSE 8080

# Instala dependencias
RUN npm install

# Copia del directorio donde está el código al directorio dentro del container donde se va a ejecutar
COPY [".", "/src"]

# Ejecuta la aplicación con el parámetro
CMD ["node", "/src/servidor.js"]
