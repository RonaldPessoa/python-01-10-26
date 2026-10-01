import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { db, auth } from "./firebase-config.js";

const form = document.getElementById("form-produto");
const produtoId = document.getElementById("produto-id");
const nome = document.getElementById("nome-produto");
const preco = document.getElementById("preco-produto");
const estoque = document.getElementById("estoque-produto");
const imagem = document.getElementById("imagem-produto");
const previewImagem = document.getElementById("preview-imagem");
const lista = document.getElementById("lista-produtos");
const status = document.getElementById("mensagem-status");
const titulo = document.getElementById("titulo-formulario");
const btnSalvar = document.getElementById("btn-salvar");
const btnCancelar = document.getElementById("btn-cancelar");
const btnSair = document.getElementById("btn-sair");
let autenticado = false;

const moeda = valor => new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
}).format(valor);

function mostrarStatus(mensagem, erro = false) {
  status.textContent = mensagem;
  status.className = erro ? "mensagem-status erro" : "mensagem-status sucesso";
}

function atualizarPreview() {
  const url = imagem.value.trim();
  if (!url) {
    previewImagem.hidden = true;
    previewImagem.removeAttribute("src");
    return;
  }
  previewImagem.src = url;
  previewImagem.hidden = false;
}

previewImagem.addEventListener("error", () => {
  previewImagem.hidden = true;
});
imagem.addEventListener("input", atualizarPreview);

function limparFormulario() {
  form.reset();
  produtoId.value = "";
  previewImagem.hidden = true;
  previewImagem.removeAttribute("src");
  titulo.textContent = "Cadastrar produto";
  btnSalvar.textContent = "Cadastrar";
  btnCancelar.hidden = true;
}

function editarProduto(id, dados) {
  produtoId.value = id;
  nome.value = dados.nome || "";
  preco.value = dados.preco ?? "";
  estoque.value = dados.estoque ?? "";
  imagem.value = dados.imagem || "";
  atualizarPreview();
  titulo.textContent = "Alterar produto";
  btnSalvar.textContent = "Salvar alterações";
  btnCancelar.hidden = false;
  nome.focus();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function excluirProduto(id, nomeProduto) {
  if (!confirm(`Excluir o produto "${nomeProduto}"?`)) return;

  try {
    await deleteDoc(doc(db, "produtos", id));
    mostrarStatus("Produto excluído com sucesso.");
    await carregarProdutos();
  } catch (error) {
    console.error(error);
    mostrarStatus("Erro ao excluir o produto.", true);
  }
}

async function carregarProdutos() {
  try {
    const snapshot = await getDocs(collection(db, "produtos"));
    lista.replaceChildren();

    if (snapshot.empty) {
      const linha = document.createElement("tr");
      linha.innerHTML = '<td colspan="5">Nenhum produto cadastrado.</td>';
      lista.appendChild(linha);
      return;
    }

    const produtos = snapshot.docs
      .map(item => ({ id: item.id, ...item.data() }))
      .sort((a, b) => String(a.nome || "").localeCompare(String(b.nome || ""), "pt-BR"));

    produtos.forEach(produto => {
      const linha = document.createElement("tr");

      const tdImagem = document.createElement("td");
      if (produto.imagem) {
        const img = document.createElement("img");
        img.src = produto.imagem;
        img.alt = produto.nome || "Produto";
        img.className = "miniatura-produto";
        img.addEventListener("error", () => img.remove());
        tdImagem.appendChild(img);
      } else {
        tdImagem.textContent = "—";
      }

      const tdNome = document.createElement("td");
      tdNome.textContent = produto.nome || "-";

      const tdPreco = document.createElement("td");
      tdPreco.textContent = moeda(Number(produto.preco) || 0);

      const tdEstoque = document.createElement("td");
      tdEstoque.textContent = String(Number(produto.estoque) || 0);

      const tdAcoes = document.createElement("td");
      tdAcoes.className = "acoes-tabela";

      const btnEditar = document.createElement("button");
      btnEditar.type = "button";
      btnEditar.className = "btn-editar";
      btnEditar.textContent = "Editar";
      btnEditar.addEventListener("click", () => editarProduto(produto.id, produto));

      const btnExcluir = document.createElement("button");
      btnExcluir.type = "button";
      btnExcluir.className = "btn-excluir";
      btnExcluir.textContent = "Excluir";
      btnExcluir.addEventListener("click", () => excluirProduto(produto.id, produto.nome));

      tdAcoes.append(btnEditar, btnExcluir);
      linha.append(tdImagem, tdNome, tdPreco, tdEstoque, tdAcoes);
      lista.appendChild(linha);
    });
  } catch (error) {
    console.error(error);
    lista.innerHTML = '<tr><td colspan="5">Erro ao carregar produtos.</td></tr>';
    mostrarStatus("Não foi possível acessar o Firebase.", true);
  }
}

form.addEventListener("submit", async event => {
  event.preventDefault();
  if (!autenticado) return;

  const dados = {
    nome: nome.value.trim(),
    preco: Number(preco.value),
    estoque: Number(estoque.value),
    imagem: imagem.value.trim()
  };

  if (!dados.nome || dados.preco < 0 || dados.estoque < 0) {
    mostrarStatus("Preencha os dados corretamente.", true);
    return;
  }

  btnSalvar.disabled = true;

  try {
    if (produtoId.value) {
      await updateDoc(doc(db, "produtos", produtoId.value), dados);
      mostrarStatus("Produto alterado com sucesso.");
    } else {
      await addDoc(collection(db, "produtos"), dados);
      mostrarStatus("Produto cadastrado com sucesso.");
    }

    limparFormulario();
    await carregarProdutos();
  } catch (error) {
    console.error(error);
    mostrarStatus("Erro ao salvar o produto.", true);
  } finally {
    btnSalvar.disabled = false;
  }
});

btnCancelar.addEventListener("click", limparFormulario);
btnSair.addEventListener("click", async () => {
  await signOut(auth);
  window.location.replace("login.html");
});

onAuthStateChanged(auth, async usuario => {
  if (!usuario) {
    window.location.replace("login.html");
    return;
  }

  autenticado = true;
  document.body.classList.remove("admin-bloqueado");
  await carregarProdutos();
});
