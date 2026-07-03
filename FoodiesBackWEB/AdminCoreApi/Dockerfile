# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copiar solo el archivo .csproj y restaurar dependencias
COPY ["AdminCoreApi/AdminCoreApi.csproj", "AdminCoreApi/"]
RUN dotnet restore "AdminCoreApi/AdminCoreApi.csproj"

# Copiar el resto del código y compilar
COPY AdminCoreApi/ AdminCoreApi/
WORKDIR "/src/AdminCoreApi"
RUN dotnet build "AdminCoreApi.csproj" -c Release -o /app/build

# Stage 2: Publish
FROM build AS publish
RUN dotnet publish "AdminCoreApi.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 3: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

# Copiar archivos publicados
COPY --from=publish /app/publish .

# Exponer puerto (Render usa variable de entorno PORT)
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

# Punto de entrada
ENTRYPOINT ["dotnet", "AdminCoreApi.dll"]

