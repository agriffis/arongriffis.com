SHELL = /bin/bash
JEKYLL_ARGS ?=
COMPASS_ARGS ?= --sass-dir site/css --css-dir public/css --images-dir img --javascripts-dir js --relative-assets
WATCH_EVENTS = create delete modify move
WATCH_DIRS = site

all: jekyll sass

# This uses separate invocations of $(MAKE) rather than dependencies for
# the production target, to avoid make -j running clean/all in parallel.
# COMPASS_ARGS is augmented and exported to override the ?= assignment when the
# submake runs.
production: export COMPASS_ARGS += -e production
production:
	$(MAKE) clean
	$(MAKE) all

jekyll:
	jekyll build $(JEKYLL_ARGS)

sass:
	compass compile $(COMPASS_ARGS)

watch:
	trap exit 2; \
	while true; do \
	    $(MAKE) all; \
	    inotifywait $(WATCH_EVENTS:%=-e %) -r $(WATCH_DIRS); \
	done

serve:
#	jekyll serve --no-watch --skip-initial-build --host 0 --port 8000
	cd public && \
	browser-sync start -s --port 8000 --files ../site --reload-delay 2000 --no-notify --no-open --no-ui

draft: export JEKYLL_ARGS += --drafts
draft dev:
	$(MAKE) -j2 watch serve

dream: production
	rsync -az --exclude=.git --delete-before public/. agriffis@n01se.net:arongriffis.com/

ghp: production
	cd public && \
	git add -A && \
	( ! git status --porcelain | grep -q . || git commit -m "Deploy from agriffis/arongriffis.com" ) && \
	git push

publish: dream ghp


.ONESHELL: clean
clean:
	shopt -s dotglob extglob nullglob
	rm -rf public/!(.git|.|..)

.FAKE: all production jekyll sass watch serve draft dev dream ghp publish clean
