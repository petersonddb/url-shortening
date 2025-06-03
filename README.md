# URL Shortening Service

*Disclaimer: this service was created for learning purposes.*

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
and, has almost no relationships among data; hence the decision for a NoSQL database and 
multiple database servers mapped by some hashing function; 
furthermore, a caching system will be in place to reduce database accesses.

Generating the short link by hashing the original URL brings more problems than solutions, 
like not unique IDs or the need to crop the resulting hash to something smaller risking duplication; 
therefore, we should use random-generated hashes, there will be a dedicated service to fulfil this task 
mitigating main services overhead.

Expired links are removed timely by a background job and user accesses.

Number of new short links is limited per user; this prevents service abuse.

A critical aspect here is availability; if the service goes off, all redirections (i.e. all short links) 
would start to fail; it is therefore important to have replicas of the servers in place.
