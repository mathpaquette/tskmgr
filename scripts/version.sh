#!/usr/bin/env bash

set -e

if [ -z "${TSKMGR_VERSION}" ]; then
  echo "TSKMGR_VERSION variable not set!"
  exit 1
fi

find ./dist -type f -exec sed -i 's/__TSKMGR_VERSION__/'"${TSKMGR_VERSION}"'/g' {} \;
