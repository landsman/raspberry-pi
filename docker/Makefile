.PHONY: install lazydocker

VERSION = 0.24.4

lazydocker:
	curl -Lo lazydocker.tar.gz "https://github.com/jesseduffield/lazydocker/releases/download/v$(VERSION)/lazydocker_$(VERSION)_Linux_arm64.tar.gz"
	tar xzf lazydocker.tar.gz lazydocker
	mkdir -p ~/bin && mv lazydocker ~/bin/
	rm lazydocker.tar.gz