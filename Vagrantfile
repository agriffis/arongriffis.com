Vagrant.configure("2") do |config|
  config.vm.provider :docker do |docker, override|
    docker.build_dir = '.'
    docker.has_ssh = true
  end
  config.ssh.forward_agent = true  # for github in VM
  config.vm.provision :shell, path: "provision.bash"
end
