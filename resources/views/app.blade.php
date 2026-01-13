<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Pitstop</title>
    <script src="https://app.sandbox.midtrans.com/snap/snap.js" data-client-key="{{ env('MIDTRANS_CLIENT_KEY') }}"></script>
    <link rel="icon" type="image/png" href="{{ asset('logothumbnail-nbg.png') }}">
    @viteReactRefresh
    @vite([
        'resources/js/app.tsx',
        'resources/css/app.css'
    ])
</head>
<body>
    <div id="app"></div>
</body>
</html>