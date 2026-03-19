vcl 4.1;

# External IPs allowed to send PURGE and BAN (workflow, your public IPs)
acl purge_allowed {
    "localhost";
    "127.0.0.1";
${VARNISH_PURGE_IPS_ACL}}

# Internal Docker network — CMS and other backend services on the same compose network
acl purge_allowed_internal {
    "172.16.0.0"/12;
}

backend default {
    .host = "nginx";
    .port = "8080";

    # Health check Varnish runs continuously in the background.
    .probe = {
        # Send GET / to check if the backend is alive.
        .url = "/";
        # Run the check every 5 seconds.
        .interval = 5s;
        # If nginx doesn't respond within 2 seconds, count it as a failure.
        .timeout = 2s;
        # Look at the last 5 health checks.
        .window = 5;
        # Backend is healthy if at least 3 out of the last 5 checks passed.
        # If it falls below this, Varnish marks it unhealthy and serves stale
        # cached content (within grace period) instead of forwarding to a broken backend.
        .threshold = 3;
    }
}

sub vcl_recv {
    if (req.method == "PURGE") {
        # Internal services (CMS etc.) use their own token and can only PURGE exact URLs
        if (client.ip ~ purge_allowed_internal) {
            if (req.http.X-Purge-Token != "${VARNISH_PURGE_TOKEN_CMS}") {
                return (synth(403, "Forbidden"));
            }
            return (purge);
        }

        # External (workflow, public IPs) use the main token
        if (!client.ip ~ purge_allowed) {
            return (synth(403, "Forbidden"));
        }
        if (req.http.X-Purge-Token != "${VARNISH_PURGE_TOKEN}") {
            return (synth(403, "Forbidden"));
        }
        return (purge);
    }

    # BAN is restricted to external purge_allowed only — internal services cannot wildcard ban
    if (req.method == "BAN") {
        if (!client.ip ~ purge_allowed) {
            return (synth(403, "Forbidden"));
        }
        if (req.http.X-Purge-Token != "${VARNISH_PURGE_TOKEN}") {
            return (synth(403, "Forbidden"));
        }
        ban("req.url ~ " + req.http.X-Ban-Pattern);
        return (synth(200, "Banned"));
    }

    if (req.method != "GET" && req.method != "HEAD") {
        return (pass);
    }

    if (req.http.Authorization || req.http.Cookie) {
        return (pass);
    }

    # Strip query parameters from static assets so e.g. /video.mp4?v=1 and
    # /video.mp4?t=1234 resolve to the same cache entry instead of being stored separately.
    # css, js, woff, woff2, ttf are intentionally excluded — frontend builds use query params
    # as version hashes (e.g. /app.js?v=abc123) so each value is a distinct file.
    if (req.url ~ "\.(mp4|mp3|mov|webm|jpg|jpeg|png|gif|webp|svg|ico)\?") {
        set req.url = regsub(req.url, "\?.*$", "");
    }

    # Frontend paths that should never be cached — always fetch fresh from the app.
    # Add any route that is user-specific, auth-protected, or must not be shared across users.
    if (req.url ~ "^/dashboard" ||  # user dashboard
        req.url ~ "^/admin" ||      # admin panel
        req.url ~ "^/login" ||      # login page (may contain CSRF tokens)
        req.url ~ "^/logout" ||     # logout (must always execute)
        req.url ~ "^/account" ||    # user account / profile
        req.url ~ "^/checkout" ||   # checkout flow
        req.url ~ "^/cart") {       # shopping cart
        return (pass);
    }
}

sub vcl_synth {
    set resp.http.Content-Type = "application/json";

    # VCL long strings {"..."} terminate at "} — the same two chars that close a JSON
    # object whose last value is a string. There is no \" escape in VCL strings.
    # Solution: end every JSON body with a boolean so the last chars are e.g. true}
    # and put dynamic string values (url, message) in response headers instead.
    if (resp.status == 200) {
        set resp.http.X-Url = req.url;
        synthetic({"{"status":"purged","ok":true}"});
    } else if (resp.status == 404) {
        set resp.http.X-Url = req.url;
        synthetic({"{"status":"not_in_cache","ok":false}"});
    } else if (resp.status == 403) {
        synthetic({"{"status":"forbidden","ok":false}"});
    } else {
        set resp.http.X-Message = resp.reason;
        synthetic({"{"status":"error","ok":false}"});
    }

    return (deliver);
}

sub vcl_backend_response {
    # Cache the response for 5 minutes. After that it is considered stale.
    set beresp.ttl = 5m;

    # If the TTL has expired but a fresh copy hasn't been fetched yet (e.g. backend is slow
    # or down), keep serving the stale cached response for up to 1 extra minute rather than
    # making the user wait. Object is fully gone after 6 minutes total (ttl + grace).
    set beresp.grace = 1m;
}

sub vcl_deliver {
    # Add X-Cache header to every response so you can see whether it was served
    # from cache or fetched fresh from nginx. Check it with: curl -I https://yoursite.com
    if (obj.hits > 0) {
        # Object was found in cache and served from there.
        set resp.http.X-Cache = "HIT";
    } else {
        # Object wasn't cached, Varnish had to fetch it from nginx.
        set resp.http.X-Cache = "MISS";
    }
}
