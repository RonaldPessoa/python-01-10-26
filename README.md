# GeekZone - Projeto de Curso

## Páginas
- `index.html`: loja pública.
- `login.html`: login do administrador.
- `admin.html`: cadastro, consulta, alteração e exclusão de produtos.

## Produtos
Cada produto possui:
- nome
- preço
- estoque
- URL da imagem (opcional)

A imagem é informada por URL para manter o projeto simples, sem necessidade de Firebase Storage.

## Login administrativo
O projeto usa Firebase Authentication com e-mail e senha.

No Firebase Console do projeto `geekzone-7383e`:
1. Abra **Authentication**.
2. Em **Sign-in method**, habilite **Email/Password**.
3. Em **Users**, crie um usuário administrador com e-mail e senha.
4. Abra `login.html` pelo Live Server e entre com esse usuário.

## Segurança do Firestore
O arquivo `firestore.rules` incluído permite leitura pública dos produtos para a loja e exige autenticação para cadastrar, alterar ou excluir.
Copie/publice essas regras no Firestore Rules do Firebase Console para aplicar a proteção no banco.
