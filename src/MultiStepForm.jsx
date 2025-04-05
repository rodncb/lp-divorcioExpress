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

  const handleFinalSubmit = (e) => {
    e.preventDefault();
    console.log("Dados completos para enviar:", formData);
    if (onSubmit) onSubmit(formData);
    // Aqui você pode chamar a API do RD Station
  };

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
            className={`step-indicator ${step >= 2 ? "active" : "inactive"}`}
          >
            <span className="step-number">2</span>
            <span className="step-text">Passo 2 - Crianças</span>
          </div>
          <div
            className={`step-indicator ${step >= 3 ? "inactive" : "inactive"}`}
          >
            <span className="step-number">3</span>
            <span className="step-text">Passo 3 - Propriedade e Dívida</span>
          </div>
          <div
            className={`step-indicator ${step >= 4 ? "inactive" : "inactive"}`}
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
            <button type="button" onClick={prevStep} className="form-button">
              Voltar
            </button>
          )}
          {step < 4 && (
            <button type="button" onClick={nextStep} className="form-button">
              Próximo
            </button>
          )}
          {step === 4 && (
            <button type="submit" className="form-button">
              Enviar
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default MultiStepForm;
