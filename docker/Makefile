.PHONY: install lazydocker

VERSION = 0.24.4

lazydocker:
	curl -Lo lazydocker.tar.gz "https://github.com/jesseduffield/lazydocker/releases/download/v$(VERSION)/lazydocker_$(VERSION)_Linux_arm64.tar.gz"
	tar xzf lazydocker.tar.gz lazydocker
	mkdir -p ~/bin && mv lazydocker ~/bin/
	rm lazydocker.tar.gz

cron-install:
	@crontab -l 2>/dev/null | grep -q "docker system prune" \
		&& (echo "Cron job already exists. To view: crontab -l | grep docker" && exit 1) \
		|| (crontab -l 2>/dev/null; echo "30 3 * * * docker system prune -f") | crontab -
	@echo "Cron job installed."
