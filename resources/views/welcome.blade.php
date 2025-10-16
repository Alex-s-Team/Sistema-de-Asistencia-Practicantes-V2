<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-g">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>Sistema de Asistencia</title>

        <!-- Carga los assets de Vite (CSS y JS) y habilita el Hot Reload -->
        @viteReactRefresh
        @vite('resources/js/app.jsx')
    </head>
    <body class="antialiased">
        
        <!-- ESTE ES EL CONTENEDOR DONDE REACT MONTARÁ TODA LA APLICACIÓN -->
        <div id="app"></div>
        
    </body>
</html>