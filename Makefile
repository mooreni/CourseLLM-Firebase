# Makefile for CourseLLM-Firebase Codespaces workflow

SHELL := /bin/bash
.ONESHELL:

# Ports
SEARCH_PORT ?= 8080

.PHONY: help setup approve env dev firebase search all

help:
	@echo "Targets:"
	@echo "  setup         Enable corepack + install pnpm deps"
	@echo "  approve       Approve pnpm build scripts (select all)"
	@echo "  env           Copy .env.local.example -> .env.local (then fill it)"
	@echo "  dev           Run Next.js dev server (blocks terminal)"
	@echo "  login         Firebase login (recommended for full emulator features)"
	@echo "  search        Create venv + install deps + run search-service (blocks terminal)"
	@echo "  search-venv   Create python venv for search-service"
	@echo "  search-install Install python deps for search-service"
	@echo "  search-run    Run search-service on port $(SEARCH_PORT) (blocks terminal)"
	@echo ""
	@echo "Tip: Run dev/search in separate terminals."

setup:
	corepack enable
	pnpm install

approve:
	@echo "Running pnpm approve-builds (select all packages, then confirm)..."
	pnpm approve-builds

env:
	cp -n .env.local.example .env.local
	@echo "Created .env.local (if it didn't exist). Now fill it with your keys."

dev:
	pnpm dev

search:
	cd search-service
	python -m venv .venv
	source .venv/bin/activate
	pip install -r requirements.txt
	uvicorn app.main:app --host 0.0.0.0 --port $(SEARCH_PORT)

# Convenience "do the setup stuff" (does NOT run servers)
all: setup approve env
	@echo "Done. Now run in separate terminals:"
	@echo "  make dev"
	@echo "  make search"
