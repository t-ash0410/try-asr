.PHONY: dev
dev:
	@echo "Starting development environment..."
	@trap 'kill 0' SIGINT; \
	cd go && go run app/cmd/h2/main.go & \
	cd ts/frontend && bun dev & \
	wait 
