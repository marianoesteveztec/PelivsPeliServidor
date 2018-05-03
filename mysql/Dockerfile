FROM mysql:5.7.15

MAINTAINER Mariano Estevez

ENV MYSQL_DATABASE=competencias \
    MYSQL_ROOT_PASSWORD=Marian

ADD dump_base_de_datos.sql /docker-entrypoint-initdb.d

EXPOSE 3306
