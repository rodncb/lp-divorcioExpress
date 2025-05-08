/**
 * Endpoint para integração completa com RD Station CRM (contatos + oportunidades/deals)
 *
 * Este arquivo deve ser hospedado como uma função serverless.
 * Compatível com:
 * - Netlify Functions
 * - Vercel API Routes
 * - Express.js
 */

// Configurações
const RD_STATION_API = {
  CONTACTS: "https://crm.rdstation.com/api/v1/contacts",
  DEALS: "https://crm.rdstation.com/api/v1/deals",
};

// ID do estágio inicial no funil (qualificação)
const DEAL_STAGE_ID = "680a2cc17c1a0500143f1d36";

/**
 * Função serverless do Netlify para integração completa com RD Station CRM
 */
exports.handler = async function (event, context) {
  // Permitir apenas método POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  // Tratar preflight CORS (OPTIONS request)
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
      body: "",
    };
  }

  try {
    // Parsear corpo da requisição
    const requestBody = JSON.parse(event.body);
    const { data, token, form_type } = requestBody;

    if (!data || !token) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ error: "Missing required fields: data, token" }),
      };
    }

    // 1. Criar ou atualizar contato
    console.log(
      `[${form_type}] Enviando dados para RD Station:`,
      JSON.stringify(data)
    );

    const contactResponse = await fetch(RD_STATION_API.CONTACTS, {
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
    const contactResult = await contactResponse.json();

    // Checar se a resposta foi bem-sucedida
    if (!contactResponse.ok) {
      console.error(
        "Erro na resposta do RD Station (contato):",
        contactResponse.status,
        JSON.stringify(contactResult)
      );
      return {
        statusCode: contactResponse.status,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          error: "RD Station API error (contact)",
          details: contactResult,
          status: contactResponse.status,
        }),
      };
    }

    // 2. Criar oportunidade (deal) se o contato foi criado/atualizado com sucesso
    const contactId = contactResult._id || contactResult.id;

    if (!contactId) {
      console.error(
        "Erro: ID do contato não encontrado na resposta do RD Station"
      );
      return {
        statusCode: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          error: "Contact ID missing in RD Station response",
          contact: contactResult,
        }),
      };
    }

    console.log(`Criando oportunidade para contato ID: ${contactId}`);

    // Preparar dados para a oportunidade
    const dealData = {
      deal: {
        name: `Divórcio Express - ${data.name}`,
        contact_id: contactId,
        deal_stage_id: DEAL_STAGE_ID,
        deal_custom_fields: {
          origem_lead: "Landing Page",
          tipo_servico: "Divórcio Express",
        },
      },
    };

    // Enviar requisição para criar oportunidade
    const dealResponse = await fetch(RD_STATION_API.DEALS, {
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
      body: JSON.stringify(dealData),
    });

    // Obter resposta como JSON
    const dealResult = await dealResponse.json();

    // Checar se a resposta foi bem-sucedida
    if (!dealResponse.ok) {
      console.error(
        "Erro na criação da oportunidade:",
        dealResponse.status,
        JSON.stringify(dealResult)
      );
      // Retornamos sucesso parcial, já que o contato foi criado com sucesso
      return {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          success: true,
          partial: true,
          message:
            "Contato criado com sucesso, mas houve um erro na criação da oportunidade",
          contact: contactResult,
          dealError: {
            status: dealResponse.status,
            details: dealResult,
          },
        }),
      };
    }

    // 3. Retornar sucesso completo
    console.log(
      "Integração completa bem-sucedida:",
      JSON.stringify({ contact: contactResult, deal: dealResult })
    );

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        success: true,
        dealCreated: true,
        contact: contactResult,
        deal: dealResult,
      }),
    };
  } catch (error) {
    console.error("Erro no processamento:", error.message);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
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

router.post('/complete', async (req, res) => {
  try {
    const { data, token } = req.body;

    if (!data || !token) {
      return res.status(400).json({ error: 'Missing required fields: data, token' });
    }

    // 1. Criar ou atualizar contato
    const contactResponse = await fetch(RD_STATION_API.CONTACTS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`
      },
      body: JSON.stringify(data)
    });

    const contactResult = await contactResponse.json();

    if (!contactResponse.ok) {
      return res.status(contactResponse.status).json({
        error: 'RD Station API error (contact)',
        details: contactResult
      });
    }

    // 2. Criar oportunidade (deal)
    const contactId = contactResult._id || contactResult.id;
    
    if (!contactId) {
      return res.status(500).json({
        error: 'Contact ID missing in RD Station response',
        contact: contactResult
      });
    }
    
    // Preparar dados para a oportunidade
    const dealData = {
      deal: {
        name: `Divórcio Express - ${data.name}`,
        contact_id: contactId,
        deal_stage_id: DEAL_STAGE_ID,
        deal_custom_fields: {
          origem_lead: "Landing Page",
          tipo_servico: "Divórcio Express"
        }
      }
    };

    // Enviar requisição para criar oportunidade
    const dealResponse = await fetch(RD_STATION_API.DEALS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`
      },
      body: JSON.stringify(dealData)
    });

    const dealResult = await dealResponse.json();

    if (!dealResponse.ok) {
      return res.json({
        success: true,
        partial: true,
        message: 'Contato criado com sucesso, mas houve um erro na criação da oportunidade',
        contact: contactResult,
        dealError: {
          status: dealResponse.status,
          details: dealResult
        }
      });
    }

    // 3. Retornar sucesso
    res.json({
      success: true,
      dealCreated: true,
      contact: contactResult,
      deal: dealResult
    });
  } catch (error) {
    res.status(500).json({ error: `Internal server error: ${error.message}` });
  }
});

module.exports = router;
*/
