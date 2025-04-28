import { supabase } from "./supabaseClient";

// Token de acesso para o RD Station CRM 
const RD_STATION_CRM_TOKEN = "680fa9aa467da90014931ff1";
const RD_STATION_CRM_API_URL = "https://crm.rdstation.com/api/v1";

/**
 * Processa e envia dados para o RD Station CRM
 * @param {Object} data - Dados do formulário
 * @param {String} formType - Tipo do formulário: 'inicial' ou 'completo'
 * @returns {Promise} - Promise com resultado da operação
 */
export async function processDataToRdStation(data, formType) {
  try {
    // Em ambiente de desenvolvimento, simulamos a integração para evitar erros de CORS
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEV] Simulando envio para RD Station CRM (${formType}):`, formatDataForCRM(data, formType));
      // Simulamos um delay para parecer uma chamada real
      await new Promise(resolve => setTimeout(resolve, 800));
      return { success: true, simulated: true };
    }
    
    // Em produção, fazemos a chamada real via proxy (que deve ser configurado no servidor)
    const crmData = formatDataForCRM(data, formType);
    
    // Importante: Este endpoint deve ser configurado no servidor como um proxy
    // para https://crm.rdstation.com/api/v1/contacts
    const response = await fetch('/api/rd-station/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // O token será adicionado pelo proxy no servidor
      },
      body: JSON.stringify(crmData)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro na resposta do RD Station CRM: ${response.status}. ${errorText}`);
    }
    
    const result = await response.json();
    console.log("Contato criado/atualizado no RD Station CRM:", result);
    
    // Se for formulário completo, criar deal (oportunidade)
    if (formType === 'completo' && result._id) {
      await createDealInCRM(result._id, data);
    }
    
    return { success: true, result };
  } catch (error) {
    console.error("Erro ao enviar dados para RD Station CRM:", error.message);
    if (process.env.NODE_ENV !== 'production') {
      return { 
        success: false, 
        error: error.message,
        message: "Erro na integração com RD Station CRM, mas o formulário foi processado."
      };
    }
    throw error;
  }
}

/**
 * Formata os dados no formato que o RD Station CRM espera
 */
function formatDataForCRM(data, formType) {
  const contactData = {
    name: data.name,
    email: data.email,
    phones: [data.phone],
    custom_fields: {
      estado_uf: data.state || "",
      tipo_formulario: formType,
      possui_acordo: data.hasAgreement || "não informado"
    }
  };
  
  if (formType === 'completo') {
    Object.assign(contactData.custom_fields, {
      data_casamento: data.marriageDate || "",
      local_casamento: data.marriageLocation || "",
      possui_filhos: data.hasChildren || "não",
      quantidade_filhos: data.childrenCount || "0",
      possui_propriedades: data.hasProperties || "não",
      possui_dividas: data.hasDebts || "não",
      outras_rendas: data.otherIncomesDescription || ""
    });
  }
  
  return contactData;
}

/**
 * Cria uma oportunidade (deal) no RD Station CRM
 */
async function createDealInCRM(contactId, data) {
  try {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEV] Simulando criação de oportunidade para contato ${contactId}`);
      return { success: true, simulated: true };
    }
    
    const dealData = {
      deal: {
        name: `Divórcio Express - ${data.name}`,
        contact_id: contactId,
        // Substitua pelos IDs reais do seu funil e estágios no RD Station CRM
        deal_stage_id: "64c12b8ba40123000c759423", // Este é um ID de exemplo
        deal_custom_fields: {
          origem_lead: "Landing Page",
          tipo_servico: "Divórcio Express"
        }
      }
    };
    
    // Endpoint de proxy para deals
    const response = await fetch('/api/rd-station/deals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dealData)
    });
    
    if (!response.ok) {
      throw new Error(`Erro ao criar oportunidade: ${response.status}`);
    }
    
    const result = await response.json();
    console.log("Oportunidade criada com sucesso:", result);
    return result;
  } catch (error) {
    console.error("Erro ao criar oportunidade:", error.message);
    return { error: error.message };
  }
}

/**
 * INSTRUÇÕES PARA CONFIGURAÇÃO DO PROXY EM PRODUÇÃO:
 * 
 * Para que a integração funcione em produção, você precisa configurar um proxy
 * no seu servidor web para encaminhar as requisições para o RD Station CRM.
 * 
 * Opção 1: Configurar um proxy no seu servidor web (Nginx/Apache):
 * 
 * # Exemplo para Nginx:
 * location /api/rd-station/ {
 *   proxy_pass https://crm.rdstation.com/api/v1/;
 *   proxy_set_header Authorization "Token 680fa9aa467da90014931ff1";
 *   proxy_set_header Content-Type "application/json";
 * }
 * 
 * Opção 2: Criar uma função serverless (ex: Supabase Edge Function, Netlify Function)
 * que recebe a requisição do frontend e encaminha para o RD Station CRM.
 * 
 * Opção 3: Implementar um servidor backend dedicado (Node.js, PHP, etc.)
 * que serve como intermediário entre o frontend e o RD Station CRM.
 */

// Função desativada pois requer acesso direto ao CRM
export async function getAndShowRdStationIds() {
  console.log("Esta função requer implementação via proxy/backend.");
  alert("Para obter IDs e configurações, acesse o painel do RD Station CRM diretamente.");
  return null;
}
