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

    .probe = {
        .url = "/";
        .interval = 5s;
        .timeout = 2s;
        .window = 5;
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

    if (resp.status == 200) {
        synthetic({"{"status":"purged","url":""} + req.url + {""}"});
    } else if (resp.status == 404) {
        synthetic({"{"status":"not_in_cache","url":""} + req.url + {""}"});
    } else if (resp.status == 403) {
        synthetic({"{"status":"forbidden"}"});
    } else {
        synthetic({"{"status":"error","message":""} + resp.reason + {""}"});
    }

    return (deliver);
}

sub vcl_backend_response {
    set beresp.ttl = 5m;
    set beresp.grace = 1m;
}

sub vcl_deliver {
    if (obj.hits > 0) {
        set resp.http.X-Cache = "HIT";
    } else {
        set resp.http.X-Cache = "MISS";
    }
}
