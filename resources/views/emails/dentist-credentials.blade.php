<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Dentist Account Credentials</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #4CAF50;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
        }
        .content {
            background-color: #f9f9f9;
            padding: 30px;
            border: 1px solid #ddd;
            border-radius: 0 0 5px 5px;
        }
        .credentials {
            background-color: white;
            padding: 20px;
            margin: 20px 0;
            border-left: 4px solid #4CAF50;
            border-radius: 4px;
        }
        .credential-item {
            margin: 10px 0;
        }
        .credential-label {
            font-weight: bold;
            color: #555;
        }
        .credential-value {
            color: #000;
            font-family: 'Courier New', monospace;
            background-color: #f5f5f5;
            padding: 5px 10px;
            border-radius: 3px;
            display: inline-block;
            margin-left: 10px;
        }
        .password-format {
            background-color: #fff3cd;
            border: 1px solid #ffc107;
            padding: 15px;
            border-radius: 4px;
            margin: 20px 0;
        }
        .important {
            color: #d32f2f;
            font-weight: bold;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 12px;
            color: #777;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Welcome to Our Dental Clinic</h1>
    </div>
    
    <div class="content">
        <p>Dear <strong>{{ $dentistName }}</strong>,</p>
        
        <p>Your dentist account has been successfully created! Below are your login credentials:</p>
        
        <div class="credentials">
            <div class="credential-item">
                <span class="credential-label">Email:</span>
                <span class="credential-value">{{ $email }}</span>
            </div>
            <div class="credential-item">
                <span class="credential-label">Password Digits:</span>
                <span class="credential-value">{{ $passwordDigits }}</span>
            </div>
        </div>
        
        <div class="password-format">
            <p><strong>📝 Password Format:</strong></p>
            <p>Your password follows this format: <code>lastname_{{ $passwordDigits }}</code></p>
            <p style="font-size: 12px; color: #666; margin-top: 10px;">
                <em>Note: Use your last name (all lowercase, no spaces) followed by an underscore and the 4 digits above.</em>
            </p>
        </div>
        
        <p class="important">⚠️ IMPORTANT SECURITY NOTICE:</p>
        <ul>
            <li>You will be required to <strong>change your password</strong> upon first login</li>
            <li>Please keep your credentials secure and do not share them with anyone</li>
            <li>Choose a strong password when you change it</li>
        </ul>
        
        <p>If you have any questions or need assistance, please contact the administrator.</p>
        
        <p>Best regards,<br>
        <strong>Dental Clinic Administration</strong></p>
    </div>
    
    <div class="footer">
        <p>This is an automated message. Please do not reply to this email.</p>
        <p>&copy; {{ date('Y') }} Dental Clinic. All rights reserved.</p>
    </div>
</body>
</html>
