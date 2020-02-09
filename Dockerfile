# docker/ubuntu made vagrant-friendly.
# https://hub.docker.com/r/jesselang/debian-vagrant/~/dockerfile/
FROM ubuntu:bionic

# Basic upgrades; install sudo and SSH.
RUN apt-get update && apt-get dist-upgrade -y && \
        apt-get install --no-install-recommends -y sudo openssh-server
RUN mkdir /var/run/sshd
RUN sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
RUN echo 'UseDNS no' >> /etc/ssh/sshd_config

# Remove the policy file once we're finished installing software.
# This allows invoke-rc.d and friends to work as expected.
RUN rm /usr/sbin/policy-rc.d

# Add the Vagrant user and necessary passwords.
RUN groupadd vagrant
RUN useradd -c "Vagrant User" -g vagrant -d /home/vagrant -m -s /bin/bash vagrant
RUN echo vagrant:vagrant | chpasswd
RUN echo root:vagrant | chpasswd

# Allow the vagrant user to use sudo without a password.
RUN echo 'vagrant ALL=(ALL) NOPASSWD: ALL' > /etc/sudoers.d/vagrant

# Install Vagrant's insecure public key so provisioning and 'vagrant ssh' work.
RUN mkdir /home/vagrant/.ssh
ADD https://raw.githubusercontent.com/mitchellh/vagrant/master/keys/vagrant.pub /home/vagrant/.ssh/authorized_keys
RUN chmod 0600 /home/vagrant/.ssh/authorized_keys
RUN chown -R vagrant:vagrant /home/vagrant/.ssh
RUN chmod 0700 /home/vagrant/.ssh

# Note that EXPOSE 22 is unnecessary, because Vagrant automatically exposes
# the SSH port if docker.has_ssh = true.
CMD ["/usr/sbin/sshd", "-D"]
