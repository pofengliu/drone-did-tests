# !/bin/bash

# Due to OS compatibility of command.sh in dind-drone-plugin,
# We mount host docker.sock and set DOCKER_HOST var for testContainers
# Detail parametes: https://github.com/testcontainers/dind-drone-plugin

container_id=$(
  docker run -d\
  -v `pwd`:`pwd` \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -e CI_WORKSPACE=`pwd` \
  -e EXTRA_DOCKER_OPTIONS='--network host -e DOCKER_HOST=unix:///var/run/docker.sock' \
  -e PLUGIN_BUILD_IMAGE='node:16-alpine' \
  -e PLUGIN_CMD='npm install; npm run test:container' \
  quay.io/testcontainers/dind-drone-plugin
)

echo ${container_id}

docker logs -f ${container_id}

docker rm -f ${container_id}
