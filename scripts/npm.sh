#!/usr/bin/env bash

if [ -z "${TSKMGR_VERSION}" ]; then
  echo "TSKMGR_VERSION variable not set!"
  exit 1
fi

rm -rf dist
npx nx reset

cd libs/common && npm version ${TSKMGR_VERSION} && cd -
cd libs/client && npm version ${TSKMGR_VERSION} && cd -

npx nx build client --verbose

# publish
cd dist/libs/common && npm publish && cd -
cd dist/libs/client && npm publish && cd -

# revert
cd libs/common && git checkout package.json && cd -
cd libs/client && git checkout package.json && cd -
