SHELL = /bin/bash
JEKYLL_ARGS ?=
COMPASS_ARGS ?= --sass-dir site/css --css-dir public/css --images-dir img --javascripts-dir js --relative-assets
WATCH_EVENTS = create delete modify move
WATCH_DIRS = site

all:
	cd site/img && ./make-sizes.bash
	$(MAKE) jekyll
#	$(MAKE) sass
	date > .sync

# This uses separate invocations of $(MAKE) rather than dependencies for
# the production target, to avoid make -j running clean/all in parallel.
# COMPASS_ARGS is augmented and exported to override the ?= assignment when the
# submake runs.
production: export COMPASS_ARGS += -e production
production:
	$(MAKE) clean
	$(MAKE) all
#	./post-process.bash

jekyll:
	jekyll build $(JEKYLL_ARGS)

sass:
	compass compile $(COMPASS_ARGS)

watch:
	trap exit 2; \
	while true; do \
	    $(MAKE) all; \
	    inotifywait $(WATCH_EVENTS:%=-e %) --exclude '/\.' -r $(WATCH_DIRS); \
	done

serve:
#	jekyll serve --no-watch --skip-initial-build --host 0 --port 8000
	cd public && \
	browser-sync start -s --port 8000 --files ../.sync --no-notify --no-open --no-ui

sync_serve:
	while [[ ! -e .sync ]]; do sleep 0.1; done
	$(MAKE) serve

draft: export JEKYLL_ARGS += --drafts
draft dev:
	rm -f .sync
	$(MAKE) -j2 watch sync_serve

dream: production
	rsync -az --exclude=.git --delete-before public/. agriffis@n01se.net:arongriffis.com/

ghp: production
	cd public && \
	git add -A && \
	( ! git status --porcelain | grep -q . || git commit -m "Deploy from agriffis/arongriffis.com" ) && \
	git push

publish: dream ghp

# This doesn't work with graphicsmagick, which only supports ico as read-only
# rather than read-write. See http://www.graphicsmagick.org/formats.html
favicon: site/favicon.ico
site/favicon.ico: site/img/logo/wave-32.png site/img/logo/wave-16.png
	convert $^ $@

clean:
	shopt -s dotglob extglob nullglob && \
	rm -rf public/!(.git|.|..)

.FAKE: all production jekyll sass watch serve draft dev dream ghp sync_serve publish favicon clean
