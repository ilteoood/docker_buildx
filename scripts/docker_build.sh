#!/bin/sh -l
export DOCKER_CLI_EXPERIMENTAL=enabled
TAGS=
for TAG in $(echo "$INPUT_TAG" | tr ',' ' ')
do
    TAGS="$TAGS --tag $INPUT_IMAGE_NAME:$TAG"
done

PUSH=
if [ "$INPUT_PUSH" = "true" ];
then
    PUSH="--push"
fi

BUILD_ARGS=
for ARG in $(echo "$INPUT_BUILD_ARG" | tr ',' ' ')
do
    BUILD_ARGS="$BUILD_ARGS --build-arg $ARG"
done

LABELS=
for LABEL in $(echo "$INPUT_LABEL" | tr ',' ' ')
do
    LABELS="$LABELS --label $LABEL"
done

LOAD=
if [ "$INPUT_LOAD" = "true" ];
then
    LOAD="--load"
fi

TARGET=
if [ ! -z "$INPUT_TARGET" ];
then
   TARGET="--target $INPUT_TARGET"
fi

docker buildx build --platform "$INPUT_PLATFORM" $PUSH $LOAD $TAGS $BUILD_ARGS $LABELS $TARGET -f "$INPUT_DOCKERFILE" "$INPUT_CONTEXT"
