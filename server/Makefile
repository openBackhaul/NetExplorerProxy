IMAGE = nep-1.0.0
CONTAINER = NetExplorerProxy-1.0.0
SERVER_PORT = 4018
PORT = 4018
DATAFILE = NetExplorerProxy_v1.0.0_dataFile.json

# Build docker image
image:
	npm install
	docker build -t $(IMAGE) --label com.docker.compose.project="sdn" .

# Stop docker container
stop:
	docker stop $(CONTAINER)

# Remove docker container
rm:
	docker rm -f $(CONTAINER)

# Remove docker container and image
clean: rm
	rm -f package-lock.json
	rm -Rf node_modules
	docker rmi $(IMAGE)

# Run docker container
run: rm
	docker run -d -p $(PORT):$(SERVER_PORT) --restart always --name $(CONTAINER) $(IMAGE)

test: run
	npm run test
	newman run -d ../testing/$(DATAFILE) ../testing/NetExplorerProxyBasicTest_1.0.0.postman_collection.json --env-var baseUrl=http://$(DOCKER_HOST):$(PORT)

test-local: run
	npm run test
	newman run -d ../testing/$(DATAFILE) ../testing/NetExplorerProxyBasicTest_1.0.0.postman_collection.json --env-var baseUrl=http://localhost:$(PORT)
