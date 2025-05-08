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

// Log para debug
$log_file = __DIR__ . '/backup_leads_log.txt';
file_put_contents($log_file, date('Y-m-d H:i:s') . " - Requisição recebida: " . $request_body . PHP_EOL, FILE_APPEND);

// Validar dados recebidos
if (!isset($request_data['data'])) {
    http_response_code(400);
    echo json_encode(["error" => "Missing required field: data"]);
    file_put_contents($log_file, date('Y-m-d H:i:s') . " - Erro: Dados ausentes" . PHP_EOL, FILE_APPEND);
    exit;
}

// Extrair dados do lead
$lead_data = $request_data['data'];
$form_type = isset($request_data['form_type']) ? $request_data['form_type'] : 'unknown';

// Criar uma estrutura de dados para salvar
$lead_record = [
    'timestamp' => date('Y-m-d H:i:s'),
    'ip' => $_SERVER['REMOTE_ADDR'],
    'form_type' => $form_type,
    'data' => $lead_data
];

// Salvar em um arquivo CSV para fácil importação posterior
$backup_file = __DIR__ . '/backup_leads.csv';

// Se o arquivo não existe, criar com cabeçalhos
if (!file_exists($backup_file)) {
    $headers = ["Timestamp", "IP", "FormType", "Name", "Email", "Phone", "State", "RawData"];
    file_put_contents($backup_file, implode(",", $headers) . PHP_EOL);
}

// Preparar uma linha para o CSV
$csv_line = [
    date('Y-m-d H:i:s'),
    $_SERVER['REMOTE_ADDR'],
    $form_type,
    isset($lead_data['name']) ? str_replace(',', ' ', $lead_data['name']) : '',
    isset($lead_data['email']) ? $lead_data['email'] : '',
    isset($lead_data['phone']) ? $lead_data['phone'] : (isset($lead_data['phones']) && is_array($lead_data['phones']) ? $lead_data['phones'][0] : ''),
    isset($lead_data['state']) ? $lead_data['state'] : (isset($lead_data['custom_fields']['estado_uf']) ? $lead_data['custom_fields']['estado_uf'] : ''),
    '"' . str_replace('"', '""', json_encode($lead_data)) . '"' // Preservar os dados brutos para referência
];

// Adicionar ao arquivo CSV
file_put_contents($backup_file, implode(",", $csv_line) . PHP_EOL, FILE_APPEND);

// Também salvar em um arquivo JSON para processamento programático mais fácil
$backup_json = __DIR__ . '/backup_leads.json';
$existing_data = [];
if (file_exists($backup_json)) {
    $json_content = file_get_contents($backup_json);
    if (!empty($json_content)) {
        $existing_data = json_decode($json_content, true);
        // Se o decode falhar, iniciar um novo array
        if ($existing_data === null) {
            $existing_data = [];
        }
    }
}

// Adicionar o novo registro
$existing_data[] = $lead_record;
file_put_contents($backup_json, json_encode($existing_data, JSON_PRETTY_PRINT));

// Log de sucesso
file_put_contents($log_file, date('Y-m-d H:i:s') . " - Lead salvo com sucesso nos arquivos de backup" . PHP_EOL, FILE_APPEND);

// Retornar sucesso
http_response_code(200);
echo json_encode([
    "success" => true,
    "message" => "Lead salvo com sucesso no backup local",
    "timestamp" => date('Y-m-d H:i:s')
]);