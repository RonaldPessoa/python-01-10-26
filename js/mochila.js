// Mochila de Ferramentas do Robô Agent da GeekZone.
// Regras de negócio ficam isoladas neste arquivo.
(() => {
  "use strict";

  const moeda = valor => new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(valor);

  function obterValorCarrinho() {
    const total = Number(window.GEEKZONE_TOTAL_CARRINHO);
    return Number.isFinite(total) && total >= 0 ? total : 0;
  }

  function calcularFrete(valorCarrinho) {
    return valorCarrinho >= 200
      ? { gratis: true, valor: 0, mensagem: "Frete Grátis!" }
      : { gratis: false, valor: 25, mensagem: "Frete fixo de R$ 25,00." };
  }

  function calcularDesconto(valorCarrinho) {
    const elegivel = valorCarrinho > 300;
    const valorDesconto = elegivel ? valorCarrinho * 0.10 : 0;

    return {
      elegivel,
      percentual: elegivel ? 10 : 0,
      valorDesconto,
      valorFinal: valorCarrinho - valorDesconto
    };
  }

  function analisarCarrinho(valorInformado) {
    const valorCarrinho = Number.isFinite(Number(valorInformado))
      ? Number(valorInformado)
      : obterValorCarrinho();
    const frete = calcularFrete(valorCarrinho);
    const desconto = calcularDesconto(valorCarrinho);

    if (valorCarrinho === 0) {
      return "Seu carrinho está vazio. Adicione produtos para eu verificar frete e desconto para você.";
    }

    let resposta = `Seu carrinho está em ${moeda(valorCarrinho)}. ${frete.mensagem}`;

    if (desconto.elegivel) {
      resposta += ` E tenho uma oferta para você: ${desconto.percentual}% de desconto, economizando ${moeda(desconto.valorDesconto)}. Com o desconto, sua compra fica por ${moeda(desconto.valorFinal)}.`;
    } else {
      resposta += " No momento, o desconto de 10% é liberado para compras acima de R$ 300,00.";
    }

    return resposta;
  }

  function criarOfertaProativa(valorCarrinho) {
    const valor = Number(valorCarrinho);
    if (!Number.isFinite(valor) || valor < 0) return null;

    const desconto = calcularDesconto(valor);
    if (!desconto.elegivel) return null;

    const frete = calcularFrete(valor);
    return `🎁 Oferta especial! Seu carrinho chegou a ${moeda(valor)}. ${frete.mensagem} Você também ganhou 10% de desconto, economizando ${moeda(desconto.valorDesconto)}. Com o desconto, sua compra fica por ${moeda(desconto.valorFinal)}.`;
  }

  window.GeekZoneMochila = {
    obterValorCarrinho,
    calcularFrete,
    calcularDesconto,
    analisarCarrinho,
    criarOfertaProativa
  };
})();
