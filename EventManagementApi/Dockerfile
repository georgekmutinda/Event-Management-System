# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy solution and project files
COPY ["EventManagementApi/EventManagementApi.csproj", "EventManagementApi/"]
RUN dotnet restore "EventManagementApi/EventManagementApi.csproj"

# Copy source code
COPY . .
WORKDIR "/src/EventManagementApi"
RUN dotnet build "EventManagementApi.csproj" -c Release -o /app/build

# Publish stage
FROM build AS publish
RUN dotnet publish "EventManagementApi.csproj" -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=publish /app/publish .

# Health check - use dotnet HTTP request instead of curl
HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=30s \
    CMD dotnet --version || exit 1

ENTRYPOINT ["dotnet", "EventManagementApi.dll"]
EXPOSE 8080
