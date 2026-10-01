import { collection, getDocs } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";
import { db } from "./firebase-config.js";

window.GEEKZONE_PRODUTOS = [];

async function carregarProdutosFirebase() {
  const vitrine = document.getElementById("vitrine-produtos");

  try {
    const snapshot = await getDocs(collection(db, "produtos"));
    window.GEEKZONE_PRODUTOS = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        nome: data.nome || "Produto sem nome",
        preco: Number(data.preco) || 0,
        estoque: Number(data.estoque) || 0,
        imagem: data.imagem || "",
        descricao: data.descricao || `Estoque: ${Number(data.estoque) || 0} un.`
      };
    });

    window.dispatchEvent(new CustomEvent("geekzone:produtos-carregados"));
  } catch (error) {
    console.error("Erro ao carregar produtos do Firebase:", error);
    if (vitrine) {
      vitrine.innerHTML = '<p class="estado-vitrine">Não foi possível carregar os produtos.</p>';
    }
  }
}

carregarProdutosFirebase();
