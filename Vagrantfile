Vagrant.configure("2") do |config|
  config.vm.box = "wheezy64"
  config.vm.box_url = "http://bit.ly/vagrant-lxc-wheezy64-2013-10-23"

  config.vm.network :forwarded_port, guest: 8000, host: 8001

  # Disable the default shared folder; prefer explicit control
  config.vm.synced_folder ".", "/vagrant", id: "vagrant-root", disabled: true
  config.vm.synced_folder ".", "/home/vagrant/src", :owner => "vagrant", :group => "vagrant"

  config.vm.provision :shell, :path => "provision.bash"

  # For vagrant ssh, forward agent into the VM so that ssh-based deploy
  # works
  config.ssh.forward_agent = true
end
