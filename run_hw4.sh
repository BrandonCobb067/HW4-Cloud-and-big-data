#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p outputs
mongosh "${MONGODB_URI:-mongodb://localhost:27017/rtr}" --quiet --file queries.js > outputs/HW4Output.txt 2> outputs/HW4Errors.txt
echo "Review outputs/HW4Output.txt and outputs/HW4Errors.txt."
