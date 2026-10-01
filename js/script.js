(() => {
  "use strict";

  const carrinho = new Map();

  const moeda = valor => new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(valor);

  function produtosAtuais() {
    return Array.isArray(window.GEEKZONE_PRODUTOS) ? window.GEEKZONE_PRODUTOS : [];
  }

  function elementos() {
    return {
      vitrine: document.getElementById("vitrine-produtos"),
      contador: document.getElementById("contador-itens"),
      total: document.getElementById("valor-total"),
      tema: document.getElementById("btn-dark-mode"),
      checkout: document.getElementById("btn-checkout"),
      dialog: document.getElementById("checkout-dialog"),
      resumo: document.getElementById("resumo-pedido"),
      checkoutTotal: document.getElementById("checkout-total"),
      limpar: document.getElementById("limpar-carrinho")
    };
  }

  function criarCartao(produto) {
    const artigo = document.createElement("article");
    artigo.className = "card-produto";
    const conteudo = document.createElement("div");

    let midia;
    if (produto.imagem) {
      midia = document.createElement("img");
      midia.className = "imagem-produto";
      midia.src = produto.imagem;
      midia.alt = produto.nome;
      midia.addEventListener("error", () => {
        midia.replaceWith(Object.assign(document.createElement("div"), {
          className: "icone-produto",
          textContent: "📦"
        }));
      });
    } else {
      midia = document.createElement("div");
      midia.className = "icone-produto";
      midia.setAttribute("aria-hidden", "true");
      midia.textContent = "📦";
    }

    const nome = document.createElement("h2");
    nome.className = "nome-produto";
    nome.textContent = produto.nome;

    const descricao = document.createElement("p");
    descricao.className = "descricao-produto";
    descricao.textContent = produto.descricao || `Estoque: ${produto.estoque || 0} un.`;

    const preco = document.createElement("p");
    preco.className = "preco-produto";
    preco.textContent = moeda(produto.preco);

    const comprar = document.createElement("button");
    comprar.className = "btn-comprar";
    comprar.type = "button";
    comprar.textContent = Number(produto.estoque) > 0 ? "Comprar" : "Sem estoque";
    comprar.disabled = Number(produto.estoque) <= 0;
    comprar.addEventListener("click", () => adicionarAoCarrinho(produto.id));

    conteudo.append(midia, nome, descricao, preco);
    artigo.append(conteudo, comprar);
    return artigo;
  }

  function renderizarProdutos() {
    const el = elementos();
    if (!el.vitrine) return;

    el.vitrine.replaceChildren();
    const produtos = produtosAtuais();

    if (produtos.length === 0) {
      const aviso = document.createElement("p");
      aviso.className = "estado-vitrine";
      aviso.textContent = "Nenhum produto cadastrado no momento.";
      el.vitrine.appendChild(aviso);
      return;
    }

    produtos.forEach(produto => {
      const precoValido = Number.isFinite(Number(produto.preco)) && Number(produto.preco) >= 0;
      if (!produto.id || !produto.nome || !precoValido) return;
      el.vitrine.appendChild(criarCartao({ ...produto, preco: Number(produto.preco) }));
    });
  }

  function adicionarAoCarrinho(id) {
    const produto = produtosAtuais().find(item => item.id === id);
    if (!produto || Number(produto.estoque) <= 0) return;

    const itemAtual = carrinho.get(id);
    const quantidadeAtual = itemAtual ? itemAtual.quantidade : 0;
    if (quantidadeAtual >= Number(produto.estoque)) {
      alert("Quantidade máxima disponível em estoque atingida.");
      return;
    }

    if (itemAtual) itemAtual.quantidade += 1;
    else carrinho.set(id, { produto, quantidade: 1 });
    atualizarCarrinho();
  }

  function atualizarCarrinho() {
    const el = elementos();
    let quantidade = 0;
    let total = 0;
    carrinho.forEach(({ produto, quantidade: qtd }) => {
      quantidade += qtd;
      total += Number(produto.preco) * qtd;
    });
    el.contador.textContent = String(quantidade);
    el.total.textContent = moeda(total);
    el.checkoutTotal.textContent = moeda(total);
    window.GEEKZONE_TOTAL_CARRINHO = total;
    window.dispatchEvent(new CustomEvent("geekzone:carrinho-atualizado", {
      detail: { total, quantidade }
    }));
  }

  function abrirCheckout() {
    const el = elementos();
    if (carrinho.size === 0) {
      alert("Seu carrinho está vazio!");
      return;
    }
    el.resumo.replaceChildren();
    carrinho.forEach(({ produto, quantidade }) => {
      const linha = document.createElement("p");
      linha.className = "linha-resumo";
      linha.textContent = `${produto.nome} × ${quantidade} — ${moeda(Number(produto.preco) * quantidade)}`;
      el.resumo.appendChild(linha);
    });
    el.dialog.showModal();
  }

  function inicializar() {
    const el = elementos();
    el.tema.addEventListener("click", () => {
      const escuro = document.body.classList.toggle("dark-mode");
      el.tema.textContent = escuro ? "☀️ Modo Claro" : "🌙 Modo Noturno";
    });
    el.checkout.addEventListener("click", abrirCheckout);
    el.limpar.addEventListener("click", () => {
      carrinho.clear();
      atualizarCarrinho();
      el.resumo.replaceChildren();
      el.dialog.close();
    });
    atualizarCarrinho();
  }



  document.addEventListener("DOMContentLoaded", inicializar);
  window.addEventListener("geekzone:produtos-carregados", renderizarProdutos);
})();


// Chat de vendas demonstrativo: respostas locais, sem API externa.
(() => {
  "use strict";
  const respostas = [
    { termos: ["preço","preco","valor"], texto: "Os preços atualizados aparecem em cada produto da vitrine. Se quiser, diga o nome do produto." },
    { termos: ["estoque","disponível","disponivel"], texto: "A disponibilidade é exibida na vitrine. Produtos sem estoque ficam com a compra desabilitada." },
    { termos: ["entrega","envio"], texto: "Posso verificar as condições da sua compra pelo valor atual do carrinho." },
    { termos: ["pedido","carrinho","comprar"], texto: "Adicione o produto ao carrinho e clique em “Fechar Pedido” no topo para conferir o resumo." },
    { termos: ["garantia","defeito","garantido"], texto: "Garantia direto com o fabricante." },
    { termos: ["atacado","atacadista","revenda","revender"], texto: "Valor diferenciado para atacado, com desconto de 20%." },
    { termos: ["retirar","retirada","buscar","pegar"], texto: "Sim, pode retirar em nossa loja." },
    { termos: ["novo","novos","lacrado","lacrados","usado","seminovo","semi-novo"], texto: "Sim, todos nossos produtos são novos." },
    { termos: ["humano","pessoa","atendente","falar","alguém","alguem","atendimento","humanizado","robo","robô"], texto: "Um momento, estou direcionando você para um atendente." },
    { termos: ["oi","olá","ola","bom dia","boa tarde","boa noite"], texto: "Olá! Como posso ajudar na sua compra hoje?" }
  ];
  const respostaBot = mensagem => {
    const texto = mensagem.toLocaleLowerCase("pt-BR");
    const termosCarrinho = [
      "frete", "frete grátis", "frete gratis", "desconto", "promoção", "promocao",
      "entrega", "sacola", "valor do carrinho", "total da compra", "quanto estou comprando",
      "direito a desconto", "direito a frete", "quanto deu", "quanto ficou"
    ];

    if (termosCarrinho.some(termo => texto.includes(termo)) && window.GeekZoneMochila) {
      return window.GeekZoneMochila.analisarCarrinho();
    }

    const encontrada = respostas.find(item => item.termos.some(termo => texto.includes(termo)));
    return encontrada?.texto || "Posso ajudar com produtos, preços, estoque, entrega, frete, desconto ou seu pedido. Tente me perguntar sobre um desses assuntos.";
  };
  const adicionarMensagem = (container, texto, autor) => {
    const p = document.createElement("p");
    p.className = `mensagem ${autor}`;
    p.textContent = texto;
    container.appendChild(p);
    container.scrollTop = container.scrollHeight;
  };
  document.addEventListener("DOMContentLoaded", () => {
    const botao = document.getElementById("btn-chat"), chat = document.getElementById("chat-robo"),
      fechar = document.getElementById("fechar-chat"), form = document.getElementById("chat-form"),
      input = document.getElementById("chat-input"), mensagens = document.getElementById("chat-mensagens");
    if (!botao || !chat || !fechar || !form || !input || !mensagens) return;
    const definirAberto = aberto => {
      chat.hidden = !aberto; botao.setAttribute("aria-expanded", String(aberto));
      botao.textContent = aberto ? "×" : "💬";
      if (aberto) input.focus();
    };
    botao.addEventListener("click", () => definirAberto(chat.hidden));
    fechar.addEventListener("click", () => definirAberto(false));
    form.addEventListener("submit", event => {
      event.preventDefault();
      const texto = input.value.trim(); if (!texto) return;
      adicionarMensagem(mensagens, texto, "usuario"); input.value = "";
      window.setTimeout(() => adicionarMensagem(mensagens, respostaBot(texto), "bot"), 350);
    });
    let ofertaProativaExibida = false;

    window.addEventListener("geekzone:carrinho-atualizado", event => {
      if (!window.GeekZoneMochila) return;

      const oferta = window.GeekZoneMochila.criarOfertaProativa(event.detail?.total);

      if (!oferta) {
        ofertaProativaExibida = false;
        return;
      }

      if (ofertaProativaExibida) return;

      ofertaProativaExibida = true;
      definirAberto(true);
      adicionarMensagem(mensagens, oferta, "bot");
    });

    document.addEventListener("keydown", event => { if (event.key === "Escape" && !chat.hidden) definirAberto(false); });
  });
})();