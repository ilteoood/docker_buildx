#!/bin/sh -l

echo "$INPUT_DOCKER_PASSWORD" | docker login --username "$INPUT_DOCKER_USER" --password-stdin "$INPUT_DOCKER_SERVER"