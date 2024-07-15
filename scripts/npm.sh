#!/usr/bin/env bash

set -e

TSKMGR_VERSION=$(node -p "require('./package.json').version")

npx nx release version "$TSKMGR_VERSION"

# build
rm -rf dist
npx nx build client --verbose --skip-nx-cache

# publish
cd dist/libs/common && npm publish && cd -
cd dist/libs/client && npm publish && cd -

# revert
npx nx release version "0.0.0"
