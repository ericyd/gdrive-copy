# Remove existing node Docker container
docker rm -f node

# Run Node v8 in Docker container
docker run -td --name node -v "$PWD":/usr/src/app -w /usr/src/app node:8 || exit

# Install PhantomJS first to avoid issues on install
docker exec -it node npm install phantomjs-prebuilt@2.1.16 --ignore-scripts || exit

# Install other dependencies
docker exec -it node npm install || exit 

# Run CLASP installation helper
docker exec -it node node clasp_installation_helper.js || exit

# Build the Apps Script files
docker exec -it node npm run build:prod