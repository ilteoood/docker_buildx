#!/bin/sh -l
export DOCKER_CLI_EXPERIMENTAL=enabled
TAGS=
for TAG in $(echo "$3" | tr ',' ' ')
do
    TAGS="$TAGS --tag $2:$TAG"
done

PUSH=
if [ $5 = true ];
then
    PUSH="--push"
fi

BUILD_ARGS=
for ARG in $(echo "$6" | tr ',' ' ')
do
    BUILD_ARGS="$BUILD_ARGS --build-arg $ARG"
done

LOAD=
if [ $7 = true ];
then
    LOAD="--load"
fi

TARGET=
if [ ! -z "$8" ];
then
   TARGET="--target $8"
fi

docker buildx build --platform $1 $PUSH $LOAD $TAGS $BUILD_ARGS $TARGET -f $4 .
