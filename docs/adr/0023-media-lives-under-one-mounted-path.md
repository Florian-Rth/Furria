# Media lives under one mounted path

The media store (L7a) holds the club's photos and videos — roughly 0.2–0.3 TB per season, growing
every year. Decided with Florian on 2026-10-08 while shaping L7a.

## The decision

**The API stores every media file on the file system under one configured root path.** Where that
path physically lives is the operator's choice, made in the deployment (Docker volume, bind mount,
NAS, an S3 bucket mounted as a file system — anything Docker or Kubernetes can mount). The code
knows a path, never a storage product. Postgres holds the metadata; the path holds the bytes.

## Considered options

- **S3 API in the code** (Hetzner Object Storage, MinIO in development) — direct browser uploads
  and offsite durability, but a storage product baked into the application and a running cost.
  Rejected: the club runs on its own hardware, and mounting S3 stays possible without the code
  knowing.

## Consequences

- **Every byte passes the edge and the homelab uplink** — uploads and downloads. Large uploads must
  be chunked and resumable, and the edge's body-size limits and timeouts must allow the chunks.
- **Backups of the media path are the operator's**, beside the database's. A database restore
  without the matching media path (or vice versa) leaves dangling items; the restore runbook must
  restore both from the same point.
