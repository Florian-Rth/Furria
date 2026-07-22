# Build context is the server root: server/
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY nuget.config Directory.Build.props Directory.Packages.props ./
COPY src/Directory.Build.targets src/
COPY src/Furria.Api/Furria.Api.csproj src/Furria.Api/
COPY src/Furria.Application/Furria.Application.csproj src/Furria.Application/
COPY src/Furria.Infrastructure/Furria.Infrastructure.csproj src/Furria.Infrastructure/
COPY src/Furria.Core/Furria.Core.csproj src/Furria.Core/
COPY src/Furria.Tests.Analyzers/Furria.Tests.Analyzers.csproj src/Furria.Tests.Analyzers/
RUN dotnet restore src/Furria.Api/Furria.Api.csproj

COPY . .
RUN dotnet publish src/Furria.Api/Furria.Api.csproj -c Release -o /app --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
RUN apt-get update \
    && apt-get install -y --no-install-recommends libgssapi-krb5-2 \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=build /app ./
USER $APP_UID
EXPOSE 8080
ENTRYPOINT ["dotnet", "Furria.Api.dll"]
