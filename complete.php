<?php
// Configurar cabeçalhos CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Para requisições OPTIONS (preflight CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Apenas aceitar POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
    exit;
}

// Receber dados do POST
$request_body = file_get_contents('php://input');
$request_data = json_decode($request_body, true);

// Log para debug (ativado inicialmente para testes)
$log_file = 'complete_log.txt';
file_put_contents($log_file, date('Y-m-d H:i:s') . " - Requisição recebida: " . $request_body . PHP_EOL, FILE_APPEND);

// Validar dados recebidos
if (!isset($request_data['data']) || !isset($request_data['token'])) {
    http_response_code(400);
    echo json_encode(["error" => "Missing required fields: data, token"]);
    file_put_contents($log_file, date('Y-m-d H:i:s') . " - Erro: Campos obrigatórios ausentes" . PHP_EOL, FILE_APPEND);
    exit;
}

// Token do RD Station e ID do estágio
$rd_token = $request_data['token']; // Usar o token enviado pelo frontend
$deal_stage_id = "680a2cc17c1a0500143f1d36"; // Mesmo ID usado no JavaScript

// Preparar a requisição para o RD Station (Contato)
$rd_contact_url = 'https://crm.rdstation.com/api/v1/contacts';
$rd_data = $request_data['data'];

// Log dos dados sendo enviados
file_put_contents($log_file, date('Y-m-d H:i:s') . " - Token: " . $rd_token . " - Dados a serem enviados: " . json_encode($rd_data) . PHP_EOL, FILE_APPEND);

// Inicializar cURL para contato
$curl = curl_init();

// Configurar opções do cURL com headers avançados para simular navegador
curl_setopt_array($curl, [
    CURLOPT_URL => $rd_contact_url,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_ENCODING => "",
    CURLOPT_MAXREDIRS => 10,
    CURLOPT_TIMEOUT => 30,
    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
    CURLOPT_CUSTOMREQUEST => "POST",
    CURLOPT_POSTFIELDS => json_encode($rd_data),
    CURLOPT_HTTPHEADER => [
        "Content-Type: application/json",
        "Authorization: Token " . $rd_token,
        "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        "Origin: https://divorcioexpress-ibdfam.com.br",
        "Referer: https://divorcioexpress-ibdfam.com.br/",
        "Accept: application/json",
        "Accept-Language: pt-BR,pt;q=0.9,en;q=0.8",
        "X-Requested-With: XMLHttpRequest"
    ],
]);

// Executar a requisição
$contact_response = curl_exec($curl);
$err = curl_error($curl);
$http_code = curl_getinfo($curl, CURLINFO_HTTP_CODE);
curl_close($curl);

// Log da resposta de contato
file_put_contents($log_file, date('Y-m-d H:i:s') . " - Status contato: {$http_code}, Resposta: " . $contact_response . PHP_EOL, FILE_APPEND);
if ($err) {
    file_put_contents($log_file, date('Y-m-d H:i:s') . " - Erro cURL (contato): " . $err . PHP_EOL, FILE_APPEND);
}

// Se o contato não foi criado com sucesso
if ($http_code < 200 || $http_code >= 300) {
    http_response_code($http_code);
    echo $contact_response;
    exit;
}

// Decodificar a resposta para obter o ID do contato
$contact_data = json_decode($contact_response, true);
$contact_id = isset($contact_data['_id']) ? $contact_data['_id'] : null;

if (!$contact_id) {
    http_response_code(500);
    $error_response = json_encode([
        "error" => "Contact ID not found in the response",
        "contact_response" => $contact_data
    ]);
    echo $error_response;
    file_put_contents($log_file, date('Y-m-d H:i:s') . " - Erro: ID do contato não encontrado" . PHP_EOL, FILE_APPEND);
    exit;
}

// Criar oportunidade (deal)
$rd_deal_url = 'https://crm.rdstation.com/api/v1/deals';
$deal_data = [
    "deal" => [
        "name" => "Divórcio Express - " . $rd_data['name'],
        "contact_id" => $contact_id,
        "deal_stage_id" => $deal_stage_id,
        "deal_custom_fields" => [
            "origem_lead" => "Landing Page",
            "tipo_servico" => "Divórcio Express"
        ]
    ]
];

// Log dos dados da oportunidade
file_put_contents($log_file, date('Y-m-d H:i:s') . " - Dados da oportunidade: " . json_encode($deal_data) . PHP_EOL, FILE_APPEND);

// Inicializar cURL para oportunidade
$curl = curl_init();

// Configurar opções do cURL com headers avançados para simular navegador
curl_setopt_array($curl, [
    CURLOPT_URL => $rd_deal_url,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_ENCODING => "",
    CURLOPT_MAXREDIRS => 10,
    CURLOPT_TIMEOUT => 30,
    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
    CURLOPT_CUSTOMREQUEST => "POST",
    CURLOPT_POSTFIELDS => json_encode($deal_data),
    CURLOPT_HTTPHEADER => [
        "Content-Type: application/json",
        "Authorization: Token " . $rd_token,
        "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        "Origin: https://divorcioexpress-ibdfam.com.br",
        "Referer: https://divorcioexpress-ibdfam.com.br/",
        "Accept: application/json",
        "Accept-Language: pt-BR,pt;q=0.9,en;q=0.8",
        "X-Requested-With: XMLHttpRequest"
    ],
]);

// Executar a requisição
$deal_response = curl_exec($curl);
$err = curl_error($curl);
$deal_http_code = curl_getinfo($curl, CURLINFO_HTTP_CODE);
curl_close($curl);

// Log da resposta de oportunidade
file_put_contents($log_file, date('Y-m-d H:i:s') . " - Status oportunidade: {$deal_http_code}, Resposta: " . $deal_response . PHP_EOL, FILE_APPEND);
if ($err) {
    file_put_contents($log_file, date('Y-m-d H:i:s') . " - Erro cURL (oportunidade): " . $err . PHP_EOL, FILE_APPEND);
}

// Retornar resposta completa
http_response_code(200);
$success_response = json_encode([
    "success" => true,
    "dealCreated" => ($deal_http_code >= 200 && $deal_http_code < 300),
    "contact" => $contact_data,
    "deal" => json_decode($deal_response, true)
]);
echo $success_response;
file_put_contents($log_file, date('Y-m-d H:i:s') . " - Resposta enviada ao cliente: " . $success_response . PHP_EOL, FILE_APPEND);