#!/bin/sh -l
docker buildx build --platform $1 --push -t $2:$3 .