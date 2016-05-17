SHELL = /bin/bash
GRAVATAR = img/gravatar/perkins-cove/bright.jpg
JEKYLL_ARGS =
COMPASS_ARGS ?= --sass-dir site/css --css-dir public/css --images-dir img --javascripts-dir js --relative-assets
WATCH_EVENTS = create delete modify move
WATCH_DIRS = site

.FAKE: all
all: jekyll sass

# This uses separate invocations of $(MAKE) rather than dependencies for
# the production target, to avoid make -j running clean/all in parallel.
.FAKE: production
production: export COMPASS_ARGS += -e production
production:
	$(MAKE) clean
	$(MAKE) all

.FAKE: jekyll
jekyll:
	jekyll build $(JEKYLL_ARGS)

.FAKE: sass
sass:
	compass compile $(COMPASS_ARGS)

.FAKE: watch
watch:
	trap exit 2; \
	while true; do \
	    $(MAKE) all; \
	    inotifywait $(WATCH_EVENTS:%=-e %) -r $(WATCH_DIRS); \
	done

.FAKE: serve
serve:
	jekyll serve --no-watch --skip-initial-build --host 0 --port 8000

.FAKE: dev
dev:
	$(MAKE) -j2 watch serve

.FAKE: dream
dream: production
	rsync -az --exclude=.git --delete-before public/. agriffis@n01se.net:arongriffis.com/

.FAKE: ghp
ghp: production
	cd public && \
	git add -A && \
	( ! git status --porcelain | grep -q . || git commit -m "Deploy from agriffis/arongriffis.com" ) && \
	git push

.FAKE: publish
publish: dream ghp

.FAKE: gravatar
gravatar:
	for x in 144 114 72 57; do \
	    geom=$${x}x$${x}; \
	    img=site/apple-touch-icon-$$geom-precomposed.png; \
	    rm -f $$img; \
	    gm convert -scale $$geom $(GRAVATAR) $$img; \
	done
	cp -f site/apple-touch-icon-57x57-precomposed.png site/apple-touch-icon-precomposed.png
	cp -f site/apple-touch-icon-57x57-precomposed.png site/apple-touch-icon.png

.FAKE: clean
.ONESHELL: clean
clean:
	shopt -s dotglob extglob nullglob
	rm -rf public/!(.git|.|..)
