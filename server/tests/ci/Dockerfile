# The backend tests' image: the production media worker image (libvips with the HEIC decoder,
# ffmpeg) plus the .NET SDK. No apt: both come from registries, so CI never waits on a mirror.
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS sdk

FROM florianrth/furria-media-worker:latest
USER root
COPY --from=sdk /usr/share/dotnet /usr/share/dotnet
ENV DOTNET_ROOT=/usr/share/dotnet \
    DOTNET_CLI_TELEMETRY_OPTOUT=1 \
    DOTNET_NOLOGO=1
ENTRYPOINT []
