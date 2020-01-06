#!/bin/sh -l
docker buildx build --platform $1 -t $2:$3 .