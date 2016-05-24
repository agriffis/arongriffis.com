---
created: 2016-05-23
title: Introducing Vagrant EnvBash
slug: vagrant-envbash-intro
author: Aron
tags: [vagrant, envbash, 12factor]
layout: article
---

The [twelve-factor app](http://12factor.net/) has become the de facto standard
for web app deployment. The methodology codifies some simple yet powerful
patterns for developing apps that can be deployed easily and scaled elegantly.

Factor 10 says to
“[Keep development, staging, and production as similar as possible](http://12factor.net/dev-prod-parity).”
Using [Vagrant](https://www.vagrantup.com) brings this goal within reach by
providing a homogenous virtual machine for developers that reflects the
production installation. However factor 3 says to
“[Store Config in the Environment](http://12factor.net/config),” and while this
is straightforward in production, it’s not as obvious how to do this in the
Vagrant setup. Instead, developers commonly hack settings files or override
values directly in code. These workarounds can have undesirable outcomes such as
accidentally committing settings that shouldn’t be in the repository, or wasting
time debugging why different parts of the code in development are seeing
different configuration values.

This post explores an approach to applying factor 3 to development, then
introduces a Vagrant plugin that extends the solution to informing the
`Vagrantfile` as well. But let’s start with a review of factor 3 in production.

# Environment Config in Production

What does it mean to store app configuration in the environment? The environment
is a set of key-value string pairs that are associated with a process. Whenever
a new process is spawned, the child process inherits a copy of the environment
from its parent. This means that the configuration can be set in the parent
process prior to running the app, and then the app can retrieve its settings
from its own environment when it runs.

This is
[easy to manage on a platform like Heroku](https://devcenter.heroku.com/articles/config-vars),
for example:

    $ heroku config:set STRIPE_KEY=pk_real_xxxxxx STRIPE_SECRET=sk_real_yyyyyy
    Setting config vars and restarting myapp... done, v14
    STRIPE_KEY: pk_real_xxxxxx
    STRIPE_SECRET: sk_real_yyyyyy

When the application runs, it can retrieve those values from the environment,
for example in
[Django’s settings.py](https://docs.djangoproject.com/en/1.9/topics/settings/):

    STRIPE_KEY = os.environ.get('STRIPE_KEY', 'pk_test_xxxxxx')
    STRIPE_SECRET = os.environ.get('STRIPE_SECRET', 'sk_test_yyyyyy')

In this case we have fallback keys that we’ve decided are harmless to commit to
the repository for development, and they’ll apply to staging deployments too
unless overridden. But what about credentials that we’d rather not commit, such
as AWS keys? Or what if we’d like to override settings to access production data
from development? For these cases, we need to set environment variables in the
development environment so the app can find them.

# Environment Config in Development

Unfortunately we don’t have a tool corresponding to `heroku config` for managing
the configuration environment for the app in development. However we can easily
set variables in the shell prior to running the app, and this works just as
well. For example, putting some settings in the Vagrant `.bash_profile` :

    $ vagrant ssh
    $ cat >> .bash_profile <<'EOT'
    export STRIPE_KEY=pk_real_xxxxxx
    export STRIPE_SECRET=sk_real_yyyyyy
    EOT
    $ exit

Now our future Vagrant shells will have these settings, and they’ll be inherited
by the application when it runs.

This approach works, but it has some shortcomings: The file is lost and needs to
be recreated whenever the Vagrant guest is destroyed and recreated. The settings
aren’t accessible to read or modify unless Vagrant is up. And since the settings
live in the guest, they can’t be used to configure Vagrant itself.

These shortcomings can mostly be solved by moving the settings to a standalone
file and then sourcing that into the shell. First, put the settings into a new
file `env.bash` that lives in the source tree alongside `Vagrantfile` :

    export STRIPE_KEY=pk_real_xxxxxx
    export STRIPE_SECRET=sk_real_yyyyyy

Next, source that file into `.bash_profile` in Vagrant. This snippet can be
included in our provisioning script or skeleton so it’s created automatically
when Vagrant initially boots the guest.

    # This assumes the default Vagrant configuration of mounting the
    # source directory from the host onto /vagrant in the guest.
    if [[ -f /vagrant/env.bash ]]; then
      source /vagrant/env.bash
    fi

Now our settings will survive a Vagrant destroy, and they can be edited in the
host environment even if Vagrant isn’t running. The only shortcoming that isn’t
solved by this approach is configuring Vagrant itself.

# Environment Config in Vagrant

Normally Vagrant settings are static per project and therefore the
[Vagrantfile should be committed to source control](https://www.vagrantup.com/docs/vagrantfile/)
to share amongst developers. However occasionally there are settings that need
to vary by team member. For example, if we’re using
[vagrant-digitalocean](https://github.com/devopsgroup-io/vagrant-digitalocean)
then we’ll need to supply [DigitalOcean](https://www.digitalocean.com/)
credentials to provision the Vagrant guest. It’s unlikely that these credentials
should be committed to the repository. Instead we refer to the environment in
the `Vagrantfile` , for example:

    Vagrant.configure('2') do |config|
      config.vm.provider :digital_ocean do |digitalocean, override|
        # This is not a complete config
        digitalocean.name = ENV['VAGRANT_DIGITALOCEAN_NAME']
        digitalocean.token = ENV['VAGRANT_DIGITALOCEAN_TOKEN']
      end
    end

At this point we’re confronted with the question of how to populate the
environment with these values. We could put them in our host user’s
`.bash_profile` , but then any changes require starting a new terminal. Ideally
we’d like to have a single source of environment settings for Vagrant and the
app; in other words, we’d like our `Vagrantfile` to read `env.bash` .

## Vagrantfile Snippet

This snippet at the top of `Vagrantfile` reads `env.bash` to augment Vagrant’s
environment:

    # Load env.bash
    ENV.update(eval `bash -c '
      if [[ -s env.bash ]]; then
        source env.bash >/dev/null
      fi
      ruby -e "p ENV"
    '`)

This works by running Bash from `Vagrantfile` to load `env.bash`, then calling
Ruby from Bash to emit the new environment settings in Ruby syntax. That output
is eval’d by the outer Ruby instance—the one processing `Vagrantfile` —to update
its `ENV`.

## Vagrant Plugin

The snippet above does the trick but it’s a bit hokey. It doesn’t scale well to
lots of Vagrantfiles because it needs to be cut and pasted around. It also
doesn’t provide anything in the way of introspection. But Vagrant
[provides the ability to implement plugins for custom functionality](https://www.vagrantup.com/docs/plugins/),
and we can use that to re-implement the snippet in a way that doesn’t pollute
our Vagrantfiles.

The plugin is called
[Vagrant-EnvBash](https://github.com/agriffis/vagrant-envbash) and you can
install it like all Vagrant plugins:

    $ vagrant plugin install vagrant-envbash
    Installing the 'vagrant-envbash' plugin. This can take a few minutes...
    Installed the plugin 'vagrant-envbash (0.0.1)'!

The plugin works basically the same way as the snippet, with a few improvements:

- `env.bash` is read automatically without any changes to Vagrantfile.
- `env.bash` is located adjacent to the project’s Vagrantfile rather than relying on the working directory of the Vagrant process.
- Any environment variables that are unset in `env.bash` will also be removed from `ENV` .
- The plugin provides a command `vagrant env` which shows what variables are added, removed and modified by processing `env.bash` .

If you use the plugin, I’d like to hear about it in the comments below!

