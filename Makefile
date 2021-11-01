
docker:
	docker-compose -f src/docker-compose.yml up -d --build
logs-docker:
	docker-compose -f src/docker-compose.yml logs -f &
clean:
	docker-compose -f src/docker-compose.yml down

dockerkubernetes:
	docker-compose -f deployment/kubernetes/docker-compose.yml up -d --build

kindload:
	docker images | awk '{if (NR >1){print $1}}' | grep cloudjobs | while read x; do kind load docker-image $x; done

kubeapply:
	kubectl apply -f deployment/kubernetes/services -R

.PHONY: docker logs-docker