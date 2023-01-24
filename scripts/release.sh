#!/usr/bin/env bash

# usage: sh scripts/release.sh
docker build -t tskmgr-build . -f build.Dockerfile
