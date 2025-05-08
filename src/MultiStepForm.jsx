import { useState, useEffect } from "react";
import "./MultiStepForm.css";
import { processDataToRdStation } from "./rdStationService";

const MultiStepForm = ({ initialData, onSubmit, isSubmitting, error }) => {
  // Estado para controlar a etapa atual do formulário
  const [currentStep, setCurrentStep] = useState(1);
  // Timer para redirecionamento
  const [redirectTimer, setRedirectTimer] = useState(10);

  // Estado para armazenar todos os dados do formulário
  const [formData, setFormData] = useState({
    // Dados iniciais do primeiro formulário
    ...initialData,

    // Passo 1 - Casamento
    marriageDate: "",
    marriageLocation: "",

    // Passo 2 - Crianças
    hasChildren: "nao",
    childrenCount: "",
    childWithSpecialNeeds: "nao",

    // Passo 3 - Propriedade e Dívida
    hasProperties: "nao",
    propertiesDescription: "",
    hasDebts: "nao",
    debtsDescription: "",

    // Passo 4 - Outras Rendas
    otherIncomesDescription: "",

    // Termos e condições
    agreeFinalTerms: false,
  });

  // Estados adicionais
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [generatedId, setGeneratedId] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const [localSubmitError, setLocalSubmitError] = useState(null);

  // Função para lidar com as mudanças nos campos de entrada
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Validação de campos por etapa
  const validateStep = (step) => {
    const errors = {};

    if (step === 1) {
      if (!formData.marriageDate)
        errors.marriageDate = "Data do casamento é obrigatória";
      if (!formData.marriageLocation)
        errors.marriageLocation = "Local do casamento é obrigatório";
    } else if (step === 2) {
      if (formData.hasChildren === "sim" && !formData.childrenCount)
        errors.childrenCount = "Informe a quantidade de filhos";
    } else if (step === 3) {
      // Validação opcional para etapa 3
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Função para avançar para a próxima etapa
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  // Função para retornar à etapa anterior
  const prevStep = () => {
    setCurrentStep(currentStep - 1);
    window.scrollTo(0, 0);
  };

  // Gera um ID de caso aleatório
  const generateCaseId = () => {
    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let result = "";
    for (let i = 0; i < 10; i++) {
      // Ajustado para criar IDs como no exemplo: 9BZF6281617474
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Função para enviar o formulário final
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLocalSubmitError(null);

    if (!formData.agreeFinalTerms && currentStep !== 5) {
      setLocalSubmitError(
        "Você precisa concordar com os termos para prosseguir."
      );
      return;
    }

    // Se estamos na etapa 4, enviar dados e mostrar a confirmação final
    if (currentStep === 4) {
      try {
        // Gerar o ID do caso
        const caseId = generateCaseId();
        setGeneratedId(caseId);

        // Criar um objeto JSON com todos os dados do formulário
        const allFormData = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          state: formData.state || "",
          hasAgreement: formData.hasAgreement,
          marriageDate: formData.marriageDate,
          marriageLocation: formData.marriageLocation,
          hasChildren: formData.hasChildren,
          childrenCount: formData.childrenCount,
          childWithSpecialNeeds: formData.childWithSpecialNeeds,
          hasProperties: formData.hasProperties,
          propertiesDescription: formData.propertiesDescription,
          hasDebts: formData.hasDebts,
          debtsDescription: formData.debtsDescription,
          otherIncomesDescription: formData.otherIncomesDescription,
          generatedId: caseId,
        };

        // Remover a parte de Supabase e enviar diretamente para o RD Station
        console.log("Enviando dados para processamento...");

        // 1. Enviar dados para o RD Station CRM
        try {
          const rdResponse = await processDataToRdStation(
            allFormData,
            "completo"
          );
          console.log(
            "Dados completos enviados com sucesso para o RD Station CRM:",
            rdResponse
          );

          // 2. Mostrar mensagem de sucesso e chamar callback onSubmit
          setSubmitSuccess(true);
          onSubmit(allFormData);

          // Ir para a tela de confirmação
          setCurrentStep(5);
          window.scrollTo(0, 0);
        } catch (rdError) {
          console.error("Erro ao enviar dados:", rdError);
          setLocalSubmitError(
            "Ocorreu um erro ao enviar o formulário. Por favor, tente novamente."
          );
        }
      } catch (error) {
        console.error("Erro ao enviar formulário completo:", error);
        setLocalSubmitError(
          "Ocorreu um erro ao enviar o formulário. Por favor, tente novamente."
        );
      }
      return;
    }
  };

  // Efeito para redirecionamento após tempo determinado quando estiver na tela de confirmação
  useEffect(() => {
    let timer;
    if (currentStep === 5) {
      timer = setInterval(() => {
        setRedirectTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            // Redirecionamento para a home após o timer acabar
            window.location.href = "/";
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [currentStep]);

  // Estado na mensagem de sucesso
  const estadoExibicao = formData.state
    ? ["SP", "RJ", "MG"].includes(formData.state)
      ? formData.state
      : "seu estado"
    : "SP";

  // Renderiza o componente com base na etapa atual
  return (
    <div className="multi-step-form">
      {/* Indicador de progresso - sempre visível */}
      <div className="progress-bar">
        <div className="progress-steps">
          <div className={`step ${currentStep >= 1 ? "active" : ""}`}>1</div>
          <div className="step-line"></div>
          <div className={`step ${currentStep >= 2 ? "active" : ""}`}>2</div>
          <div className="step-line"></div>
          <div className={`step ${currentStep >= 3 ? "active" : ""}`}>3</div>
          <div className="step-line"></div>
          <div className={`step ${currentStep >= 4 ? "active" : ""}`}>4</div>
        </div>
        <div className="progress-title">
          <div className={`step-title ${currentStep >= 1 ? "active" : ""}`}>
            Passo 1 - Casamento
          </div>
          <div className={`step-title ${currentStep >= 2 ? "active" : ""}`}>
            Passo 2 - Crianças
          </div>
          <div className={`step-title ${currentStep >= 3 ? "active" : ""}`}>
            Passo 3 - Propriedade e Dívida
          </div>
          <div className={`step-title ${currentStep >= 4 ? "active" : ""}`}>
            Passo 4 - Outras Rendas
          </div>
        </div>
      </div>

      {/* Tela de confirmação/sucesso */}
      {currentStep === 5 ? (
        <div className="success-message">
          <h2>Parabéns!</h2>
          <h3>Você está qualificado para divórcio em {estadoExibicao}</h3>
          <p>Seu caso de divórcio online está registrado. {formData.name}</p>
          <p>Seu ID de Caso: {generatedId}</p>

          <div className="satisfaction-guarantee">
            <h2>100%</h2>
            <p>Satisfação Garantida</p>
          </div>

          <div className="contact-message">
            <p>
              Nossa equipe entrará em contato com você em breve para os próximos
              passos.
            </p>
            <p>Se preferir, entre em contato imediatamente pelo WhatsApp:</p>

            <a
              href="https://wa.me/5511916801800"
              className="whatsapp-button"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fab fa-whatsapp"></i> Fale com um advogado agora
            </a>
          </div>

          <div className="redirect-timer">
            <p>
              Você será redirecionado para a página inicial em{" "}
              <span>{redirectTimer}</span> segundos...
            </p>
          </div>
        </div>
      ) : (
        <div className="form-container">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (currentStep < 4) {
                nextStep();
              } else {
                handleSubmit(e);
              }
            }}
          >
            {/* Etapa 1: Casamento */}
            {currentStep === 1 && (
              <div className="form-step">
                <h2>Informações sobre o casamento</h2>

                <div className="form-group">
                  <label htmlFor="marriageDate">Data do casamento:</label>
                  <input
                    type="date"
                    id="marriageDate"
                    name="marriageDate"
                    value={formData.marriageDate}
                    onChange={handleChange}
                    className={validationErrors.marriageDate ? "error" : ""}
                  />
                  {validationErrors.marriageDate && (
                    <span className="error-message">
                      {validationErrors.marriageDate}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="marriageLocation">Local do casamento:</label>
                  <input
                    type="text"
                    id="marriageLocation"
                    name="marriageLocation"
                    value={formData.marriageLocation}
                    onChange={handleChange}
                    placeholder="Ex: São Paulo/SP"
                    className={validationErrors.marriageLocation ? "error" : ""}
                  />
                  {validationErrors.marriageLocation && (
                    <span className="error-message">
                      {validationErrors.marriageLocation}
                    </span>
                  )}
                </div>

                <div className="form-navigation">
                  <button type="button" className="next-btn" onClick={nextStep}>
                    Próximo
                  </button>
                </div>
              </div>
            )}

            {/* Etapa 2: Crianças */}
            {currentStep === 2 && (
              <div className="form-step">
                <h2>Informações sobre crianças</h2>

                <div className="form-group">
                  <label htmlFor="childrenCount">
                    Quantos filhos menores de 18 anos?
                  </label>
                  <input
                    type="number"
                    id="childrenCount"
                    name="childrenCount"
                    value={formData.childrenCount}
                    onChange={handleChange}
                    min="0"
                    className={validationErrors.childrenCount ? "error" : ""}
                  />
                  {validationErrors.childrenCount && (
                    <span className="error-message">
                      {validationErrors.childrenCount}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label>Alguma criança tem necessidades especiais?</label>
                  <select
                    name="childWithSpecialNeeds"
                    value={formData.childWithSpecialNeeds}
                    onChange={handleChange}
                  >
                    <option value="nao">Não</option>
                    <option value="sim">Sim</option>
                  </select>
                </div>

                <div className="form-navigation">
                  <button type="button" className="prev-btn" onClick={prevStep}>
                    Voltar
                  </button>
                  <button type="button" className="next-btn" onClick={nextStep}>
                    Próximo
                  </button>
                </div>
              </div>
            )}

            {/* Etapa 3: Propriedade e Dívida */}
            {currentStep === 3 && (
              <div className="form-step">
                <h2>Propriedade e Dívida</h2>

                <div className="form-group">
                  <label>Possuem propriedades para dividir?</label>
                  <select
                    name="hasProperties"
                    value={formData.hasProperties}
                    onChange={handleChange}
                  >
                    <option value="nao">Não</option>
                    <option value="sim">Sim</option>
                  </select>
                </div>

                {formData.hasProperties === "sim" && (
                  <div className="form-group">
                    <label htmlFor="propertiesDescription">
                      Descreva as propriedades:
                    </label>
                    <textarea
                      id="propertiesDescription"
                      name="propertiesDescription"
                      value={formData.propertiesDescription}
                      onChange={handleChange}
                      rows="3"
                    ></textarea>
                  </div>
                )}

                <div className="form-group">
                  <label>Possuem dívidas para dividir?</label>
                  <select
                    name="hasDebts"
                    value={formData.hasDebts}
                    onChange={handleChange}
                  >
                    <option value="nao">Não</option>
                    <option value="sim">Sim</option>
                  </select>
                </div>

                {formData.hasDebts === "sim" && (
                  <div className="form-group">
                    <label htmlFor="debtsDescription">
                      Descreva as dívidas:
                    </label>
                    <textarea
                      id="debtsDescription"
                      name="debtsDescription"
                      value={formData.debtsDescription}
                      onChange={handleChange}
                      rows="3"
                    ></textarea>
                  </div>
                )}

                <div className="form-navigation">
                  <button type="button" className="prev-btn" onClick={prevStep}>
                    Voltar
                  </button>
                  <button type="button" className="next-btn" onClick={nextStep}>
                    Próximo
                  </button>
                </div>
              </div>
            )}

            {/* Etapa 4: Outras Rendas */}
            {currentStep === 4 && (
              <div className="form-step">
                <h2>Outras Fontes de Renda</h2>

                <div className="form-group">
                  <label htmlFor="otherIncomesDescription">
                    Alguma outra fonte de renda relevante?
                  </label>
                  <textarea
                    id="otherIncomesDescription"
                    name="otherIncomesDescription"
                    value={formData.otherIncomesDescription}
                    onChange={handleChange}
                    rows="4"
                  ></textarea>
                </div>

                <div className="form-group terms-checkbox">
                  <label>
                    <input
                      type="checkbox"
                      name="agreeFinalTerms"
                      checked={formData.agreeFinalTerms}
                      onChange={handleChange}
                      required
                    />
                    Declaro que todas as informações fornecidas são verdadeiras
                    e autorizo o contato da equipe Divórcio Express para dar
                    seguimento ao meu processo.
                  </label>
                </div>

                {localSubmitError && (
                  <div className="error-message">{localSubmitError}</div>
                )}
                {error && <div className="error-message">{error}</div>}

                <div className="form-navigation">
                  <button type="button" className="prev-btn" onClick={prevStep}>
                    Voltar
                  </button>
                  <button
                    type="button"
                    className="submit-button"
                    onClick={handleSubmit}
                    disabled={!formData.agreeFinalTerms}
                  >
                    Enviar
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
};

export default MultiStepForm;
