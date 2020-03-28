---
title: Firefox Nightly on Fedora
excerpt: Rough notes for installing Firefox Nightly on Fedora
author: Aron
tags: [firefox, fedora, gnome]
layout: article
---

These are my rough notes for installing Firefox Nightly on Fedora 32 so it has
a launcher icon in the GNOME dock.

The tarball is available from
[mozilla.org](https://www.mozilla.org/en-US/firefox/channel/desktop/).
Internally it contains everything in a directory `firefox`:

    ✸ tar tf firefox-76.0a1.en-US.linux-x86_64.tar.bz2 | head
    firefox/omni.ja
    firefox/firefox-bin
    firefox/plugin-container
    firefox/fix_linux_stack.py
    firefox/fix_stack_using_bpsyms.py
    firefox/libnssutil3.so
    firefox/gmp-clearkey/0.1/manifest.json
    firefox/gmp-clearkey/0.1/libclearkey.so
    firefox/libgraphitewasm.so
    firefox/libplc4.so

Expand into `/opt/firefox`. Make the target dir and content owned by me, so it
can update automatically running as my user without privileges.

    ✸ sudo mkdir -p /opt/firefox
    ✸ sudo chown aron:aron /opt/firefox
    ✸ tar xf firefox-76.0a1.en-US.linux-x86_64.tar.bz2 -C /opt
    ✸ rm firefox-76.0a1.en-US.linux-x86_64.tar.bz2

Make a [desktop entry](https://developer.gnome.org/desktop-entry-spec/) so I can
add it to the GNOME dock. This is simplified from Fedora's default
[firefox-wayland.desktop](https://src.fedoraproject.org/rpms/firefox/blob/master/f/firefox-wayland.desktop)
and modified to distinguish from Firefox Stable. It should be installed as
`~/.local/share/applications/firefox-nightly.desktop`

    [Desktop Entry]
    Version=1.0
    Name=Firefox Nightly
    Exec=env MOZ_ENABLE_WAYLAND=1 /opt/firefox/firefox-bin --name=firefox-nightly -P nightly %u
    Icon=firefox-nightly
    Terminal=false
    Type=Application
    MimeType=text/html;text/xml;application/xhtml+xml;application/vnd.mozilla.xul+xml;text/mml;x-scheme-handler/http;x-scheme-handler/https;
    Categories=Network;WebBrowser;
    Keywords=web;browser;internet;
    StartupNotify=true
    StartupWMClass=firefox-nightly

To keep this separate from Firefox Stable:

* `--name=firefox-nightly` sets the `wmclass` so that GNOME can associate
  the icon in the dock with the running windows. This must match the setting for
  `StartupWMClass` (also in the desktop entry above). There's a related
  [bugzilla](https://bugzilla.mozilla.org/show_bug.cgi?id=1530052) but `--name`
  seems to be working for me.

* `-P nightly` uses an alternate profile, so that stable and nightly don't
  have to share.

The icon files for the blue Firefox Nightly logo are supplied in the tarball but
oddly named:

    ✸ find /opt/firefox/ -path '*browser*icons*png'
    /opt/firefox/browser/chrome/icons/default/default32.png
    /opt/firefox/browser/chrome/icons/default/default64.png
    /opt/firefox/browser/chrome/icons/default/default16.png
    /opt/firefox/browser/chrome/icons/default/default128.png
    /opt/firefox/browser/chrome/icons/default/default48.png

Symlink these so they can be found, and so the name matches:

    ✸ src=/opt/firefox/browser/chrome/icons/default
    ✸ for z in 16 32 48 64 128; do \
        dest=~/.local/share/icons/hicolor/${z}x$z/apps; \
        mkdir -p "$dest"; \
        ln -sv "$source/default$z.png" "$dest/firefox-nightly.png"; \
        done
    '/home/aron/.local/share/icons/hicolor/16x16/apps/firefox-nightly.png' -> '/opt/firefox/browser/chrome/icons/default/default16.png'
    '/home/aron/.local/share/icons/hicolor/32x32/apps/firefox-nightly.png' -> '/opt/firefox/browser/chrome/icons/default/default32.png'
    '/home/aron/.local/share/icons/hicolor/48x48/apps/firefox-nightly.png' -> '/opt/firefox/browser/chrome/icons/default/default48.png'
    '/home/aron/.local/share/icons/hicolor/64x64/apps/firefox-nightly.png' -> '/opt/firefox/browser/chrome/icons/default/default64.png'
    '/home/aron/.local/share/icons/hicolor/128x128/apps/firefox-nightly.png' -> '/opt/firefox/browser/chrome/icons/default/default128.png'

Done!
