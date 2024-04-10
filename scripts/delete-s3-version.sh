#!/bin/bash

# Check if a version number is passed as an argument
if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <version_to_delete>"
    exit 1
fi

# Check if jq is installed
if ! [ -x "$(command -v jq)" ]; then
  echo 'Error: jq is not installed.' >&2
  exit 1
fi

# Check if aws-cli is installed
if ! [ -x "$(command -v aws)" ]; then
  echo 'Error: aws-cli is not installed.' >&2
  exit 1
fi

VERSION_TO_DELETE="$1"
BUCKET_NAME="rmagent"

aws s3 ls s3://${BUCKET_NAME}/versions/ | grep '.json$' | awk '{print $4}' | while read -r manifest; do
  # Download the manifest file
  aws s3 cp s3://${BUCKET_NAME}/versions/${manifest} ./tmp/

  # Remove the specified version key from the manifest
  if [ -f ./tmp/$(basename "$manifest") ]; then
    if [ $(jq ".\"${VERSION_TO_DELETE}\"" ./tmp/$(basename "$manifest")) != "null" ]; then
      jq "del(.\"${VERSION_TO_DELETE}\")" ./tmp/$(basename "$manifest") > ./tmp/updated_manifest.json

      # Upload the updated manifest back to S3
      aws s3 cp ./tmp/updated_manifest.json s3://${BUCKET_NAME}/versions/${manifest}
    else 
      echo "WARNING: Version ${VERSION_TO_DELETE} not found in manifest file ${manifest}"
    fi

    # Cleanup local files
    rm ./tmp/$(basename "$manifest")
  else
    echo "Error: Could not download manifest file ${manifest}"
    exit 1
  fi
done

# Remove updated manifest
if [ -f ./tmp/updated_manifest.json ]; then
  rm ./tmp/updated_manifest.json
fi

# List all objects in the version directory and delete them
aws s3 rm s3://${BUCKET_NAME}/versions/${VERSION_TO_DELETE}/ --recursive
