vcl 4.1;

backend default {
  .host = "api.github.com";
  .port = "443";
}

sub vcl_recv {
  if (req.http.Authorization) {
    unset req.http.Authorization;
  }

  if (req.method != "GET" && req.method != "HEAD") {
    return (pass);
  }
}

sub vcl_hit {
  if (obj.ttl <= 0s && obj.http.ETag) {
    set req.http.If-None-Match = obj.http.ETag;
    return (restart);
  }
  return (deliver);
}

sub vcl_backend_response {
  if (beresp.http.ETag) {
    set beresp.ttl = 60m;
  }
  return (deliver);
}
