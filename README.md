# URL Shortening Service

*Disclaimer: this service was created for self practicing.*

## The Service

This service creates short links for long URLs and provide redirection from the link to the original URL; 
this is useful to save space and create multiple trackable identifications for a same URLs.

The service should provide:

- Shorter and unique links for long URLs
- Redirection from short links to corresponding original URLs
- Short link expiration, with default values
- APIs for integration with other services besides direct user access

## Development

This kind of service is read-heavy: lots more of redirections than new shortenings; 
and, has almost no relationships among data; hence the decision for NoSQL databases and caching systems: a document-based database for important entities (users, short links, etc.) and a key-value database for sets of ahead-of-time generated keys (see below).

Generating the short link by hashing the original URL brings more problems than solutions, 
like not unique IDs or the need to crop the resulting hash to something smaller risking duplication; 
therefore, random-generated hashes is a better option; a dedicated service 
fulfils this task, mitigating main application overhead.

Expired links are removed timely by a background job and lazily on user access; access tentatives to expired links are notified to the cleaner job through a messaging broker.

Number of new short links is limited per user; this prevents service abuse.

A critical aspect here is availability; if the service goes off, all redirections (i.e. all short links) 
would start to fail; it is therefore important to have replicas of the servers in place.

### Progress

- [x] Keys Generation Service
- [x] Main Application
- [ ] Expired Short Links Cleaner Service
