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
$log_file = __DIR__ . '/contact_log.txt';
file_put_contents($log_file, date('Y-m-d H:i:s') . " - Requisição recebida: " . $request_body . PHP_EOL, FILE_APPEND);

// Validar dados recebidos
if (!isset($request_data['data']) || !isset($request_data['token'])) {
    http_response_code(400);
    echo json_encode(["error" => "Missing required fields: data, token"]);
    file_put_contents($log_file, date('Y-m-d H:i:s') . " - Erro: Campos obrigatórios ausentes" . PHP_EOL, FILE_APPEND);
    exit;
}

// Token do RD Station
$rd_token = $request_data['token']; // Usar o token enviado pelo frontend
$rd_data = $request_data['data'];

// Preparar a requisição para o RD Station (Contato)
$rd_contact_url = 'https://crm.rdstation.com/api/v1/contacts?token=' . $rd_token; // Token na URL conforme solicitado

// Estrutura básica do contato
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

// Adicionar campos personalizados com os IDs corretos do RD Station
$contact_custom_fields = [];

// Mapeamento dos campos do frontend para os IDs do RD Station
$custom_fields_mapping = [
    // Campo Estado/UF - NOVO ID
    "estado_uf" => "681ce76ac428a60014d1a84a",
    
    // Tipo de formulário
    "tipo_formulario" => "681ce35510c80700144de32a",
    
    // Campo "Você e seu cônjuge concordam com a divisão de bens..." - NOVO ID 
    "possui_acordo" => "681ce8171ff95d0026098d1f"
];

// Adicionar os campos personalizados que existem no request
if (isset($rd_data['custom_fields']) && !empty($rd_data['custom_fields'])) {
    foreach ($rd_data['custom_fields'] as $field_name => $field_value) {
        if (isset($custom_fields_mapping[$field_name])) {
            // Formatar os valores corretamente para campos do tipo lista
            $value = $field_value;
            
            // Estado/UF - converter para maiúsculas
            if ($field_name === "estado_uf") {
                $value = strtoupper($field_value); // Ex: "GO" para "GO"
            }
            
            // Converter valores sim/não para SIM/NÃO
            if (in_array($field_name, ["possui_acordo"])) {
                if (strtolower($field_value) === "sim") {
                    $value = "SIM";
                } elseif (strtolower($field_value) === "nao") {
                    $value = "NÃO";
                }
            }
            
            $contact_custom_fields[] = [
                "custom_field_id" => $custom_fields_mapping[$field_name],
                "value" => $value
            ];
        }
    }
}

// Adicionar os campos personalizados ao contato se houver algum
if (!empty($contact_custom_fields)) {
    $contact_data['contact']['contact_custom_fields'] = $contact_custom_fields;
}

// Log dos dados sendo enviados
file_put_contents($log_file, date('Y-m-d H:i:s') . " - Token: " . $rd_token . " - Dados recebidos do frontend: " . json_encode($rd_data) . PHP_EOL, FILE_APPEND);
file_put_contents($log_file, date('Y-m-d H:i:s') . " - Dados formatados para API: " . json_encode($contact_data) . PHP_EOL, FILE_APPEND);

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
    CURLOPT_COOKIEFILE => "", // Inicializar o gerenciamento de cookies
    CURLOPT_COOKIEJAR => "",  // Armazenar cookies recebidos
    CURLOPT_FOLLOWLOCATION => true, // Seguir redirecionamentos
    CURLOPT_SSL_VERIFYPEER => false, // Desativar verificação SSL para debug
    CURLOPT_SSL_VERIFYHOST => false,
]);

// Executar a requisição
$response = curl_exec($curl);
$err = curl_error($curl);
$http_code = curl_getinfo($curl, CURLINFO_HTTP_CODE);

// Log detalhado da resposta
file_put_contents($log_file, date('Y-m-d H:i:s') . " - cURL Info: " . json_encode(curl_getinfo($curl)) . PHP_EOL, FILE_APPEND);
file_put_contents($log_file, date('Y-m-d H:i:s') . " - Status: {$http_code}, Resposta: " . $response . PHP_EOL, FILE_APPEND);
if ($err) {
    file_put_contents($log_file, date('Y-m-d H:i:s') . " - Erro cURL: " . $err . PHP_EOL, FILE_APPEND);
}
curl_close($curl);

// Verificar a resposta do RD Station
if ($http_code == 409 && strpos($response, 'humans_') !== false) {
    // Detectado cloudflare ou outro anti-bot protection
    file_put_contents($log_file, date('Y-m-d H:i:s') . " - Proteção anti-bot detectada. Tentando contornar..." . PHP_EOL, FILE_APPEND);
    
    // Extrair o cookie do script
    preg_match('/document\.cookie\s*=\s*"([^"]+)"/', $response, $matches);
    if (!empty($matches[1])) {
        $cookie = $matches[1];
        file_put_contents($log_file, date('Y-m-d H:i:s') . " - Cookie de proteção encontrado: " . $cookie . PHP_EOL, FILE_APPEND);
        
        // Tentar nova requisição com o cookie
        $curl = curl_init();
        curl_setopt_array($curl, [
            CURLOPT_URL => $rd_contact_url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => "",
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => "POST",
            CURLOPT_POSTFIELDS => json_encode($contact_data),
            CURLOPT_HTTPHEADER => [
                "Content-Type: application/json",
                "Authorization: " . $rd_token,
                "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
                "Origin: https://divorcioexpress-ibdfam.com.br",
                "Referer: https://divorcioexpress-ibdfam.com.br/",
                "Accept: application/json",
                "Accept-Language: pt-BR,pt;q=0.9,en;q=0.8",
                "X-Requested-With: XMLHttpRequest",
                "Cookie: " . $cookie
            ],
            CURLOPT_COOKIEFILE => "", 
            CURLOPT_COOKIEJAR => "",  
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => false,
        ]);
        
        $response = curl_exec($curl);
        $err = curl_error($curl);
        $http_code = curl_getinfo($curl, CURLINFO_HTTP_CODE);
        curl_close($curl);
        
        file_put_contents($log_file, date('Y-m-d H:i:s') . " - Segunda tentativa: Status: {$http_code}, Resposta: " . $response . PHP_EOL, FILE_APPEND);
    }
}

// Se a resposta ainda não for bem-sucedida, retornar o resultado tal como está
if ($http_code < 200 || $http_code >= 300) {
    http_response_code($http_code);
    echo $response;
    file_put_contents($log_file, date('Y-m-d H:i:s') . " - Retornando erro HTTP {$http_code}" . PHP_EOL, FILE_APPEND);
    exit;
}

// Decodificar a resposta para verificar o ID do contato
try {
    $contact_data_response = json_decode($response, true);
    $success_response = json_encode([
        "success" => true,
        "contact" => $contact_data_response,
    ]);
    http_response_code(200);
    echo $success_response;
    file_put_contents($log_file, date('Y-m-d H:i:s') . " - Contato criado com sucesso!" . PHP_EOL, FILE_APPEND);
} catch (Exception $e) {
    // Erro ao decodificar JSON, retornar a resposta como está
    http_response_code($http_code);
    echo $response;
    file_put_contents($log_file, date('Y-m-d H:i:s') . " - Erro ao decodificar resposta JSON: " . $e->getMessage() . PHP_EOL, FILE_APPEND);
}