#!/bin/sh -l

echo $2 | docker login --username $1 --password-stdin $3