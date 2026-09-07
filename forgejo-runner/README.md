# forgejo-runner

Forgejo Actions runner for [git.insuit.cz](https://git.insuit.cz), running on
`jesse.pollos` (x86 Debian 13) as a dedicated CI box. Job containers run natively
as `amd64`; cross-arch image builds fall back to QEMU.

The runner is a single container sharing the host Docker socket (`automount`),
so workflow jobs can run `docker buildx` against the box's own daemon — no dind.
It runs non-root (`1001`), reaching the socket via the host `docker` group gid.

## Fetching actions over the LAN

`git.insuit.cz` is proxied by Cloudflare, so a `uses:` on this box leaves the
network, reaches an edge in Prague and comes back — for a Forgejo instance two
hops away. Actions resolve before a job's first step and nothing caches the
fetched code, so an eight-job workflow makes that trip about ten times per run.
It has already failed at the connect stage twice, against two different hosts,
which is what ruled the remote out and pointed at this path.

Set `FORGEJO_INTERNAL_URL` in `.env` to the origin's real address:

    FORGEJO_INTERNAL_URL=http://<forgejo-lan-ip>:3000

`compose.yml` turns that into a git URL rewrite for the runner, through
`GIT_CONFIG_*` so there is no config file to mount. Leave it unset and nothing
changes.

It must be the address **and port** Forgejo actually listens on. It publishes
plain HTTP on 3000 and nothing on 443, so mapping the hostname to the LAN IP with
`--add-host` would not work on its own: there is no TLS listener on that side and
no certificate for one. Rewriting the whole URL handles the scheme and the port
together.

Check it before relying on it, from the runner box:

```sh
git ls-remote http://<forgejo-lan-ip>:3000/tools-mirror/checkout v7
```

That is the fetch the runner makes. If it prints a sha, the rewrite will work; if
it hangs, the origin is not reachable there and the problem is not Cloudflare.

## Caveats

Known limitations and gotchas of Forgejo's registry/package and Actions
behavior are collected in [CAVEATS.md](CAVEATS.md) — read it before wiring up
image CI on this instance.

## Setup on a fresh box

1. `make rsync` — pushes this dir (incl. the example config) to
   `jesse.pollos:forgejo-runner/`
2. On the box, once: `make config` — copies `runner/config.example.yml` →
   `runner/config.yml` (existing config is kept)
3. Edit `runner/config.yml` on jesse, filling the **UUID** and **Token** from
   Forgejo UI → **Settings → Actions → Runners → Create new runner**
   into `server.connections.forgejo` (`url` uses the publicly reachable
   `https://git.insuit.cz/`).
4. `make prepare` — one-time: owns `data/` for uid `1001` and writes `.env`
   with the docker group gid
5. `make up`
6. Verify the runner shows **online** in the Forgejo UI.
7. One-time, for cross-arch image builds: `make qemu`

`runner/config.yml`, `.env` and `data/` are gitignored — the token and socket
gid never land in the public `homelab` repo.

## Operations

```sh
make rsync        # push changes to the box (after editing config, eg. capacity)
ssh jesse.pollos 'cd forgejo-runner && make logs'    # follow runner logs
ssh jesse.pollos 'cd forgejo-runner && make status'
```

## Labels

| Label           | Execution              | Where a step actually runs                    |
|-----------------|------------------------|-----------------------------------------------|
| `ubuntu-latest` | Docker via host socket | `docker.gitea.com/runner-images:ubuntu-22.04` |
| `self-hosted`   | `:host`                | *inside the runner container* — see below     |

**Use `ubuntu-latest` for everything.** The label image is the Gitea project's
runner image (built on the catthehacker `act` base, org-maintained and
version-pinned); `force_pull: true` keeps the job image refreshed. It carries
node, the docker client, make, curl, python3, sudo and apt.

`self-hosted` is mapped `self-hosted:host`, and "host" does not mean this box.
It forks a shell from the runner *process*, and that process is itself a
container — so a step lands inside `forgejo/runner:13`, which is Alpine with git,
bash and coreutils and nothing else. No node, so no JavaScript action runs there
(`actions/checkout` fails with `Cannot find: node in PATH`); no docker client, no
make, no curl, no JDK. It is almost never what a workflow wants, and the name
suggests otherwise, which is how the mistake gets made.

Forgejo matches a job by `runnerLabels.IsSubset(job.RunsOn)`, so `runs-on` takes
**one** of these names and never a list. A GitHub-style
`runs-on: [self-hosted, linux, x64]` matches no runner here, and an unmatched job
queues indefinitely rather than failing — which is the worst way to find out.

Workflow-authoring gotchas that follow from this layout — the job container's
filesystem and network, which actions work, which CLIs do not — are in
[CAVEATS.md](CAVEATS.md).
