GRAVATAR = site/img/gravatar/perkins-cove/bright.jpg
SCASE_ARGS = # --verbose
COMPASS_ARGS = --sass-dir site/css --css-dir public/css --images-dir img --javascripts-dir js --relative-assets
WATCH_EVENTS = create delete modify move
WATCH_DIRS = frags layouts site

all: scase sass

scase:
	scase $(SCASE_ARGS)

sass:
	compass compile $(COMPASS_ARGS) -e production

clean:
	rm -rf public

watch:
	trap exit 2; \
	while true; do \
	    scase $(SCASE_ARGS) --no-remove; \
	    compass compile $(COMPASS_ARGS); \
	    inotifywait $(WATCH_EVENTS:%=-e %) -r $(WATCH_DIRS); \
	done

serve:
	mkdir -p public
	cd public && python -m SimpleHTTPServer 8008

dev: clean
	$(MAKE) -j2 watch serve

publish: all
	rsync -az --delete-before public/. agriffis@n01se.net:arongriffis.com/

gravatar:
	for x in 144 114 72 57; do \
	    geom=$${x}x$${x}; \
	    img=site/apple-touch-icon-$$geom-precomposed.png; \
	    rm -f $$img; \
	    convert -scale $$geom $(GRAVATAR) $$img; \
	done
	cp -f site/apple-touch-icon-57x57-precomposed.png site/apple-touch-icon-precomposed.png
	cp -f site/apple-touch-icon-57x57-precomposed.png site/apple-touch-icon.png

.FAKE: all scase sass clean watch serve dev publish gravatar
