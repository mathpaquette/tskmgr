#!/bin/sh

mkdir /run/postgresql
mkdir /var/tmp
mkdir /etc/containers
cp .idx/registries.conf /etc/containers/registries.conf
cp .idx/policy.json /etc/containers/policy.json
cp -f .idx/settings.json .vscode/
echo "Start script has been run."