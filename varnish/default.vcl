vcl 4.1;

acl purge_allowed {
    "localhost";
    "127.0.0.1";
${VARNISH_PURGE_IPS_ACL}}

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
        if (!client.ip ~ purge_allowed) {
            return (synth(403, "Forbidden"));
        }
        if (req.http.X-Purge-Token != "${VARNISH_PURGE_TOKEN}") {
            return (synth(403, "Forbidden"));
        }
        return (purge);
    }

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
