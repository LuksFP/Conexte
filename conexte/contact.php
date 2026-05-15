<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

// Bloqueia métodos que não sejam POST
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método não permitido.']);
    exit;
}

// ── Configuração SMTP ─────────────────────────────────────────────────────────
// Docker  : defina as variáveis de ambiente no docker-compose.yml / .env
// HostGator: edite os valores abaixo diretamente neste arquivo
// ─────────────────────────────────────────────────────────────────────────────
$smtpHost   = getenv('SMTP_HOST')   ?: 'mail.conexte.com.br';
$smtpUser   = getenv('SMTP_USER')   ?: 'faleconosco@conexte.com.br';
$smtpPass   = getenv('SMTP_PASS')   ?: '';
$smtpPort   = (int)(getenv('SMTP_PORT')   ?: 465);
$smtpSecure = getenv('SMTP_SECURE') ?: 'ssl';  // 'ssl' (porta 465) ou 'tls' (porta 587)
$mailTo     = getenv('MAIL_TO')     ?: 'faleconosco@conexte.com.br';
// ─────────────────────────────────────────────────────────────────────────────

// vendor/ fica um nível acima da pasta pública (fora do webroot)
require __DIR__ . '/../vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

// Sanitização
$nome     = trim(strip_tags($_POST['nome']     ?? ''));
$empresa  = trim(strip_tags($_POST['empresa']  ?? ''));
$email    = trim(strip_tags($_POST['email']    ?? ''));
$telefone = trim(strip_tags($_POST['telefone'] ?? ''));
$mensagem = trim(strip_tags($_POST['mensagem'] ?? ''));

if (!$nome || !$email || !$mensagem) {
    http_response_code(400);
    echo json_encode(['error' => 'Nome, e-mail e mensagem são obrigatórios.']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'E-mail inválido.']);
    exit;
}

$mail = new PHPMailer(true);

try {
    $mail->isSMTP();
    $mail->Host       = $smtpHost;
    $mail->SMTPAuth   = true;
    $mail->Username   = $smtpUser;
    $mail->Password   = $smtpPass;
    $mail->SMTPSecure = $smtpSecure === 'ssl'
        ? PHPMailer::ENCRYPTION_SMTPS
        : PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = $smtpPort;
    $mail->CharSet    = 'UTF-8';

    $mail->setFrom($smtpUser, 'Conexte Site');
    $mail->addAddress($mailTo, 'Conexte');
    $mail->addReplyTo($email, $nome);

    $mail->Subject = "Contato pelo site — {$nome}";
    $mail->isHTML(true);
    $mail->Body = "
        <h2 style='font-family:sans-serif;color:#00085A'>Nova mensagem — Conexte Site</h2>
        <table style='font-family:sans-serif;font-size:15px;border-collapse:collapse'>
          <tr><td style='padding:4px 12px 4px 0;color:#555'><strong>Nome</strong></td><td>{$nome}</td></tr>
          <tr><td style='padding:4px 12px 4px 0;color:#555'><strong>Empresa</strong></td><td>" . ($empresa ?: '—') . "</td></tr>
          <tr><td style='padding:4px 12px 4px 0;color:#555'><strong>E-mail</strong></td><td>{$email}</td></tr>
          <tr><td style='padding:4px 12px 4px 0;color:#555'><strong>Telefone</strong></td><td>" . ($telefone ?: '—') . "</td></tr>
        </table>
        <p style='font-family:sans-serif;font-size:15px;margin-top:16px'><strong>Mensagem:</strong><br>" . nl2br(htmlspecialchars($mensagem)) . "</p>
    ";
    $mail->AltBody = "Nome: {$nome}\nEmpresa: " . ($empresa ?: '—') . "\nE-mail: {$email}\nTelefone: " . ($telefone ?: '—') . "\n\nMensagem:\n{$mensagem}";

    $mail->send();
    echo json_encode(['ok' => true]);
} catch (Exception $e) {
    error_log('PHPMailer: ' . $mail->ErrorInfo);
    http_response_code(500);
    echo json_encode(['error' => 'Não foi possível enviar a mensagem. Tente novamente.']);
}
