import {
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { auth } from "./firebase-config.js";

const form = document.getElementById("form-login");
const email = document.getElementById("email");
const senha = document.getElementById("senha");
const botao = document.getElementById("btn-login");
const mensagem = document.getElementById("mensagem-login");

onAuthStateChanged(auth, usuario => {
  if (usuario) window.location.replace("admin.html");
});

form.addEventListener("submit", async event => {
  event.preventDefault();
  botao.disabled = true;
  mensagem.textContent = "Entrando...";
  mensagem.className = "mensagem-status";

  try {
    await signInWithEmailAndPassword(auth, email.value.trim(), senha.value);
    window.location.replace("admin.html");
  } catch (error) {
    console.error(error);
    mensagem.textContent = "E-mail ou senha inválidos.";
    mensagem.className = "mensagem-status erro";
  } finally {
    botao.disabled = false;
  }
});
