#!/bin/sh -l
export DOCKER_CLI_EXPERIMENTAL=enabled
DOCKER_BUILDX_TAG_OPTS=
for TAG in $(echo "$3" | tr ',' ' ')
do
    DOCKER_BUILDX_TAG_OPTS="$DOCKER_BUILDX_TAG_OPTS --tag $2:$TAG"
done
docker buildx build --platform $1 $DOCKER_BUILDX_TAG_OPTS -f $4 .
