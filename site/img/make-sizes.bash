#!/bin/bash

convert=$(type gm &>/dev/null && echo "gm convert" || echo "convert")

for x in [1-9]*; do
    for orig in orig/*; do
        scaled=$x/${orig#orig/}
        if [[ ! -e $scaled || $orig -nt $scaled ]]; then
            (set -x; $convert -geometry ${x}x $orig $scaled)
        fi
    done
done
