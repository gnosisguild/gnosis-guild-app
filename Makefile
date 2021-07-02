PROJECT_NAME=gnosis

REGISTRY_NAME=$(shell grep REGISTRY_NAME .env | cut -d "=" -f2)

azure_login:
		az acr login --name $(REGISTRY_NAME)

build_server:
		docker build -t $(PROJECT_NAME)/node-server:$(TAG)  ./packages/gnosis-guild-app 

build_contributor_list:
		docker build -t $(PROJECT_NAME):$(TAG)  ./packages/contributor-list-job


run:
		docker run -e API_TOKEN=$(API_TOKEN) \
               -e SUGGESTION_CHANNEL=$(SUGGESTION_CHANNEL) \
               -e CLIENT_ID=$(CLIENT_ID) \
               -e GUILD_ID=$(GUILD_ID) \
               $(PROJECT_NAME):$(TAG) $(cmd)

publish_server:
		$(MAKE) build_server PROJECT_NAME=$(REGISTRY_NAME)/gnosis TAG=$(TAG)
		docker push $(REGISTRY_NAME)/gnosis/node-server:$(TAG)


publish_contributor_list:
		$(MAKE) build_contributor_list PROJECT_NAME=$(REGISTRY_NAME)/gnosis/contributor-list-job TAG=$(TAG)
		docker push $(REGISTRY_NAME)/gnosis/contributor-list-job:$(TAG)
