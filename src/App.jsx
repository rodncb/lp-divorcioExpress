import "./App.css";
import { useState } from "react";
import MultiStepForm from "./MultiStepForm";

function App() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    phone: "",
    state: "",
    hasChildren: "",
    agreeTerms: false,
  });

  const [activeQuestion, setActiveQuestion] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showMultiStepForm, setShowMultiStepForm] = useState(false);
  const [showTermsPopup, setShowTermsPopup] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormState({
      ...formState,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Formulário enviado:", formState);
    // Ativar o MultiStepForm
    setShowMultiStepForm(true);
  };

  const handleFinalSubmit = (allData) => {
    console.log("Enviar todos os dados para processamento:", allData);
    // Aqui você pode enviar os dados combinados para o backend ou API
  };

  const toggleQuestion = (index) => {
    setActiveQuestion(activeQuestion === index ? null : index);
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const toggleTermsPopup = () => {
    setShowTermsPopup(!showTermsPopup);
  };

  return (
    <div className="App">
      {showMultiStepForm ? (
        <section className="multi-step-section">
          <div className="container">
            <MultiStepForm
              initialData={formState}
              onSubmit={handleFinalSubmit}
            />
          </div>
        </section>
      ) : (
        <>
          {menuOpen && (
            <div className="menu-overlay" onClick={toggleMenu}></div>
          )}
          {/* Cabeçalho */}
          <header className="header">
            <div className="container">
              <div className="header-content">
                <div className="logo">
                  <img
                    src="/lp-divorcioExpress/images/logo-novo.png"
                    alt="Divórcio Express"
                    className="logo-image"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://rodncb.github.io/lp-divorcioExpress/images/logo-novo.png";
                    }}
                  />
                </div>
                <button
                  className={`menu-toggle ${menuOpen ? "active" : ""}`}
                  onClick={toggleMenu}
                  aria-label="Menu"
                >
                  <span className="hamburger"></span>
                </button>
                <nav className={`main-nav ${menuOpen ? "open" : ""}`}>
                  <a href="#como-funciona" onClick={() => setMenuOpen(false)}>
                    Como Funciona
                  </a>
                  <a href="#servico" onClick={() => setMenuOpen(false)}>
                    Processo Simplificado
                  </a>
                  <a href="#avaliacoes" onClick={() => setMenuOpen(false)}>
                    Avaliações
                  </a>
                  <a href="#faq" onClick={() => setMenuOpen(false)}>
                    Perguntas Frequentes
                  </a>
                  <a href="#contato" onClick={() => setMenuOpen(false)}>
                    Contato
                  </a>
                  <a href="/blog" onClick={() => setMenuOpen(false)}>
                    Blog
                  </a>
                </nav>
              </div>
            </div>
          </header>

          {/* Seção Hero com Formulário */}
          <section className="hero">
            <div className="container">
              <div className="hero-content">
                <div className="hero-text">
                  <h1 className="hero-title">
                    Comece o seu
                    <br />
                    Divórcio Online
                  </h1>
                  <p className="hero-subtitle">
                    Especialistas em Direito de Família
                  </p>
                  <p className="hero-highlight">Sem honorários advocatícios</p>
                  <p className="hero-description">
                    Um processo de divórcio rápido, acessível e simples usando
                    nosso questionário guiado e serviço de registro completo.
                  </p>
                  <div className="hero-cta">
                    <a href="#eligibility" className="cta-button">
                      Veja se você se qualifica
                    </a>
                  </div>

                  {/* Formulário de Elegibilidade */}
                  <div id="eligibility" className="hero-form">
                    <div className="form-container">
                      <h3>Comece Seu Divórcio Online</h3>
                      <form className="form" onSubmit={handleSubmit}>
                        <div className="eligibility-question">
                          <p>
                            Você e seu cônjuge concordam com a divisão de bens,
                            ativos e todas as questões relacionadas aos filhos?
                          </p>
                          <div className="radio-group">
                            <label>
                              <input
                                type="radio"
                                name="hasAgreement"
                                value="yes"
                                onChange={handleInputChange}
                              />{" "}
                              Sim
                            </label>
                            <label>
                              <input
                                type="radio"
                                name="hasAgreement"
                                value="no"
                                onChange={handleInputChange}
                              />{" "}
                              Não
                            </label>
                          </div>
                        </div>

                        <div className="form-group">
                          <label htmlFor="state">Selecione seu Estado</label>
                          <select
                            id="state"
                            name="state"
                            value={formState.state}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="">Selecione...</option>
                            <option value="SP">São Paulo</option>
                            <option value="AC">Acre</option>
                            <option value="AL">Alagoas</option>
                            <option value="AP">Amapá</option>
                            <option value="AM">Amazonas</option>
                            <option value="BA">Bahia</option>
                            <option value="CE">Ceará</option>
                            <option value="DF">Distrito Federal</option>
                            <option value="ES">Espírito Santo</option>
                            <option value="GO">Goiás</option>
                            <option value="MA">Maranhão</option>
                            <option value="MT">Mato Grosso</option>
                            <option value="MS">Mato Grosso do Sul</option>
                            <option value="MG">Minas Gerais</option>
                            <option value="PA">Pará</option>
                            <option value="PB">Paraíba</option>
                            <option value="PR">Paraná</option>
                            <option value="PE">Pernambuco</option>
                            <option value="PI">Piauí</option>
                            <option value="RJ">Rio de Janeiro</option>
                            <option value="RN">Rio Grande do Norte</option>
                            <option value="RS">Rio Grande do Sul</option>
                            <option value="RO">Rondônia</option>
                            <option value="RR">Roraima</option>
                            <option value="SC">Santa Catarina</option>
                            <option value="SE">Sergipe</option>
                            <option value="TO">Tocantins</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label htmlFor="name">Nome Completo</label>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            value={formState.name}
                            onChange={handleInputChange}
                            required
                            minLength="3"
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="email">E-mail</label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formState.email}
                            onChange={handleInputChange}
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="phone">Telefone</label>
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formState.phone}
                            onChange={handleInputChange}
                            required
                            pattern="(\d{2})?\d{8,9}|\d{10,11}"
                            title="Digite apenas números - DDD + número"
                          />
                        </div>

                        {/* Checkbox dos termos de serviço */}
                        <div className="form-group checkbox-group">
                          <label>
                            <input
                              type="checkbox"
                              name="agreeTerms"
                              checked={formState.agreeTerms}
                              onChange={handleInputChange}
                              required
                            />
                            <span>
                              Ao clicar em "Verificar Elegibilidade", você
                              concorda com os{" "}
                              <button
                                type="button"
                                className="terms-link"
                                onClick={toggleTermsPopup}
                              >
                                <i className="terms-icon">ℹ</i> Termos de
                                Serviço
                              </button>
                            </span>
                          </label>
                        </div>

                        <button type="submit" className="submit-btn">
                          Verificar Elegibilidade
                        </button>

                        <p className="form-note">
                          Nós cuidamos de todo o processo no cartório ou
                          judicial.
                        </p>
                      </form>
                    </div>
                  </div>
                </div>
                <div className="hero-image">
                  <picture>
                    <source
                      media="(max-width: 768px)"
                      srcSet={
                        process.env.NODE_ENV === "production"
                          ? "/lp-divorcioExpress/images/MainBannerNew.jpeg"
                          : "./images/MainBannerNew.jpeg"
                      }
                    />
                    <img
                      src={
                        process.env.NODE_ENV === "production"
                          ? "/lp-divorcioExpress/images/MainBannerNew.jpeg"
                          : "./images/MainBannerNew.jpeg"
                      }
                      alt="Processo de divórcio simplificado"
                    />
                  </picture>
                </div>
              </div>
            </div>
          </section>

          {/* Seção Como Funciona */}
          <section id="como-funciona" className="steps-section">
            <div className="container">
              <h2>Nosso processo simples de 4 etapas</h2>
              <div className="steps-container">
                <div className="step">
                  <div className="step-number">1</div>
                  <h3>Verifique se você se qualifica</h3>
                  <p>
                    Descubra se você e suas circunstâncias são elegíveis para
                    nosso processo de divórcio simplificado.
                  </p>
                </div>
                <div className="step">
                  <div className="step-number">2</div>
                  <h3>Complete o questionário</h3>
                  <p>
                    Nosso questionário guia você pelo preenchimento da
                    documentação do divórcio.
                  </p>
                </div>
                <div className="step">
                  <div className="step-number">3</div>
                  <h3>Revise seus formulários</h3>
                  <p>
                    Revise seus formulários e envie, uma equipe de advogados
                    especializados receberá seus dados e entrará em contato.
                  </p>
                </div>
                <div className="step">
                  <div className="step-number">4</div>
                  <h3>Solicite o divórcio</h3>
                  <p>
                    Dê o passo final em direção ao seu novo começo com
                    instruções jurídicas detalhadas e de acordo com seu caso.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Seção de Avaliações */}
          <section id="avaliacoes" className="testimonials-section">
            <div className="container">
              <h2>Mais de 10.000 pessoas já usaram o Divórcio Express</h2>
              <p className="section-subtitle">
                Por mais de 5 anos, capacitamos indivíduos a obter divórcios
                rápidos e sem estresse, economizando dinheiro no processo.
              </p>

              <div className="testimonials-container">
                <div className="testimonial">
                  <div className="stars">★★★★★</div>
                  <p className="testimonial-text">
                    "Comecei meu divórcio sozinho, gastando muito dinheiro com
                    advogados no início. Então decidi pesquisar outras maneiras
                    e usar este site foi muito mais simples!"
                  </p>
                  <div className="testimonial-author">
                    <div className="author-info">
                      <h4>Carlos M.</h4>
                      <p>São Paulo</p>
                    </div>
                  </div>
                </div>

                <div className="testimonial">
                  <div className="stars">★★★★★</div>
                  <p className="testimonial-text">
                    "Eu tinha um negócio muito bem-sucedido na época. Então,
                    garantir que eu tivesse os formulários corretos era muito
                    importante durante meu divórcio. Fiquei surpreso com a
                    facilidade e suavidade deste processo."
                  </p>
                  <div className="testimonial-author">
                    <div className="author-info">
                      <h4>Juliana V.</h4>
                      <p>Rio de Janeiro</p>
                    </div>
                  </div>
                </div>

                <div className="testimonial">
                  <div className="stars">★★★★★</div>
                  <p className="testimonial-text">
                    "Depois de anos de um casamento tumultuado, finalmente
                    decidi que precisava recuperar minha vida. Encontrei este
                    site e eles simplificaram e facilitaram o processo de
                    divórcio para mim."
                  </p>
                  <div className="testimonial-author">
                    <div className="author-info">
                      <h4>Fernanda J.</h4>
                      <p>Minas Gerais</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Seção de Serviço */}
          <section id="servico" className="pricing-section">
            <div className="container">
              <div className="pricing-comparison single-card">
                <div className="pricing-card featured">
                  <div className="pricing-header">
                    <h3>Divórcio Express</h3>
                    <div className="pricing-price">
                      <h3>Consulte valores</h3>
                      <p>Processo simplificado</p>
                    </div>
                  </div>
                  <div className="pricing-body">
                    <p className="pricing-description">
                      Um método fácil e rápido para preparar o divórcio não
                      contestado online e obter documentos de divórcio de alta
                      qualidade
                    </p>
                    <ul className="pricing-features">
                      <li>
                        Pacote completo de documentos de divórcio com custo
                        acessível
                      </li>
                      <li>
                        Preparação rápida de todos os formulários judiciais
                      </li>
                      <li>
                        Instruções detalhadas explicando como iniciar um
                        divórcio
                      </li>
                      <li>
                        Conveniente para usar em qualquer dispositivo a qualquer
                        momento
                      </li>
                      <li>
                        Suporte responsivo por e-mail, chat e telefone e
                        reuniões presenciais
                      </li>
                    </ul>
                    <a href="#eligibility" className="pricing-cta">
                      Começar Agora
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Seção FAQ */}
          <section id="faq" className="faq-section">
            <div className="container">
              <h2>Perguntas Frequentes</h2>

              <div className="faq-container">
                <div className="faq-item">
                  <div
                    className={`faq-question ${
                      activeQuestion === 0 ? "active" : ""
                    }`}
                    onClick={() => toggleQuestion(0)}
                  >
                    <h3>Como funciona o Divórcio Express?</h3>
                    <span className="faq-toggle">
                      {activeQuestion === 0 ? "-" : "+"}
                    </span>
                  </div>
                  <div
                    className={`faq-answer ${
                      activeQuestion === 0 ? "active" : ""
                    }`}
                  >
                    <p>
                      O Divórcio Express fornece as ferramentas e os recursos
                      que simplificarão o processo para facilitar a obtenção do
                      divórcio. Nosso processo de 4 etapas é fácil de usar e
                      fácil de entender.
                    </p>
                  </div>
                </div>

                <div className="faq-item">
                  <div
                    className={`faq-question ${
                      activeQuestion === 1 ? "active" : ""
                    }`}
                    onClick={() => toggleQuestion(1)}
                  >
                    <h3>Quanto custa o Divórcio Express?</h3>
                    <span className="faq-toggle">
                      {activeQuestion === 1 ? "-" : "+"}
                    </span>
                  </div>
                  <div
                    className={`faq-answer ${
                      activeQuestion === 1 ? "active" : ""
                    }`}
                  >
                    <p>
                      Os valores dos nossos serviços são personalizados de
                      acordo com a complexidade do seu caso. Entre em contato
                      conosco para uma avaliação detalhada e receber informações
                      sobre os custos envolvidos no seu processo específico.
                      Nosso objetivo é oferecer um serviço acessível e
                      transparente.
                    </p>
                  </div>
                </div>

                <div className="faq-item">
                  <div
                    className={`faq-question ${
                      activeQuestion === 2 ? "active" : ""
                    }`}
                    onClick={() => toggleQuestion(2)}
                  >
                    <h3>Importa onde nos casamos?</h3>
                    <span className="faq-toggle">
                      {activeQuestion === 2 ? "-" : "+"}
                    </span>
                  </div>
                  <div
                    className={`faq-answer ${
                      activeQuestion === 2 ? "active" : ""
                    }`}
                  >
                    <p>
                      Não, não importa onde você se casou. Um divórcio deve ser
                      registrado onde você ou seu cônjuge residem. Você não
                      registra no estado ou país onde se casou, mas sim onde
                      mora.
                    </p>
                  </div>
                </div>

                <div className="faq-item">
                  <div
                    className={`faq-question ${
                      activeQuestion === 3 ? "active" : ""
                    }`}
                    onClick={() => toggleQuestion(3)}
                  >
                    <h3>Posso usar o Divórcio Express se tivermos filhos?</h3>
                    <span className="faq-toggle">
                      {activeQuestion === 3 ? "-" : "+"}
                    </span>
                  </div>
                  <div
                    className={`faq-answer ${
                      activeQuestion === 3 ? "active" : ""
                    }`}
                  >
                    <p>
                      Sim. O Divórcio Express fornece os documentos necessários
                      para abordar todas as questões relacionadas aos filhos.
                    </p>
                  </div>
                </div>

                <div className="faq-item">
                  <div
                    className={`faq-question ${
                      activeQuestion === 4 ? "active" : ""
                    }`}
                    onClick={() => toggleQuestion(4)}
                  >
                    <h3>
                      Posso usar o Divórcio Express se tivermos propriedades
                      e/ou dívidas?
                    </h3>
                    <span className="faq-toggle">
                      {activeQuestion === 4 ? "-" : "+"}
                    </span>
                  </div>
                  <div
                    className={`faq-answer ${
                      activeQuestion === 4 ? "active" : ""
                    }`}
                  >
                    <p>
                      Sim. O Divórcio Express fornece os documentos necessários
                      para dividir propriedades e dívidas.
                    </p>
                  </div>
                </div>

                <div className="faq-item">
                  <div
                    className={`faq-question ${
                      activeQuestion === 5 ? "active" : ""
                    }`}
                    onClick={() => toggleQuestion(5)}
                  >
                    <h3>No Brasil posso fazer meu divórcio sozinho?</h3>
                    <span className="faq-toggle">
                      {activeQuestion === 5 ? "-" : "+"}
                    </span>
                  </div>
                  <div
                    className={`faq-answer ${
                      activeQuestion === 5 ? "active" : ""
                    }`}
                  >
                    <p>
                      Não, é obrigatório contar com a assistência de um advogado
                      para garantir que todos os procedimentos legais sejam
                      seguidos corretamente. A Divórcio Express conta com equipe
                      especializada em Divórcios e vai te auxiliar em todo o
                      processo conforme a Legislação Brasileira e Ordem dos
                      Advogados do Brasil.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Seção de Contato */}
          <section id="contato" className="contact-section">
            <div className="container">
              <h2>Entre em Contato</h2>
              <p className="section-subtitle">
                Estamos aqui para ajudar com qualquer dúvida sobre o processo de
                divórcio
              </p>

              <div className="contact-info-centered">
                <div className="contact-item">
                  <h3>E-mail</h3>
                  <p>contato@divorcioexpress.com.br</p>
                </div>
                <div className="contact-item">
                  <h3>Telefone</h3>
                  <p>(11) 91680-1800</p>
                </div>
                <div className="contact-item">
                  <h3>Endereço</h3>
                  <p>
                    Avenida Marquês De São Vicente, 230 Barra Funda São Paulo-
                    Ed. Think Business Center, 18º Andar
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Seção Credenciais */}
          <section className="credentials-section">
            <div className="container">
              <div className="credentials-content">
                <div className="credentials-image">
                  <img
                    src="/lp-divorcioExpress/images/ibdfam-logo.png"
                    alt="IBDFAM - Instituto Brasileiro de Direito de Família"
                    className="ibdfam-image"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://www.ibdfam.org.br/assets/img/logo.png";
                    }}
                  />
                </div>
                <div className="credentials-image">
                  <img
                    src="/lp-divorcioExpress/images/oab-lp.png"
                    alt="OAB - Ordem dos Advogados do Brasil"
                    className="oab-image"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://www.oabsp.org.br/img/logo-oabsp.png";
                    }}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Rodapé */}
          <footer className="footer">
            <div className="container">
              <div className="footer-content">
                <div className="footer-logo">
                  <img
                    src={
                      process.env.NODE_ENV === "production"
                        ? "/lp-divorcioExpress/images/logo-novo.png"
                        : "./images/logo-novo.png"
                    }
                    alt="Divórcio Express"
                    className="logo-image"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/images/logo-novo.png";
                    }}
                  />
                  <p>Divórcio online rápido e sem complicações</p>
                </div>

                <div className="footer-links">
                  <div className="footer-column">
                    <h3>Menu</h3>
                    <ul>
                      <li>
                        <a href="#como-funciona">Como Funciona</a>
                      </li>
                      <li>
                        <a href="#servico">Processo Simplificado</a>
                      </li>
                      <li>
                        <a href="#avaliacoes">Avaliações</a>
                      </li>
                      <li>
                        <a href="#faq">Perguntas Frequentes</a>
                      </li>
                      <li>
                        <a href="#contato">Contato</a>
                      </li>
                      <li>
                        <a href="/blog">Blog</a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="footer-bottom">
                <div className="footer-bottom-content">
                  <p>
                    © 2025 Divórcio Express. Todos os direitos reservados.
                    <a href="#" className="footer-legal-link">
                      Política de Privacidade
                    </a>
                    <a href="#" className="footer-legal-link">
                      Termos de Uso
                    </a>
                  </p>
                </div>
                <div className="social-links">
                  <a href="#" aria-label="Facebook">
                    Facebook
                  </a>
                  <a href="#" aria-label="Instagram">
                    Instagram
                  </a>
                  <a href="#" aria-label="Twitter">
                    Twitter
                  </a>
                </div>
              </div>
            </div>
          </footer>

          {/* WhatsApp Button */}
          <a
            href="https://wa.me/5511916801800"
            className="whatsapp-button"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Converse conosco pelo WhatsApp"
          >
            <i className="fab fa-whatsapp"></i>
          </a>

          {/* Modal de Termos de Serviço */}
          {showTermsPopup && (
            <div className="terms-popup-overlay" onClick={toggleTermsPopup}>
              <div className="terms-popup" onClick={(e) => e.stopPropagation()}>
                <h3>Termos de Serviço</h3>
                <div className="terms-content">
                  <p>
                    Declaro, para os devidos fins, que as informações pessoais
                    por mim prestadas neste formulário são verdadeiras,
                    completas e atualizadas. Autorizo, de forma livre,
                    informada, expressa e inequívoca, o tratamento dos referidos
                    dados pessoais pela Divórcio Express, nos termos da Lei nº
                    13.709/2018 – Lei Geral de Proteção de Dados Pessoais
                    (LGPD), exclusivamente para as finalidades aqui descritas.
                  </p>
                  <p>
                    Estou ciente de que meus dados poderão ser compartilhados
                    com terceiros parceiros, estritamente quando necessário para
                    o cumprimento dessas finalidades, asseguradas as garantias
                    legais de confidencialidade e segurança. Autorizo, ainda, o
                    armazenamento dos dados pelo período necessário ao
                    cumprimento das obrigações legais e regulatórias, ou até
                    eventual revogação deste consentimento, a qualquer tempo,
                    mediante solicitação formal, conforme assegurado pela
                    legislação vigente.
                  </p>
                </div>
                <button className="close-popup" onClick={toggleTermsPopup}>
                  ×
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
