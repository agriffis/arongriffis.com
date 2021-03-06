---
created: 2016-11-05
title: Using SSH as a simple VPN
excerpt: How to use OpenSSH as a proxy for remote development
author: Aron
tags: [ssh, edx, devstack, vpn, socks, proxy]
layout: article
---

I wrote recently about
[running the Open edX devstack on KVM]({# post_url 2016-11-05-openedx-libvirt #}).

One of the tricky parts of remote web development is connecting your browser to
your work in progress. After all, if your browser is on your laptop, and your
dev server is running somewhere else, possibly behind a firewall and sporting a
private IP address, then there's no way to make a simple connection from one to
the other.

## SOCKS on OpenSSH

The method I've used takes advantage of a feature of
[OpenSSH](https://www.openssh.com/)
to provide a
[SOCKS proxy](https://en.wikipedia.org/wiki/SOCKS)
that tunnels connections to arbitrary addresses on the other end.
It looks like this:

    $ ssh -D 1080 server.example.com

As long as that shell is running, SSH will listen on localhost port 1080 for
incoming connections. A client connecting to that port needs to prepend a
snippet of SOCKS protocol to identify the remote destination host and port, then
the SSH server on the far end will complete the connection.

Browsers know how to use a SOCKS proxy. You can configure your browser to use
`localhost:1080` as the SOCKS proxy, and all your web connections will flow
through that SSH connection.

## proxy.pac

Of course, you probably don't want to tunnel all your web connections, mainly
because the indirection will adversely affect performance. What you want is for
just your development web connections to use the SOCKS proxy.

For that you can write
a [proxy.pac](https://en.wikipedia.org/wiki/Proxy_auto-config). It's a simple
JavaScript function that the browser will use to direct your connections.

Mine looks something like this:

    function FindProxyForURL(url, host) {
      if (shExpMatch(host, "192.168.121.*") || // libvirt
          shExpMatch(host, "172.17.*") ||      // docker
          shExpMatch(host, "172.20.*") ||      // lan
          shExpMatch(host, "*.lan") ||         // lan
        return "SOCKS5 localhost:1080";
      }
      if (host == "preview.localhost") {       // openedx
        return "SOCKS localhost:1080";
      }
      return "DIRECT";
    }

The first conditional recognizes specific IP ranges and the top-level domain
name of an internal network. These connections use the SOCKS5 protocol which
defers host resolution to the server. This is important because internal
hostnames don't usually resolve outside the LAN.

The second conditional recognizes the special Open edX hostname
`preview.localhost`. This one uses the SOCKS4 protocol so that the hostname will
be resolved using `/etc/hosts` on my laptop. This is important because there's
more than one user running devstack on the development server, and
`preview.localhost` needs to resolve differently for each of us.

## Fail fast and reconnect

If you use this technique, you'll find that you want the OpenSSH connection to
fail fast when your laptop moves between networks, and you'll want it to
reconnect automatically.

To fail fast, here's a snippet for your `.ssh/config`:

    Host socks-tunnel
    HostName server.example.com
    DynamicForward 1080
    ForwardAgent no
    LogLevel DEBUG
    ServerAliveCountMax 2
    ServerAliveInterval 2

To auto restart, put it in a bash loop:

    $ while true; do ssh -N socks-tunnel; sleep 2; done

If that asks for a password each time, you'll need to
[run ssh-agent to cache your private key](http://mah.everybody.org/docs/ssh).
