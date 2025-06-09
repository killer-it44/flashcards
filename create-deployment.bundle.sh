#!/bin/sh
zip -r flashcards-deploy.zip .ebextensions .platform package.json package-lock.json server migrate-decks.js
