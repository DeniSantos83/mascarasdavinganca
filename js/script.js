// Substitua pelos dados reais de WhatsApp e Instagram
const WHATSAPP_LINK = "https://wa.me/5500000000000?text=Olá,%20gostaria%20de%20fazer%20uma%20simulação%20na%20Seal%20Cred."; 
// Se quiser, use o mesmo link em mais lugares

document.addEventListener("DOMContentLoaded", () => {
  // Ano atual no rodapé
  const yearSpan = document.getElementById("currentYear");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  // Hero CTA WhatsApp
  const heroWhatsBtn = document.getElementById("heroWhatsBtn");
  if (heroWhatsBtn) {
    heroWhatsBtn.href = WHATSAPP_LINK;
  }

  // Botão flutuante WhatsApp
  const whatsFloat = document.getElementById("whatsFloat");
  if (whatsFloat) {
    whatsFloat.href = WHATSAPP_LINK;
  }

  // Scroll suave para âncoras internas
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");
      if (targetId && targetId.startsWith("#") && targetId.length > 1) {
        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          const offsetTop = target.getBoundingClientRect().top + window.pageYOffset - 80;
          window.scrollTo({
            top: offsetTop,
            behavior: "smooth"
          });
        }
      }
    });
  });

  // Validação simples do formulário de contato
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = document.getElementById("name").value.trim();
      const phone = document.getElementById("phone").value.trim();
      const service = document.getElementById("service").value;

      if (!name || !phone || !service) {
        alert("Por favor, preencha nome, WhatsApp e escolha um serviço.");
        return;
      }

      // Aqui você pode integrar com e-mail, API ou enviar direto para o WhatsApp
      alert("Obrigado! Em breve um consultor da Seal Cred entrará em contato com você.");
      contactForm.reset();
    });
  }
});
