#!/bin/bash
#
# Provisioning script for vagrant.

# If there's only one project with requirements and deps in VAGRANT_TOP,
# this is fine, otherwise set VAGRANT_PROJ
: ${VAGRANT_TOP:=/vagrant}
: ${VAGRANT_PROJ:=*}
: ${VAGRANT_VIRTUALENV:=/home/vagrant/env}

main() {
    if [[ $EUID != 0 ]]; then
        msg "--> provision.bash as_user"
        as_user
        msg "<-- provision.bash as_user"
        return
    fi

    msg "--> provision.bash as_root"
    as_root
    msg "<-- provision.bash as_root"

    su vagrant -c "$(printf '%q ' "$0" "$@")"
}

as_root() {
    is_vbox && vbox_preinstall

    install_packages

    (is_docker || is_lxc) && lxc_postinstall
    common_postinstall
}

vbox_preinstall() {
    # If the host has moved between networks, sometimes DNS needs to be
    # reconnected.
    /etc/init.d/networking restart
}

common_postinstall() {
    # Set up the locale support files
    sed -i '/en_US.UTF-8/s/^# *//' /etc/locale.gen
    locale-gen

    # Set the timezone
    ln -sfn /usr/share/zoneinfo/EST5EDT /etc/localtime
}

lxc_postinstall() {
    declare uid gid

    # Make the vagrant uid/gid match the host user
    # so the bind-mounted source area works properly.
    read uid gid <<<"$(stat -c '%u %g' "$VAGRANT_TOP")"
    if [[ ! -n $uid ]]; then
        die "Couldn't read uid/gid for vagrant user"
    fi

    if [[ $(id -u vagrant) != $uid || $(id -g vagrant) != $gid ]]; then
        # usermod/userdel doesn't work when logged in
        sed -i '/vagrant/d' /etc/passwd /etc/shadow
        groupmod -g $gid vagrant
        useradd -u $uid -g vagrant -G sudo -s /bin/bash vagrant \
            -p "$(perl -e "print crypt('vagrant', 'AG')")"
        find /home/vagrant -xdev -print0 | xargs -0r chown $uid:$gid
        chown $uid:$gid /tmp/vagrant-shell 2>/dev/null ||:
    fi
}

install_packages() {
    declare x packages=(
        locales # for locale-gen
        apt-transport-https
        software-properties-common # for add-apt-repository
        curl rsync
        python-pip python-virtualenv python-dev virtualenv
        ruby-dev bundler
        git
        sudo ssh
        build-essential  # gcc etc.
        inotify-tools  # inotifywait
        nodejs  # add npm if not installing from nodesource
        imagemagick  # for image resizing
    )

    # Don't install extra stuff.
    # Suggests list is long; recommends list is short and sensible.
    # To omit recommends, add APT::Install-Recommends "false";
    cat > /etc/apt/apt.conf.d/99vagrant <<EOT
APT::Install-Suggests "false";
EOT

    # Add nodejs upstream.
    if [[ " ${packages[*]} " == *" nodejs "* && \
                ! -e /etc/apt/sources.list.d/nodesource.list ]]; then
        which curl &>/dev/null || (apt-get update; apt-get install curl -y)
        curl -sL https://deb.nodesource.com/setup_12.x | bash
    fi

    # Add yarn package manager.
    if [[ " ${packages[*]} " == *" yarn "* && \
                ! -e /etc/apt/sources.list.d/yarn.list ]]; then
        which curl &>/dev/null || (apt-get update; apt-get install curl -y)
        curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
        echo "deb http://dl.yarnpkg.com/debian/ stable main" | \
            sudo tee /etc/apt/sources.list.d/yarn.list
    fi

    # This should prevent apt-get install/upgrade from asking ANY questions
    export DEBIAN_FRONTEND=noninteractive

    # Update package list
    apt-get update

    # Upgrade ssh server first to avoid killing the running server
    apt-get install -y ssh \
            -o 'PackageManager::Configure=no' \
            -o 'DPkg::ConfigurePending=no'
    chmod -x /etc/init.d/ssh  # prevents restart
    dpkg --configure -a

    # Now the rest
    apt-get install -y "${packages[@]}"
    apt-get upgrade -y "${packages[@]}"

    # Make /usr/bin/nodejs available as /usr/local/bin/node
    ln -sfn /usr/bin/nodejs /usr/local/bin/node
}

as_user() {
    user_bashrc
    user_virtualenv
    user_gems
    user_npm
}

user_bashrc() {
    cd ~

    [[ $PWD == */vagrant ]] || return

    rm -f .profile
    cat > .bash_profile <<EOT
source ~/.bashrc
EOT

    cat > .bashrc <<EOT
[[ -n \$PS1 ]] && PS1='\u@\h:\w\\\$ '
[[ -e $VAGRANT_VIRTUALENV ]] && source $VAGRANT_VIRTUALENV/bin/activate
[[ \$- != *i* ]] && return
cd $VAGRANT_TOP
EOT

    source .bash_profile
}

user_virtualenv() {
    declare venv="${1:-$VAGRANT_VIRTUALENV}" reqs="$2"

    if ! type virtualenv &>/dev/null; then
      echo "no virtualenv, skipping python requirements" >&2
      return
    fi

    # Always create the virtualenv, even if there's no requirements.txt, since
    # we also use it to isolate ruby gems.
    if [[ ! -d $venv ]]; then
        virtualenv $venv
    fi

    if [[ -z $reqs && $venv == "$VAGRANT_VIRTUALENV" ]]; then
        reqs=$(src requirements.txt)
    fi

    if [[ -n $reqs ]]; then
        # Subshell to auto-deactivate
        (
            source $venv/bin/activate
            pip install -U pip
            pip install -r "$reqs"
        )
    fi
}

pip() {
    PYTHONUNBUFFERED=1 command pip "$@"
}

user_gems() {
    declare venv="${1:-$VAGRANT_VIRTUALENV}" gemfile="$2"

    if [[ ! -d $venv ]]; then
      echo "no virtualenv, skipping ruby gems" >&2
      return
    fi

    if ! grep -q GEM_HOME $venv/bin/activate; then
        echo 'export GEM_HOME="$VIRTUAL_ENV/ruby" PATH="$VIRTUAL_ENV/ruby/bin:$PATH"' >> $venv/bin/activate
    fi
    source $venv/bin/activate

    if [[ -z "$gemfile" && $venv == "$VAGRANT_VIRTUALENV" ]]; then
        gemfile=$(src Gemfile)
    fi

    if [[ -n $gemfile ]]; then
        # Subshell to auto-deactivate
        (
            source $venv/bin/activate
            cd "$(dirname $gemfile)"
            bundle clean --force
            bundle install
        )
    fi
}

user_npm() {
    declare found
    if found=$(src yarn.lock) || found=$(src npm-shrinkwrap.json) || found=$(src package.json); then
        cd "$(dirname "$found")"
        if [[ -f yarn.lock ]]; then
            yarn install
        elif [[ -f npm-shrinkwrap.json ]]; then
            npm install
        elif which yarn &>/dev/null; then
            yarn install
        else
            npm install
        fi
    fi
}

src() {
    # ff only checks one level of nesting, and testing it with -f will only
    # succeed if there was a single match.
    declare f=$VAGRANT_TOP/"$1" ff=$(echo $VAGRANT_TOP/$VAGRANT_PROJ/"$1")
    if [[ -f $f ]]; then
        echo "$f"
    elif [[ -f $ff ]]; then
        echo "$ff"
    else
        return 1
    fi
}

msg() {
    echo "$*"
}

die() {
    echo "$*"
    exit 1
}

is_docker() {
    if [[ ! -d /home/vagrant ]]; then
        echo "is_docker: running outside vagrant?" >&2
        return 1
    fi
    sudo grep -qw docker /proc/1/cgroup
    eval "is_docker() { return $?; }"
    is_docker
}

is_lxc() {
    if [[ ! -d /home/vagrant ]]; then
        echo "is_lxc: running outside vagrant?" >&2
        return 1
    fi
    # https://www.redhat.com/archives/virt-tools-list/2013-April/msg00117.html
    sudo grep -q container=lxc /proc/1/environ
    eval "is_lxc() { return $?; }"
    is_lxc
}

is_vbox() {
    if [[ ! -d /home/vagrant ]]; then
        echo "is_vbox: running outside vagrant?" >&2
        return 1
    fi
    which dmidecode &>/dev/null || sudo apt-get install -y dmidecode
    sudo dmidecode 2>/dev/null | grep -q VirtualBox
    eval "is_vbox() { return $?; }"
    is_vbox
}

#######################################################################
#
# RUN MAIN only if not sourced into another script
#
#######################################################################

case ${0##*/} in
    provision.bash|vagrant-shell) main "$@" ;;
esac
