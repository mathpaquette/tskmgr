#!/usr/bin/env bash

# Usage:
# TSKMGR_VERSION=0.0.0 sh scripts/npm.sh

set -e

npx nx release version "$TSKMGR_VERSION"

# build
rm -rf dist
npx nx build client --verbose --skip-nx-cache

# publish
cd dist/libs/common && npm publish && cd -
cd dist/libs/client && npm publish && cd -

# revert
npx nx release version "0.0.0"
