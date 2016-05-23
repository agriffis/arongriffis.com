---
created: 2016-05-23
title: Introducing Vagrant EnvBash
slug: vagrant-envbash-intro
author: Aron
tags: [vagrant, envbash, 12factor]
layout: article
---

The [twelve-factor app](http://12factor.net/) has become the de facto
standard for web app deployment, but it can be challenging to figure out how to
apply the pattern in development. We'd like to have parity between development
and our deployed instances, but necessarily there are deviations: debug output
is enabled, we use http instead of https, assets are served locally instead of
S3 or a CDN, etc.

One of those deviations is how we deliver configuration to the application.

# The Problem

[Factor III](http://12factor.net/config) says that application
configuration should be stored in the environment. This is easy to manage using
[Heroku](https://devcenter.heroku.com/articles/config-vars), for example:

    $ heroku config:set STRIPE_KEY=pk_real_xxxxxx STRIPE_SECRET=sk_real_yyyyyy
    Setting config vars and restarting myapp... done, v14
    STRIPE_KEY: pk_real_xxxxxx
    STRIPE_SECRET: sk_real_yyyyyy

We retrieve those directly from the environment at run-time, for example using
`os.environ` in Django's `settings.py`:

    STRIPE_KEY = os.environ.get('STRIPE_KEY', 'pk_test_xxxxxx')
    STRIPE_SECRET = os.environ.get('STRIPE_SECRET', 'sk_test_yyyyyy')

So here we have fallback keys that we've decided are harmless to commit to the
repository for development. But what about credentials that we'd rather not
commit, such as AWS keys? Or maybe we'd like to override settings to access
production data from our development environment. For these scenarios, we need
to set some environment variables locally.

# An Overly Simplistic Solution

One approach is to simply set the variables in `.bash_profile` in the [Vagrant](https://www.vagrantup.com) VM:

    $ vagrant ssh
    $ echo 'export STRIPE_KEY=pk_real_xxxxxx' >> .bash_profile
    $ echo 'export STRIPE_SECRET=sk_real_yyyyyy' >> .bash_profile
    $ exit

Now our future Vagrant shells will have these settings, and they'll be inherited
by the application running in Vagrant.

This approach works, but it has some shortcomings. Most obviously, the file
disappears and needs to be recreated whenever the Vagrant VM is destroyed and
recreated. Therefore we'd really like to store this configuration outside of the VM.

# And what about Vagrant?

The other shortcoming of putting app config in the Vagrant VM's `.bash_profile`
is that the settings aren't available for configuring Vagrant itself. With a
simple `Vagrantfile` and a local VM, this doesn't really matter. But what about
using a remote providr such as [DigitalOcean](https://www.digitalocean.com)?
Here's a sample `Vagrantfile` using the
[vagrant-digitalocean provider](https://github.com/devopsgroup-io/vagrant-digitalocean):

    Vagrant.configure('2') do |config|
      config.vm.provider :digital_ocean do |digitalocean, override|
        # This is not a complete config
        digitalocean.name = ENV['VAGRANT_DIGITALOCEAN_NAME']
        digitalocean.token = ENV['VAGRANT_DIGITALOCEAN_TOKEN']
      end
    end

It becomes increasingly attractive to have a single source of environment for
both Vagrant and the application.

# Getting Warmer

There exists a plugin to solve this problem, called
[Vagrant ENV](https://github.com/gosuri/vagrant-env). It's based on
[dotenv](https://github.com/bkeepers/dotenv) which unfortunately causes some
problems.

Although dotenv claims to be readable by Bash--even
[supporting `export` on the front of each line](https://github.com/bkeepers/dotenv#usage)
so the `.env` file can be sourced into the shell--dotenv's ad hoc syntax doesn't
represent multi-line strings in a way that's compatible with Bash. Here's the
dotenv syntax:

    export SECRET="foo\nbar\nbaz"

This doesn't work in Bash, where we have two options:

    export SECRET=$'foo\nbar\nbaz'

or:

    export SECRET="foo
    bar
    baz"

Additionally it would be nice to programmatically build settings from
components, or call out to the shell in some cases. For example we might like to
build the DigitalOcean droplet name from git config:

    email=`git config --get user.email`
    export VAGRANT_DIGITALOCEAN_NAME="droplet-${email%%@*}"

# A Stopgap Snippet

Frustrated by shortcomings in Vagrant ENV, I abandoned it in favor of this
snippet to prepend to my `Vagrantfile`:

    # Load env.bash
    ENV.update(eval `bash -c '
      if [[ -s env.bash ]]; then
        source env.bash >/dev/null
      fi
      ruby -e "p ENV"
    '`)

This works by running Bash from Vagrantfile to load `env.bash`, then calling
Ruby to emit the new environment settings in Ruby syntax. That output is eval'd
by the Ruby instance which is reading the Vagrantfile to update its `ENV`.

This solves the problem of parsing the environment file with Bash as we'd like,
and gets the settings into Vagrant. Finally we can apply a one-liner inside the
Vagrant VM to apply the settings there as well:

    $ vagrant ssh
    $ echo "source /vagrant/env.bash" >> .bash_profile

# A Plugin is Born

The snippet above does the trick but doesn't scale well to lots of Vagrantfiles.
It also doesn't provide anything in the way of introspection. We can solve these
problems with a new Vagrant plugin: [Vagrant EnvBash](https://github.com/agriffis/vagrant-envbash).

This plugin works basically the same way as the snippet, with a few improvements:

  * `env.bash` is found automatically adjacent to `Vagrantfile` rather than
    relying on the working directory.

  * Any environment variables that are unset in `env.bash` will also be removed
    from `ENV`.

  * The plugin provides a command `vagrant env` which shows what variables are
    added, removed and modified by processing `env.bash`.

Please let me know if you use it!
