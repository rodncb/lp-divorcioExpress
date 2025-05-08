<?php
// Teste simples para verificar se o cURL está disponível e funcionando
header("Content-Type: text/plain");

// Verificar se cURL está habilitado
if (!function_exists('curl_version')) {
    echo "cURL NÃO está disponível neste servidor.\n";
    exit;
}

echo "cURL ESTÁ disponível neste servidor.\n";
echo "Versão cURL: " . curl_version()['version'] . "\n\n";

// Informações de configuração do PHP relevantes
echo "PHP version: " . phpversion() . "\n";
echo "allow_url_fopen: " . ini_get('allow_url_fopen') . "\n\n";

// Testar uma requisição simples para um endpoint público
$curl = curl_init();
curl_setopt_array($curl, [
    CURLOPT_URL => "https://httpbin.org/get",
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 30,
    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
    CURLOPT_CUSTOMREQUEST => "GET",
]);

$response = curl_exec($curl);
$err = curl_error($curl);
$info = curl_getinfo($curl);

echo "Teste de requisição simples:\n";
if ($err) {
    echo "Erro: " . $err . "\n";
} else {
    echo "Status: " . $info['http_code'] . "\n";
    echo "Resposta: " . $response . "\n";
}

curl_close($curl);