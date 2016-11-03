SHELL = /bin/bash
JEKYLL_ARGS ?=
JEKYLL_DEST ?= public
JEKYLL_ENV ?= production
WATCH_EVENTS = create delete modify move
WATCH_DIRS = site

export JEKYLL_ENV

default: help

build:
	[[ $(JEKYLL_ENV) != production ]] || $(MAKE) clean
	cd site/img && ./make-sizes.bash
	$(MAKE) jekyll
	[[ $(JEKYLL_ENV) != production ]] || ./post-process.bash

jekyll:
	jekyll build -d $(JEKYLL_DEST) $(JEKYLL_ARGS)

watch:
	trap exit 2; \
	while true; do \
		$(MAKE) build; \
		date > .sync; \
		inotifywait $(WATCH_EVENTS:%=-e %) --exclude '/\.' -r $(WATCH_DIRS); \
	done

serve:
#	jekyll serve -d $(JEKYLL_DEST) --no-watch --skip-initial-build --host 0 --port 8000
	cd $(JEKYLL_DEST) && \
	browser-sync start -s --port 8000 --files ../.sync --no-notify --no-open --no-ui

sync_serve:
	while [[ ! -e .sync ]]; do sleep 0.1; done
	$(MAKE) serve

draft: export JEKYLL_ARGS += --drafts
draft dev: export JEKYLL_ENV = development
draft dev: export JEKYLL_DEST = dev
draft dev:
	rm -f .sync
	$(MAKE) -j2 watch sync_serve

next: build
	echo 'Disallow: /' >> $(JEKYLL_DEST)/robots.txt
	rsync -az --exclude=.git --delete-before $(JEKYLL_DEST)/. agriffis@n01se.net:next.arongriffis.com/

_deploy_dream:
	rsync -az --exclude=.git --delete-before $(JEKYLL_DEST)/. agriffis@n01se.net:arongriffis.com/

_deploy_ghp:
	[[ -e $(JEKYLL_DEST)/.git ]]
	cd $(JEKYLL_DEST) && \
	git add -A && \
	( ! git status --porcelain | grep -q . || git commit -m "Deploy from agriffis/arongriffis.com" ) && \
	git push

deploy: build
	$(MAKE) _deploy_dream
	$(MAKE) _deploy_ghp

# This doesn't work with graphicsmagick, which only supports ico as read-only
# rather than read-write. See http://www.graphicsmagick.org/formats.html
favicon: site/favicon.ico
site/favicon.ico: site/img/logo/wave-32.png site/img/logo/wave-16.png
	convert $^ $@

clean:
	if [[ -e $(JEKYLL_DEST)/.git ]]; then \
		tmp=$$(mktemp -d clean.XXXXXX) && \
		mv -T $(JEKYLL_DEST) $$tmp && \
		mkdir $(JEKYLL_DEST) && \
		mv $$tmp/.git $(JEKYLL_DEST) && \
		rm -rf $$tmp; \
	else \
		rm -rf $(JEKYLL_DEST); \
	fi

help:
	@echo Not very helpful

.PHONY: default build help jekyll watch serve sync_serve draft dev _deploy_dream _deploy_ghp deploy favicon clean
