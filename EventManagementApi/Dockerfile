# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy project files and restore
COPY ["EventManagementApi/EventManagementApi.csproj", "EventManagementApi/"]
RUN dotnet restore "EventManagementApi/EventManagementApi.csproj"

# Copy source and build
COPY . .
WORKDIR "/src/EventManagementApi"
RUN dotnet build "EventManagementApi.csproj" -c Release -o /app/build

# Publish stage
FROM build AS publish
RUN dotnet publish "EventManagementApi.csproj" -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

# Install curl for healthchecks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy backend files
COPY --from=publish /app/publish .

# COPY FRONTEND FILES INTO WWWROOT
COPY www ./wwwroot 

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=60s \
    CMD curl http://localhost:5100/api/auth/login || exit 1

ENTRYPOINT ["dotnet", "EventManagementApi.dll"]
EXPOSE 5100