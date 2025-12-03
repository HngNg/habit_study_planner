# Ensure vite dependencies are installed first
if (-not (Test-Path "node_modules\rollup")) {
    Write-Host "Installing rollup manually..."
    npm pack rollup@4.13.0 2>&1 | Out-Null
    $rollupTarball = Get-ChildItem -Filter "rollup-*.tgz" | Select-Object -First 1
    if ($rollupTarball) {
        tar -xzf $rollupTarball.Name
        if (Test-Path "package") {
            Move-Item -Path "package" -Destination "node_modules\rollup" -Force
        }
        Remove-Item $rollupTarball.Name
    }
}

if (-not (Test-Path "node_modules\esbuild")) {
    Write-Host "Installing esbuild manually..."
    npm pack esbuild@0.21.3 2>&1 | Out-Null
    $esbuildTarball = Get-ChildItem -Filter "esbuild-*.tgz" | Select-Object -First 1
    if ($esbuildTarball) {
        tar -xzf $esbuildTarball.Name
        if (Test-Path "package") {
            Move-Item -Path "package" -Destination "node_modules\esbuild" -Force
        }
        Remove-Item $esbuildTarball.Name
    }
}

# Ensure vite is installed
if (-not (Test-Path "node_modules\vite")) {
    Write-Host "Installing vite manually..."
    npm pack vite@5.4.1 2>&1 | Out-Null
    $viteTarball = Get-ChildItem -Filter "vite-*.tgz" | Select-Object -First 1
    if ($viteTarball) {
        tar -xzf $viteTarball.Name
        if (Test-Path "package") {
            Move-Item -Path "package" -Destination "node_modules\vite" -Force
        }
        Remove-Item $viteTarball.Name
    }
}

# Ensure @vitejs/plugin-react and its dependencies are installed
$pluginPath = "node_modules\@vitejs\plugin-react"
if (-not (Test-Path $pluginPath)) {
    Write-Host "Installing @vitejs/plugin-react manually..."
    New-Item -ItemType Directory -Force -Path "node_modules\@vitejs" | Out-Null
    npm pack @vitejs/plugin-react@4.7.0 2>&1 | Out-Null
    $tarball = Get-ChildItem -Filter "vitejs-plugin-react-*.tgz" | Select-Object -First 1
    if ($tarball) {
        tar -xzf $tarball.Name
        if (Test-Path "package") {
            Move-Item -Path "package" -Destination $pluginPath -Force
        }
        Remove-Item $tarball.Name
    }
}

# Ensure @rolldown/pluginutils is installed (dependency of plugin-react)
if (-not (Test-Path "node_modules\@rolldown\pluginutils")) {
    Write-Host "Installing @rolldown/pluginutils manually..."
    New-Item -ItemType Directory -Force -Path "node_modules\@rolldown" | Out-Null
    npm pack @rolldown/pluginutils@1.0.0-beta.27 2>&1 | Out-Null
    $rolldownTarball = Get-ChildItem -Filter "rolldown-pluginutils-*.tgz" | Select-Object -First 1
    if ($rolldownTarball) {
        tar -xzf $rolldownTarball.Name
        if (Test-Path "package") {
            Move-Item -Path "package" -Destination "node_modules\@rolldown\pluginutils" -Force
        }
        Remove-Item $rolldownTarball.Name
    }
}

# Ensure react-refresh is installed (dependency of plugin-react)
if (-not (Test-Path "node_modules\react-refresh")) {
    Write-Host "Installing react-refresh manually..."
    npm pack react-refresh@0.17.0 2>&1 | Out-Null
    $reactRefreshTarball = Get-ChildItem -Filter "react-refresh-*.tgz" | Select-Object -First 1
    if ($reactRefreshTarball) {
        tar -xzf $reactRefreshTarball.Name
        if (Test-Path "package") {
            Move-Item -Path "package" -Destination "node_modules\react-refresh" -Force
        }
        Remove-Item $reactRefreshTarball.Name
    }
}

# Ensure PostCSS plugins are installed (tailwindcss dependencies)
if (-not (Test-Path "node_modules\tailwindcss")) {
    Write-Host "Installing tailwindcss manually..."
    npm pack tailwindcss@3.4.18 2>&1 | Out-Null
    $tailwindTarball = Get-ChildItem -Filter "tailwindcss-*.tgz" | Select-Object -First 1
    if ($tailwindTarball) {
        tar -xzf $tailwindTarball.Name
        if (Test-Path "package") {
            Move-Item -Path "package" -Destination "node_modules\tailwindcss" -Force
        }
        Remove-Item $tailwindTarball.Name
    }
}

if (-not (Test-Path "node_modules\autoprefixer")) {
    Write-Host "Installing autoprefixer manually..."
    npm pack autoprefixer@10.4.22 2>&1 | Out-Null
    $autoprefixerTarball = Get-ChildItem -Filter "autoprefixer-*.tgz" | Select-Object -First 1
    if ($autoprefixerTarball) {
        tar -xzf $autoprefixerTarball.Name
        if (Test-Path "package") {
            Move-Item -Path "package" -Destination "node_modules\autoprefixer" -Force
        }
        Remove-Item $autoprefixerTarball.Name
    }
}

if (-not (Test-Path "node_modules\@alloc\quick-lru")) {
    Write-Host "Installing @alloc/quick-lru manually..."
    New-Item -ItemType Directory -Force -Path "node_modules\@alloc" | Out-Null
    npm pack @alloc/quick-lru 2>&1 | Out-Null
    $quickLruTarball = Get-ChildItem -Filter "alloc-quick-lru-*.tgz" | Select-Object -First 1
    if ($quickLruTarball) {
        tar -xzf $quickLruTarball.Name
        if (Test-Path "package") {
            Move-Item -Path "package" -Destination "node_modules\@alloc\quick-lru" -Force
        }
        Remove-Item $quickLruTarball.Name
    }
}

