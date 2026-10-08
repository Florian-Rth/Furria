# Build context is the server root: server/
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY nuget.config Directory.Build.props Directory.Packages.props ./
COPY src/Directory.Build.targets src/
COPY src/Furria.MediaWorker/Furria.MediaWorker.csproj src/Furria.MediaWorker/
COPY src/Furria.Application/Furria.Application.csproj src/Furria.Application/
COPY src/Furria.Infrastructure/Furria.Infrastructure.csproj src/Furria.Infrastructure/
COPY src/Furria.Core/Furria.Core.csproj src/Furria.Core/
COPY src/Furria.Tests.Analyzers/Furria.Tests.Analyzers.csproj src/Furria.Tests.Analyzers/
RUN dotnet restore src/Furria.MediaWorker/Furria.MediaWorker.csproj

COPY . .
ARG SOURCE_REVISION_ID=
RUN dotnet publish src/Furria.MediaWorker/Furria.MediaWorker.csproj -c Release -o /app --no-restore \
    -p:SourceRevisionId="$SOURCE_REVISION_ID"

# libvips with the HEIC decoder for photos, ffmpeg for videos, and the Intel VA-API / oneVPL
# runtimes so MEDIA_WORKER_HWACCEL=vaapi|qsv can encode on an iGPU (ADR-0024).
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        libvips42t64 libheif-plugin-libde265 ffmpeg \
        intel-media-va-driver-non-free libvpl2 libmfx-gen1.2 \
    && rm -rf /var/lib/apt/lists/*
RUN mkdir -p /media && chown $APP_UID /media
WORKDIR /app
COPY --from=build /app ./
USER $APP_UID
ENTRYPOINT ["dotnet", "Furria.MediaWorker.dll"]
