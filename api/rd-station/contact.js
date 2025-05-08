/**
 * Endpoint para integração com RD Station CRM (contatos)
 *
 * Este arquivo deve ser hospedado como uma função serverless.
 * Compatível com:
 * - Netlify Functions
 * - Vercel API Routes
 * - Express.js
 */

// Configurações
const RD_STATION_API = "https://crm.rdstation.com/api/v1/contacts";

/**
 * Função serverless do Netlify para integração com RD Station CRM (contatos)
 */
exports.handler = async function (event, context) {
  // Permitir apenas método POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    // Parsear corpo da requisição
    const requestBody = JSON.parse(event.body);
    const { data, token, form_type } = requestBody;

    if (!data || !token) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing required fields: data, token" }),
      };
    }

    // Chamar a API do RD Station
    console.log(
      `[${form_type || "inicial"}] Enviando dados para RD Station:`,
      JSON.stringify(data)
    );

    const response = await fetch(RD_STATION_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        Origin: "https://divorcioexpress-ibdfam.com.br",
        Referer: "https://divorcioexpress-ibdfam.com.br/",
        Accept: "application/json",
        "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
        "X-Requested-With": "XMLHttpRequest",
      },
      body: JSON.stringify(data),
    });

    // Obter resposta como JSON
    const result = await response.json();

    // Checar se a resposta foi bem-sucedida
    if (!response.ok) {
      console.error(
        "Erro na resposta do RD Station:",
        response.status,
        JSON.stringify(result)
      );
      return {
        statusCode: response.status,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*", // Importante para CORS
        },
        body: JSON.stringify({
          error: "RD Station API error",
          details: result,
          status: response.status,
        }),
      };
    }

    // Retornar sucesso
    console.log("Resposta de sucesso do RD Station:", JSON.stringify(result));
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // Importante para CORS
      },
      body: JSON.stringify({
        success: true,
        contact: result,
      }),
    };
  } catch (error) {
    console.error("Erro no processamento:", error.message);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // Importante para CORS
      },
      body: JSON.stringify({
        error: `Internal server error: ${error.message}`,
      }),
    };
  }
};

/**
 * Para Express.js (se preferir usar com Node.js + Express)
 * Descomente o código abaixo e comente o exports.handler acima
 */
/*
const express = require('express');
const router = express.Router();

router.post('/contact', async (req, res) => {
  try {
    const { data, token } = req.body;

    if (!data || !token) {
      return res.status(400).json({ error: 'Missing required fields: data, token' });
    }

    const response = await fetch(RD_STATION_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: 'RD Station API error',
        details: result
      });
    }

    res.json({
      success: true,
      contact: result
    });
  } catch (error) {
    res.status(500).json({ error: `Internal server error: ${error.message}` });
  }
});

module.exports = router;
*/
