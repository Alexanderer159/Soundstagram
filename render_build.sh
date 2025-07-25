#!/usr/bin/env bash
# exit on error
set -o errexit

pipenv install

pipenv run upgrade

cd src/front/
npm install
npm run build


