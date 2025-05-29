#!/bin/bash
cd /home/kavia/workspace/code-generation/visionassist-24730-923a3b8a/visionassist_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

