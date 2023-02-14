#!/usr/bin/env bash

set -e

TSKMGR_VERSION=$(node -p "require('./package.json').version")

echo "Bumping @tskmgr/common version"
cd libs/common && npm version "${TSKMGR_VERSION}" && cd -
echo "Bumping @tskmgr/client version"
cd libs/client && npm version "${TSKMGR_VERSION}" && cd -

rm -rf dist
npx nx build client --verbose --skip-nx-cache

# publish
cd dist/libs/common && npm publish && cd -
cd dist/libs/client && npm publish && cd -

# revert
cd libs/common && git checkout package.json && cd -
cd libs/client && git checkout package.json && cd -
