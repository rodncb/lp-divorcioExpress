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
$log_file = __DIR__ . '/complete_log.txt';
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
$rd_contact_url = 'https://crm.rdstation.com/api/v1/contacts?token=' . $rd_token; // Token na URL conforme solicitado
$rd_data = $request_data['data'];

// SIMPLIFICADO: Criar objeto de contato APENAS com nome, email e telefone
// Sem campos personalizados para evitar erros
$contact_data = [
    "contact" => [
        "name" => isset($rd_data['name']) ? $rd_data['name'] : '',
        "emails" => [
            ["email" => isset($rd_data['email']) ? $rd_data['email'] : '']
        ],
        "phones" => []
    ]
];

// Adicionar telefone se existir
if (isset($rd_data['phones']) && !empty($rd_data['phones'])) {
    $contact_data['contact']['phones'][] = ["phone" => $rd_data['phones'][0]];
}

// Log dos dados sendo enviados (para debug)
file_put_contents($log_file, date('Y-m-d H:i:s') . " - Token: " . $rd_token . " - Dados recebidos do frontend: " . json_encode($rd_data) . PHP_EOL, FILE_APPEND);
file_put_contents($log_file, date('Y-m-d H:i:s') . " - Dados SIMPLIFICADOS para API: " . json_encode($contact_data) . PHP_EOL, FILE_APPEND);

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
    CURLOPT_POSTFIELDS => json_encode($contact_data), // Enviar estrutura com "contact"
    CURLOPT_HTTPHEADER => [
        "Content-Type: application/json",
        "Authorization: " . $rd_token, // Sem o prefixo "Token" - exatamente como no Postman
        "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        "Origin: https://divorcioexpress-ibdfam.com.br",
        "Referer: https://divorcioexpress-ibdfam.com.br/",
        "Accept: application/json",
        "Accept-Language: pt-BR,pt;q=0.9,en;q=0.8",
        "X-Requested-With: XMLHttpRequest"
    ],
    CURLOPT_SSL_VERIFYPEER => false,
    CURLOPT_SSL_VERIFYHOST => false,
]);

// Executar a requisição
$contact_response = curl_exec($curl);
$err = curl_error($curl);
$http_code = curl_getinfo($curl, CURLINFO_HTTP_CODE);

// Log detalhado da resposta
file_put_contents($log_file, date('Y-m-d H:i:s') . " - cURL Info: " . json_encode(curl_getinfo($curl)) . PHP_EOL, FILE_APPEND);
file_put_contents($log_file, date('Y-m-d H:i:s') . " - Status contato: {$http_code}, Resposta: " . $contact_response . PHP_EOL, FILE_APPEND);
if ($err) {
    file_put_contents($log_file, date('Y-m-d H:i:s') . " - Erro cURL (contato): " . $err . PHP_EOL, FILE_APPEND);
}
curl_close($curl);

// Se o contato não foi criado com sucesso
if ($http_code < 200 || $http_code >= 300) {
    http_response_code($http_code);
    echo $contact_response;
    exit;
}

// Decodificar a resposta para obter o ID do contato
$contact_data_response = json_decode($contact_response, true);
$contact_id = isset($contact_data_response['_id']) ? $contact_data_response['_id'] : null;

if (!$contact_id) {
    http_response_code(500);
    $error_response = json_encode([
        "error" => "Contact ID not found in the response",
        "contact_response" => $contact_data_response
    ]);
    echo $error_response;
    file_put_contents($log_file, date('Y-m-d H:i:s') . " - Erro: ID do contato não encontrado" . PHP_EOL, FILE_APPEND);
    exit;
}

// Criar oportunidade (deal) - Simplificado, apenas com os campos essenciais
$rd_deal_url = 'https://crm.rdstation.com/api/v1/deals?token=' . $rd_token; // Token na URL
$deal_data = [
    "deal" => [
        "name" => "Divórcio Express - " . $rd_data['name'],
        "contact_id" => $contact_id,
        "deal_stage_id" => $deal_stage_id
    ]
];

// REMOVIDO os campos personalizados da oportunidade também

// Log dos dados da oportunidade
file_put_contents($log_file, date('Y-m-d H:i:s') . " - Dados SIMPLIFICADOS da oportunidade: " . json_encode($deal_data) . PHP_EOL, FILE_APPEND);

// Inicializar cURL para oportunidade
$deal_curl = curl_init();

// Configurar opções do cURL com headers avançados para simular navegador
curl_setopt_array($deal_curl, [
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
        "Authorization: " . $rd_token, // Sem o prefixo "Token" - exatamente como no Postman
        "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        "Origin: https://divorcioexpress-ibdfam.com.br",
        "Referer: https://divorcioexpress-ibdfam.com.br/",
        "Accept: application/json",
        "Accept-Language: pt-BR,pt;q=0.9,en;q=0.8",
        "X-Requested-With: XMLHttpRequest"
    ],
    CURLOPT_SSL_VERIFYPEER => false,
    CURLOPT_SSL_VERIFYHOST => false,
]);

// Executar a requisição
$deal_response = curl_exec($deal_curl);
$err = curl_error($deal_curl);
$deal_http_code = curl_getinfo($deal_curl, CURLINFO_HTTP_CODE);

// Log detalhado da resposta
file_put_contents($log_file, date('Y-m-d H:i:s') . " - cURL Info (deal): " . json_encode(curl_getinfo($deal_curl)) . PHP_EOL, FILE_APPEND);
file_put_contents($log_file, date('Y-m-d H:i:s') . " - Status oportunidade: {$deal_http_code}, Resposta: " . $deal_response . PHP_EOL, FILE_APPEND);
if ($err) {
    file_put_contents($log_file, date('Y-m-d H:i:s') . " - Erro cURL (oportunidade): " . $err . PHP_EOL, FILE_APPEND);
}
curl_close($deal_curl);

// Retornar resposta completa
http_response_code(200);
$success_response = json_encode([
    "success" => true,
    "dealCreated" => ($deal_http_code >= 200 && $deal_http_code < 300),
    "contact" => $contact_data_response,
    "deal" => json_decode($deal_response, true)
]);
echo $success_response;
file_put_contents($log_file, date('Y-m-d H:i:s') . " - Resposta enviada ao cliente: " . $success_response . PHP_EOL, FILE_APPEND);