#!/bin/sh -l
export DOCKER_CLI_EXPERIMENTAL=enabled
docker buildx build --platform $1 -t $2:$3 .