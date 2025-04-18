import React, { useState } from "react";
import "./MultiStepForm.css";

function MultiStepForm({ initialData, onSubmit }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    ...initialData,
    marriageInfo: {},
    childrenInfo: {},
    propertyDebtInfo: {},
    otherIncomeInfo: {},
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);
  const returnToHome = () => window.location.reload();

  const handleFinalSubmit = (e) => {
    e.preventDefault();
    console.log("Dados completos para enviar:", formData);

    // Envio para o RD Station
    try {
      const convertToRDStationData = () => {
        // Preparar os dados completos no formato que o RD Station espera
        const rdStationData = new FormData();

        // Dados básicos do formulário inicial
        rdStationData.append("name", formData.name || initialData.name || "");
        rdStationData.append(
          "email",
          formData.email || initialData.email || ""
        );
        rdStationData.append(
          "cf_telefone",
          formData.phone || initialData.phone || ""
        );
        rdStationData.append(
          "cf_estado",
          formData.state || initialData.state || ""
        );

        // Dados do formulário detalhado
        rdStationData.append(
          "cf_data_casamento",
          formData.marriageInfo?.date || ""
        );
        rdStationData.append(
          "cf_local_casamento",
          formData.marriageInfo?.location || ""
        );
        rdStationData.append(
          "cf_numero_filhos",
          formData.childrenInfo?.numChildren || ""
        );
        rdStationData.append(
          "cf_filhos_necessidades_especiais",
          formData.childrenInfo?.specialNeeds || ""
        );
        rdStationData.append(
          "cf_possui_propriedades",
          formData.propertyDebtInfo?.hasProperty || ""
        );
        rdStationData.append(
          "cf_possui_dividas",
          formData.propertyDebtInfo?.hasDebt || ""
        );
        rdStationData.append(
          "cf_outras_rendas",
          formData.otherIncomeInfo?.details || ""
        );

        // Campo para identificar que é o formulário completo
        rdStationData.append("cf_formulario_completo", "sim");

        return rdStationData;
      };

      // ID do formulário no RD Station
      const formId = "formsite1-d4934bf9dcfb0061bd30";

      // URL para envio dos dados ao RD Station
      const url = `https://app.rdstation.com.br/api/1.3/conversions`;

      // Envio dos dados usando fetch API
      fetch(url, {
        method: "POST",
        body: convertToRDStationData(),
        mode: "cors",
      })
        .then((response) => {
          if (response.ok) {
            console.log(
              "Dados completos enviados com sucesso para o RD Station!"
            );
          } else {
            console.error(
              "Erro ao enviar dados completos para o RD Station:",
              response.statusText
            );
          }

          // Independente do resultado, mostramos a tela de agradecimento
          setSubmitted(true);
          if (onSubmit) onSubmit(formData);
        })
        .catch((error) => {
          console.error("Falha na comunicação com o RD Station:", error);
          // Mesmo com erro, mostramos a tela de agradecimento
          setSubmitted(true);
          if (onSubmit) onSubmit(formData);
        });
    } catch (error) {
      console.error("Erro ao enviar dados para o RD Station:", error);
      // Em caso de erro, mostramos a tela de agradecimento
      setSubmitted(true);
      if (onSubmit) onSubmit(formData);
    }
  };

  // Se o formulário foi enviado, exibir página de agradecimento
  if (submitted) {
    return (
      <div className="multi-step-container thank-you-container">
        <div className="thank-you-content">
          <h1 className="thank-you-title">Obrigado!</h1>
          <p className="thank-you-message">
            Seus dados foram recebidos com sucesso!
          </p>
          <p className="thank-you-detail">
            Um de nossos advogados especialistas entrará em contato em breve
            para ajudar com o seu processo de divórcio.
          </p>

          <div className="thank-you-actions">
            <button onClick={returnToHome} className="return-button">
              Voltar à página inicial
            </button>
            <a
              href="https://wa.me/5511916801800"
              className="whatsapp-contact-button"
              target="_blank"
              rel="noopener noreferrer"
            >
              Falar agora pelo WhatsApp
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="multi-step-container">
      <div className="progress-header">
        <div className="logo-container">
          <span className="logo-text">Divórcio Express</span>
        </div>
        <div className="multi-step-progress">
          <div
            className={`step-indicator ${step >= 1 ? "completed" : "inactive"}`}
          >
            <span className="step-number">1</span>
            <span className="step-text">Passo 1 - Casamento</span>
          </div>
          <div
            className={`step-indicator ${step >= 2 ? "completed" : "inactive"}`}
          >
            <span className="step-number">2</span>
            <span className="step-text">Passo 2 - Crianças</span>
          </div>
          <div
            className={`step-indicator ${step >= 3 ? "completed" : "inactive"}`}
          >
            <span className="step-number">3</span>
            <span className="step-text">Passo 3 - Propriedade e Dívida</span>
          </div>
          <div
            className={`step-indicator ${step >= 4 ? "completed" : "inactive"}`}
          >
            <span className="step-number">4</span>
            <span className="step-text">Passo 4 - Outras Rendas</span>
          </div>
        </div>
      </div>

      <div className="congratulations-message">
        <h2>Parabéns!</h2>
        <h3>
          Você está qualificado para divórcio em{" "}
          {initialData.state || "seu estado"}
        </h3>
        <p>
          Seu caso de divórcio online está registrado.{" "}
          {initialData.name || "Usuário"}.
        </p>
        <p>
          Seu ID de Caso:{" "}
          {Math.random().toString(36).substring(2, 6).toUpperCase() +
            Math.floor(Math.random() * 10000000000)}
        </p>
        <div className="satisfaction-badge">
          <span className="percentage">100%</span>
          <span className="guarantee">Satisfação Garantida</span>
        </div>
      </div>

      <form onSubmit={handleFinalSubmit} className="form-container">
        {step === 1 && (
          <div>
            <h2>Informações sobre o casamento</h2>
            <div className="form-group">
              <label>Data do casamento:</label>
              <input
                type="date"
                value={formData.marriageInfo.date || ""}
                onChange={(e) =>
                  handleChange("marriageInfo", "date", e.target.value)
                }
              />
            </div>
            <div className="form-group">
              <label>Local do casamento:</label>
              <input
                type="text"
                value={formData.marriageInfo.location || ""}
                onChange={(e) =>
                  handleChange("marriageInfo", "location", e.target.value)
                }
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2>Informações sobre crianças</h2>
            <div className="form-group">
              <label>Quantos filhos menores de 18 anos?</label>
              <input
                type="number"
                value={formData.childrenInfo.numChildren || ""}
                onChange={(e) =>
                  handleChange("childrenInfo", "numChildren", e.target.value)
                }
              />
            </div>
            <div className="form-group">
              <label>Alguma criança tem necessidades especiais?</label>
              <select
                value={formData.childrenInfo.specialNeeds || ""}
                onChange={(e) =>
                  handleChange("childrenInfo", "specialNeeds", e.target.value)
                }
              >
                <option value="">Selecione</option>
                <option value="sim">Sim</option>
                <option value="nao">Não</option>
              </select>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2>Propriedade e Dívida</h2>
            <div className="form-group">
              <label>Possuem propriedades para dividir?</label>
              <select
                value={formData.propertyDebtInfo.hasProperty || ""}
                onChange={(e) =>
                  handleChange(
                    "propertyDebtInfo",
                    "hasProperty",
                    e.target.value
                  )
                }
              >
                <option value="">Selecione</option>
                <option value="sim">Sim</option>
                <option value="nao">Não</option>
              </select>
            </div>
            <div className="form-group">
              <label>Possuem dívidas para dividir?</label>
              <select
                value={formData.propertyDebtInfo.hasDebt || ""}
                onChange={(e) =>
                  handleChange("propertyDebtInfo", "hasDebt", e.target.value)
                }
              >
                <option value="">Selecione</option>
                <option value="sim">Sim</option>
                <option value="nao">Não</option>
              </select>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2>Outras Fontes de Renda</h2>
            <div className="form-group">
              <label>Alguma outra fonte de renda relevante?</label>
              <textarea
                value={formData.otherIncomeInfo.details || ""}
                onChange={(e) =>
                  handleChange("otherIncomeInfo", "details", e.target.value)
                }
              />
            </div>
          </div>
        )}

        <div className="form-buttons">
          {step > 1 && (
            <button
              type="button"
              onClick={prevStep}
              className="form-button back-button"
            >
              Voltar
            </button>
          )}
          {step < 4 && (
            <button
              type="button"
              onClick={nextStep}
              className="form-button next-button"
            >
              Próximo
            </button>
          )}
          {step === 4 && (
            <div className="final-buttons">
              <button
                type="button"
                onClick={prevStep}
                className="form-button back-button"
              >
                Voltar
              </button>
              <button type="submit" className="form-button submit-button">
                Enviar
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}

export default MultiStepForm;
