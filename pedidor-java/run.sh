#!/bin/sh
cd "$(dirname "$0")" && javac -d out src/*.java && exec java -cp out Servidor
