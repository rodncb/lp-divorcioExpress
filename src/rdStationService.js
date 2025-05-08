// Token de acesso para o RD Station CRM
// NOTA: Token atualizado - substitua pelo novo token gerado no painel do RD Station CRM
const RD_STATION_CRM_TOKEN = "680fa9aa467da90014931ff1"; // Token atual, enquanto aguardamos resposta do suporte

// ID do estágio "Qualificação" no funil do RD Station
const DEAL_STAGE_ID = "680a2cc17c1a0500143f1d36";

/**
 * Processa e envia dados para o RD Station CRM
 * Em desenvolvimento: simula envio
 * Em produção: usa os endpoints PHP no Hostgator
 *
 * @param {Object} data - Dados do formulário
 * @param {String} formType - Tipo do formulário: 'inicial' ou 'completo'
 * @returns {Promise} - Promise com resultado da operação
 */
export async function processDataToRdStation(data, formType) {
  try {
    // Formatar os dados para o RD Station CRM
    const formattedData = formatDataForCRM(data, formType);

    // Em ambiente de desenvolvimento, simulamos a integração
    if (process.env.NODE_ENV !== "production") {
      console.log(
        `[DEV] Simulando envio para RD Station CRM (${formType}):`,
        formattedData
      );
      await new Promise((resolve) => setTimeout(resolve, 800)); // Simular delay
      return {
        success: true,
        simulated: true,
        result: {
          contact: {
            _id: "dev_contact_" + Math.random().toString(36).substring(7),
            name: data.name,
            email: data.email,
          },
        },
      };
    }

    // Primeiro, salvar em backup local (independente do resultado das outras tentativas)
    try {
      await saveToLocalBackup(formattedData, formType);
      console.log("[Backup] Dados salvos no backup local com sucesso");
    } catch (backupError) {
      console.warn("[Backup] Erro ao salvar no backup local:", backupError);
    }

    // Em produção, enviar para os endpoints PHP no Hostgator
    console.log(
      `[RD Station] Tentando enviar via PHP Endpoints (${formType})...`
    );

    // Log para debug - mostrar qual endpoint PHP será usado
    console.log("[RD Station Debug] Usando token:", RD_STATION_CRM_TOKEN);
    console.log("[RD Station Debug] Usando ID de estágio:", DEAL_STAGE_ID);

    try {
      // Usar os endpoints PHP no servidor Hostgator
      // Usar o caminho completo que inclui a pasta api/rd-station
      const phpEndpoint =
        formType === "completo"
          ? "/api/rd-station/complete.php"
          : "/api/rd-station/contact.php";

      // Log adicional para debug
      console.log("[RD Station Debug] Endpoint PHP:", phpEndpoint);
      console.log("[RD Station Debug] Dados formatados:", formattedData);

      const response = await fetch(phpEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
          Origin: window.location.origin,
          Referer: window.location.href,
          Accept: "application/json",
          "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify({
          data: formattedData,
          token: RD_STATION_CRM_TOKEN,
          form_type: formType,
        }),
        credentials: "include", // Incluir cookies na requisição
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[RD Station] Erro na resposta PHP:", {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
        });

        // Mesmo com erro, retornamos sucesso para o usuário continuar o fluxo
        return {
          success: true,
          partial: true,
          error: `Erro na resposta do RD Station CRM: ${response.status}. ${errorText}`,
          message:
            "Formulário recebido, mas houve um problema na integração com o CRM.",
        };
      }

      const result = await response.json();
      console.log("[RD Station] Resposta via PHP Endpoints:", result);

      return { success: true, result };
    } catch (phpError) {
      console.warn(
        "[RD Station] Falha ao usar PHP Endpoints:",
        phpError.message
      );

      // Mesmo com erro, retornamos sucesso para não bloquear o fluxo do usuário
      return {
        success: true,
        partial: true,
        error: phpError.message,
        message:
          "Formulário recebido, mas houve um problema na integração com o CRM.",
      };
    }
  } catch (error) {
    console.error("Erro ao enviar dados para RD Station CRM:", error.message);
    // Em desenvolvimento ou produção, não queremos que erros na integração bloqueiem a UX
    return {
      success: true,
      partial: true,
      error: error.message,
      message:
        "Formulário recebido, mas houve um problema na integração com o CRM.",
    };
  }
}

/**
 * Salva os dados do lead em um backup local no servidor
 */
async function saveToLocalBackup(formattedData, formType) {
  const backupEndpoint = "/api/rd-station/save_lead_backup.php";

  const response = await fetch(backupEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      data: formattedData,
      form_type: formType,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro ao salvar no backup local: ${errorText}`);
  }

  return await response.json();
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
      possui_acordo: data.hasAgreement || "não informado",
    },
  };

  if (formType === "completo") {
    Object.assign(contactData.custom_fields, {
      data_casamento: data.marriageDate || "",
      local_casamento: data.marriageLocation || "",
      possui_filhos: data.hasChildren || "não",
      quantidade_filhos: data.childrenCount || "0",
      possui_propriedades: data.hasProperties || "não",
      possui_dividas: data.hasDebts || "não",
      outras_rendas: data.otherIncomesDescription || "",
    });
  }

  return contactData;
}

// Função para obter IDs do RD Station CRM
export async function getAndShowRdStationIds() {
  alert(
    "Para obter IDs e configurações, acesse o painel do RD Station CRM diretamente."
  );
  return null;
}
