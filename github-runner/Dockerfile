FROM myoung34/github-runner:2.332.0

# Add Supabase CLI (ARM64 binary)
RUN SUPABASE_VERSION=$(curl -fsSL https://api.github.com/repos/supabase/cli/releases/latest \
      | grep '"tag_name"' | sed 's/.*"v\([^"]*\)".*/\1/') && \
    curl -fsSL "https://github.com/supabase/cli/releases/latest/download/supabase_linux_arm64.tar.gz" \
      | tar -xz -C /usr/local/bin supabase && \
    chmod +x /usr/local/bin/supabase

# Add Node.js 22 (for npx / sentry-cli)
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && rm -rf /var/lib/apt/lists/*
