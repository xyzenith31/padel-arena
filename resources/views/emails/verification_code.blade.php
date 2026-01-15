<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { 
            font-family: 'Helvetica Neue', Arial, sans-serif; 
            background-color: #f8fafc; 
            padding: 40px 20px; 
            margin: 0;
            color: #334155;
        }
        .container { 
            max-width: 500px; 
            margin: 0 auto; 
            background: #ffffff; 
            padding: 40px; 
            border-radius: 16px; 
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
            border-top: 6px solid #EAB308; 
        }
        .header { 
            text-align: center; 
            margin-bottom: 30px; 
        }
        .header h2 {
            color: #1e293b;
            font-size: 24px;
            font-weight: 800;
            margin: 0;
            letter-spacing: -0.5px;
        }
        .brand-text {
            color: #EAB308;
        }
        .message {
            font-size: 16px;
            line-height: 1.6;
            color: #475569;
            margin-bottom: 25px;
            text-align: center;
        }
        .code-box { 
            background: #FEF9C3; 
            border: 2px dashed #FDE047; 
            color: #854D0E; 
            font-size: 36px; 
            font-weight: 900; 
            text-align: center; 
            padding: 20px; 
            letter-spacing: 8px; 
            border-radius: 12px; 
            margin: 30px 0; 
        }
        .expiry-text {
            font-size: 13px;
            color: #94a3b8;
            text-align: center;
            margin-top: 20px;
        }
        .footer { 
            font-size: 12px; 
            color: #cbd5e1; 
            text-align: center; 
            margin-top: 40px; 
            padding-top: 20px;
            border-top: 1px solid #f1f5f9;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Verifikasi <span class="brand-text">Padel Arena</span></h2>
        </div>
        
        <div class="message">
            Halo, <strong>{{ $userName }}</strong>!<br>
            Terima kasih telah bergabung. Gunakan kode di bawah ini untuk memverifikasi akun Anda:
        </div>
        
        <div class="code-box">
            {{ $code }}
        </div>

        <div class="message" style="font-size: 14px;">
            Jangan berikan kode ini kepada siapa pun, termasuk pihak Padel Arena.
        </div>
        
        <p class="expiry-text">
            Kode ini hanya berlaku selama 10 menit.
        </p>

        <div class="footer">
            &copy; {{ date('Y') }} Padel Arena. All rights reserved.
        </div>
    </div>
</body>
</html>