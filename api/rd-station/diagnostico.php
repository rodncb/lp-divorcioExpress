<?php
header("Content-Type: text/html; charset=utf-8");

// Função para executar e mostrar resultados de testes
function runTest($name, $testFn) {
    echo "<div style='margin: 10px 0; padding: 10px; border: 1px solid #ddd;'>";
    echo "<h3>$name</h3>";
    echo "<pre>";
    
    $start = microtime(true);
    $result = $testFn();
    $time = round((microtime(true) - $start) * 1000, 2);
    
    echo "</pre>";
    echo "<p>Tempo de execução: {$time}ms</p>";
    echo "</div>";
}

echo "<!DOCTYPE html>
<html>
<head>
    <title>RD Station CRM - Diagnóstico de Integração</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; color: #333; }
        h1 { color: #0066cc; }
        h2 { color: #444; margin-top: 30px; }
        pre { background: #f5f5f5; padding: 10px; overflow: auto; }
        .success { color: green; }
        .error { color: red; }
    </style>
</head>
<body>
    <h1>Diagnóstico de Integração: RD Station CRM</h1>
    <p>Este script testa a conexão com o RD Station CRM API e identifica possíveis problemas.</p>";

// 1. Teste de configuração do PHP
runTest('Versão do PHP e extensões', function() {
    echo "Versão do PHP: " . phpversion() . "\n";
    echo "Extensão cURL: " . (extension_loaded('curl') ? "Instalada ✅" : "Não instalada ❌") . "\n";
    echo "allow_url_fopen: " . (ini_get('allow_url_fopen') ? "Habilitado ✅" : "Desabilitado ❌") . "\n";
    echo "OpenSSL: " . (extension_loaded('openssl') ? "Instalada ✅" : "Não instalada ❌") . "\n";
    
    return true;
});

// 2. Teste de conexão externa básica
runTest('Conectividade externa básica', function() {
    $urls = [
        'https://www.google.com' => 'Teste geral de internet',
        'https://crm.rdstation.com' => 'Conexão com o RD Station CRM',
        'https://crm.rdstation.com/api/v1' => 'Conexão com a API do RD Station CRM'
    ];
    
    foreach ($urls as $url => $desc) {
        echo "Testando $desc ($url): ";
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_NOBODY, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode >= 200 && $httpCode < 400) {
            echo "<span class='success'>OK ($httpCode)</span>\n";
        } else {
            echo "<span class='error'>Falha ($httpCode)</span>\n";
        }
    }
    
    return true;
});

// 3. Teste da API do RD Station CRM
runTest('Teste da API do RD Station CRM', function() {
    $token = "680fa9aa467da90014931ff1"; // O token atual
    
    // Requisição GET para testar o token (menos intrusiva)
    echo "Testando autenticação com token: ";
    $ch = curl_init('https://crm.rdstation.com/api/v1/deal_stages');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Token ' . $token
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    $response = curl_exec($ch);
    $error = curl_error($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode == 200) {
        echo "<span class='success'>Autenticação bem-sucedida ($httpCode)</span>\n";
    } else {
        echo "<span class='error'>Falha na autenticação ($httpCode)</span>\n";
        echo "Resposta do servidor: " . htmlspecialchars($response) . "\n";
        if ($error) echo "Erro cURL: " . htmlspecialchars($error) . "\n";
    }
    
    // Informações detalhadas sobre o servidor e PHP
    echo "\nOutras informações do servidor:\n";
    echo "IP do servidor: " . $_SERVER['SERVER_ADDR'] ?? 'Não disponível' . "\n";
    echo "Hostname: " . gethostname() . "\n";
    echo "Software do servidor: " . $_SERVER['SERVER_SOFTWARE'] . "\n";
    echo "User Agent PHP: " . ini_get('user_agent') . "\n";
    
    return true;
});

// 4. Teste de proxy e configurações de rede
runTest('Configurações de rede e proxy', function() {
    // Verificar configurações de proxy
    $proxy_settings = [
        'HTTP_PROXY' => getenv('HTTP_PROXY'),
        'HTTPS_PROXY' => getenv('HTTPS_PROXY'),
        'NO_PROXY' => getenv('NO_PROXY'),
        'http.proxy no PHP' => ini_get('http.proxy'),
        'Proxy no curl' => function_exists('curl_version') ? (curl_version()['features'] & CURL_VERSION_LIBZ ? 'Suportado' : 'Não suportado') : 'cURL não disponível'
    ];
    
    echo "Configurações de proxy:\n";
    foreach ($proxy_settings as $key => $value) {
        echo "$key: " . ($value ?: 'Não definido') . "\n";
    }
    
    // Verificar se consegue resolver o nome DNS
    echo "\nResolução DNS para crm.rdstation.com: ";
    $ip = gethostbyname('crm.rdstation.com');
    if ($ip != 'crm.rdstation.com') {
        echo "<span class='success'>OK - Resolvido para $ip</span>\n";
    } else {
        echo "<span class='error'>Falha na resolução DNS</span>\n";
    }
    
    return true;
});

// 5. Teste com dados reais (criação simulada)
runTest('Simulação de criação de contato (sem salvar)', function() {
    $token = "680fa9aa467da90014931ff1";
    $testData = [
        "contact" => [
            "name" => "Teste Diagnóstico " . date('YmdHis'),
            "email" => "teste_" . time() . "@diagnostico.com",
            "phones" => ["11999991234"],
            "custom_fields" => [
                "estado_uf" => "SP",
                "tipo_formulario" => "diagnostico"
            ]
        ]
    ];
    
    // Usando file_get_contents
    echo "Teste com file_get_contents:\n";
    
    $options = [
        'http' => [
            'method' => 'POST',
            'header' => [
                'Content-Type: application/json',
                'Authorization: Token ' . $token,
                'User-Agent: DiagnosticoAPI/1.0'
            ],
            'content' => json_encode($testData),
            'ignore_errors' => true,
            'timeout' => 30
        ],
        'ssl' => [
            'verify_peer' => false,
            'verify_peer_name' => false
        ]
    ];
    
    try {
        $context = stream_context_create($options);
        $response = file_get_contents('https://crm.rdstation.com/api/v1/contacts', false, $context);
        
        $status_line = $http_response_header[0];
        preg_match('{HTTP\/\S*\s(\d{3})}', $status_line, $match);
        $http_code = $match[1];
        
        echo "Código de resposta: $http_code\n";
        echo "Headers completos:\n";
        foreach ($http_response_header as $header) {
            echo "$header\n";
        }
        echo "Corpo da resposta:\n$response\n\n";
    } catch (Exception $e) {
        echo "Exceção: " . $e->getMessage() . "\n";
    }
    
    // Usando cURL
    echo "Teste com cURL:\n";
    
    $ch = curl_init('https://crm.rdstation.com/api/v1/contacts');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POSTFIELDS => json_encode($testData),
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'Authorization: Token ' . $token
        ],
        CURLOPT_VERBOSE => true,
        CURLOPT_HEADER => true,
        CURLOPT_SSL_VERIFYPEER => false
    ]);
    
    $output = curl_exec($ch);
    $error = curl_error($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
    $headers = substr($output, 0, $headerSize);
    $body = substr($output, $headerSize);
    curl_close($ch);
    
    echo "Código de resposta: $httpCode\n";
    if ($error) echo "Erro cURL: $error\n";
    echo "Headers:\n$headers\n";
    echo "Corpo da resposta:\n$body\n";
    
    return true;
});

// Instruções para resolução
echo "<h2>Como resolver problemas de integração</h2>
<ol>
    <li>Se todos os testes passaram, mas ainda há erro 401: Entre em contato com o suporte do RD Station para verificar permissões específicas do token.</li>
    <li>Se houver falha de conectividade: Verifique as configurações de firewall do servidor Hostgator.</li>
    <li>Se houver erros SSL: Atualize os certificados SSL do servidor ou ajuste as configurações de SSL.</li>
    <li>Se você não conseguir resolver: Use o sistema de backup implementado e faça upload manual dos leads para o RD Station CRM.</li>
</ol>
<p>Para exportar os leads salvos em backup, acesse: <a href='visualizar_leads.php'>Visualizar e Exportar Leads</a></p>";

echo "</body></html>";
?>