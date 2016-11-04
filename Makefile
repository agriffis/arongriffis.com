SHELL = /bin/bash
JEKYLL_ARGS ?=
JEKYLL_DEST ?= public
JEKYLL_ENV ?= production
WATCH_EVENTS = create delete modify move
WATCH_DIRS = site
GHP_REMOTE = git@github.com:agriffis/agriffis.github.io
NEXT_DEPLOY_DEST = agriffis@n01se.net:next.arongriffis.com/
DREAM_DEPLOY_DEST = agriffis@n01se.net:arongriffis.com/
VAGRANT_MAKE = vagrant ssh -- -t make -C /vagrant

export JEKYLL_ENV

.PHONY: default
default: help

.PHONY: build
build: _vagrant
	[[ $(JEKYLL_ENV) != production ]] || $(MAKE) clean
	cd site/img && ./make-sizes.bash
	$(MAKE) jekyll
	[[ $(JEKYLL_ENV) != production ]] || ./post-process.bash

.PHONY: jekyll
jekyll: _vagrant
	jekyll build -d $(JEKYLL_DEST) $(JEKYLL_ARGS)

.PHONY: watch
watch: _vagrant
	trap exit 2; \
	    while true; do \
		$(MAKE) build; \
		    date > .sync; \
		    inotifywait $(WATCH_EVENTS:%=-e %) --exclude '/\.' -r $(WATCH_DIRS); \
	    done

.PHONY: serve
serve: _vagrant
#	jekyll serve -d $(JEKYLL_DEST) --no-watch --skip-initial-build --host 0 --port 8000
	cd $(JEKYLL_DEST) && \
	    browser-sync start -s --port 8000 --files ../.sync --no-notify --no-open --no-ui

.PHONY: sync_serve
sync_serve: _vagrant
	while [[ ! -e .sync ]]; do sleep 0.1; done
	$(MAKE) serve

.PHONY: draft dev
draft: export JEKYLL_ARGS += --drafts
draft dev: export JEKYLL_ENV = development
draft dev: export JEKYLL_DEST = dev
draft dev: _vagrant
	rm -f .sync
	$(MAKE) -j2 watch sync_serve

.PHONY: next
next: _not_vagrant
	$(VAGRANT_MAKE) build
	echo 'Disallow: /' >> $(JEKYLL_DEST)/robots.txt
	rsync -az --exclude=.git --delete-before $(JEKYLL_DEST)/. $(NEXT_DEPLOY_DEST)

.PHONY: _deploy_dream
_deploy_dream: _not_vagrant
	rsync -az --exclude=.git --delete-before $(JEKYLL_DEST)/. $(DREAM_DEPLOY_DEST)

.PHONY: _deploy_ghp
_deploy_ghp: _not_vagrant
	cd $(JEKYLL_DEST) && \
	    if [[ ! -d .git ]]; then \
			git init && \
			git remote add origin $(GHP_REMOTE); \
	    fi && \
	    git fetch --depth=1 origin master && \
	    git reset origin/master && \
	    git add -A && \
	    if git status --porcelain | grep -q .; then \
			git commit -m "Deploy from agriffis/arongriffis.com"; \
	    fi && \
	    git branch -u origin/master && \
	    git push

.PHONY: deploy
deploy: _not_vagrant
	$(VAGRANT_MAKE) build
	$(MAKE) _deploy_dream
	$(MAKE) _deploy_ghp

# This doesn't work with graphicsmagick, which only supports ico as read-only
# rather than read-write. See http://www.graphicsmagick.org/formats.html
.PHONY: favicon
favicon: site/favicon.ico
site/favicon.ico: site/img/logo/wave-32.png site/img/logo/wave-16.png
	convert $^ $@

.PHONY: clean
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

.PHONY: _vagrant
_vagrant:
	@if test $$(whoami) != vagrant; then \
	    echo >&2; \
	    echo "#########################################" >&2; \
	    echo "# Please run this in vagrant ssh" >&2; \
	    echo "#########################################" >&2; \
	    echo >&2; \
	    exit 1; \
	fi

.PHONY: _not_vagrant
_not_vagrant:
	@if test $$(whoami) = vagrant; then \
	    echo >&2; \
	    echo "#########################################" >&2; \
	    echo "# Please run this outside of vagrant" >&2; \
	    echo "#########################################" >&2; \
	    echo >&2; \
	    exit 1; \
	fi

.PHONY: help
help:
	@echo Not very helpful
