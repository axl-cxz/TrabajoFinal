<?php
declare(strict_types=1);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    header('Allow: POST');
    exit('Método no permitido.');
}

function postValue(string $key): string
{
    $value = $_POST[$key] ?? '';
    if (!is_string($value)) {
        http_response_code(400);
        exit('Se recibió un dato no válido en el formulario.');
    }

    return trim($value);
}

function singleLine(string $value): string
{
    return trim(preg_replace('/[\r\n\t]+/', ' ', $value) ?? '');
}

$email = postValue('email');
if ($email !== '' && filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
    http_response_code(400);
    exit('El correo electrónico no tiene un formato válido.');
}

$fields = [
    'Nombre' => singleLine(postValue('nombre')),
    'Segundo nombre' => singleLine(postValue('segundo_nombre')),
    'Apellido' => singleLine(postValue('apellido')),
    'Fecha de nacimiento' => singleLine(postValue('fecha_nacimiento')),
    'Género' => singleLine(postValue('genero')),
    'Dirección' => singleLine(postValue('direccion')),
    'Dirección, línea 2' => singleLine(postValue('direccion_linea_2')),
    'Ciudad' => singleLine(postValue('ciudad')),
    'Estado / Provincia' => singleLine(postValue('estado')),
    'Código postal' => singleLine(postValue('codigo_postal')),
    'Email' => singleLine($email),
    'Teléfono' => singleLine(postValue('telefono')),
    '¿Ha recibido otros cursos anteriormente?' => singleLine(postValue('recibio_cursos')),
    'Empresa' => singleLine(postValue('empresa')),
    'Curso' => singleLine(postValue('curso')),
];

$comments = trim(str_replace(["\r\n", "\r"], "\n", postValue('comentarios')));
$message = "Se recibió una nueva inscripción:\n\n";
foreach ($fields as $label => $value) {
    $message .= $label . ': ' . ($value !== '' ? $value : 'No especificado') . "\n";
}
$message .= "\nComentarios:\n" . ($comments !== '' ? $comments : 'Sin comentarios') . "\n";

$recipient = 'cristianleon20082910@gmail.com';
$subject = 'Nueva inscripción de curso';
$headers = [
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
];
if ($email !== '') {
    $headers[] = 'Reply-To: ' . $email;
}

if (!mail($recipient, $subject, $message, implode("\r\n", $headers))) {
    error_log('No se pudo enviar el correo del formulario de inscripción.');
    http_response_code(500);
    exit('No se pudo enviar el formulario. Inténtalo más tarde.');
}

header('Content-Type: text/html; charset=UTF-8');
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Inscripción enviada</title>
</head>
<body>
    <h1>¡Formulario enviado!</h1>
    <p>Recibimos tu inscripción correctamente.</p>
    <p><a href="../inscripcion.html">Volver al formulario</a></p>
</body>
</html>