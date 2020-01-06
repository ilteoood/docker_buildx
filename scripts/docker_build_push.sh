#!/bin/sh -l
export DOCKER_CLI_EXPERIMENTAL=enabled
docker buildx build --platform $1 --push -t $2:$3 .