<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { text-align: center; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 20px; }
        .code-box { background: #e0e7ff; color: #3730a3; font-size: 32px; font-weight: bold; text-align: center; padding: 15px; letter-spacing: 5px; border-radius: 5px; margin: 20px 0; }
        .footer { font-size: 12px; color: #888; text-align: center; margin-top: 30px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Verifikasi Masuk</h2>
        </div>
        <p>Halo, <strong>{{ $userName }}</strong>!</p>
        <p>Anda baru saja mencoba masuk atau mendaftar. Silakan masukkan kode verifikasi berikut untuk melanjutkan:</p>
        
        <div class="code-box">
            {{ $code }}
        </div>

        <p>Kode ini akan kedaluwarsa dalam 10 menit. Jangan berikan kode ini kepada siapa pun.</p>
        
        <div class="footer">
            &copy; {{ date('Y') }} Pitstop Project. All rights reserved.
        </div>
    </div>
</body>
</html>