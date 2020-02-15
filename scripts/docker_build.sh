#!/bin/sh -l
export DOCKER_CLI_EXPERIMENTAL=enabled

docker buildx build $@ .
