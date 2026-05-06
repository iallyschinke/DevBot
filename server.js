require("dotenv").config(); // isso é para carregar as variáveis de ambiente do arquivo .env
const express = require("express"); // isso é para criar um servidor web usando o framework Express
const cors = require("cors"); // isso é para permitir que o servidor aceite requisições de outros domínios (CORS)
const path = require("path"); // isso é para lidar com caminhos de arquivos e diretórios de forma mais fácil e segura
const { error } = require("console"); // isso é para importar a função de log de erros do console, mas não está sendo usada no código, então pode ser removida

const app = express(); // isso é para criar uma instância do aplicativo Express
const PORT = process.env.PORT || 3000; // isso é para definir a porta em que o servidor vai rodar, usando a variável de ambiente PORT ou 3000 como padrão

// Middleware
app.use(cors()); // isso é para usar o middleware CORS, que permite que o servidor aceite requisições de outros domínios
app.use(express.json()); // isso é para usar o middleware express.json(), que permite que o servidor entenda requisições com corpo em formato JSON
app.use(express.static(path.join(__dirname))); // isso é para servir arquivos estáticos (como HTML, CSS, JS) a partir do diretório atual (__dirname)

// Endpoint para chat
app.post("/chat", async (req, res) => {
  const { message } = req.body; // isso é para extrair a mensagem do corpo da requisição (req.body)

  if (!message) {
    return res.status(400).json({ error: "Mensagem é obrigatória" }); // isso é para retornar um erro 400 (Bad Request) com uma mensagem de erro em formato JSON
  }

  try {
    const API_URL = "https://api.openai.com/v1/chat/completions"; // isso é para definir a URL da API do OpenAI para criar uma conclusão de chat
    const API_KEY = process.env.OPENAI_API_KEY; // isso é para obter a chave da API do OpenAI a partir da variável de ambiente OPENAI_API_KEY

    const response = await fetch(API_URL, {
      method: "POST", //  isso é para definir o método da requisição como POST
      headers: {
        "Content-Type": "application/json", // isso é para indicar que o corpo da requisição está em formato JSON
        Authorization: `Bearer ${API_KEY}`, // isso é para incluir a chave da API no cabeçalho de autorização, usando o formato Bearer
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo", //  isso é para especificar o modelo de linguagem a ser usado, neste caso, o GPT-3.5 Turbo
        messages: [{ role: "user", content: message }], // isso é para criar um array de mensagens, onde cada mensagem tem um papel (role) e um conteúdo (content). Neste caso, a mensagem do usuário é adicionada com o papel "user".
      }),
    });

    const data = await response.json(); // isso é para aguardar a resposta da API e convertê-la para um objeto JSON, que vai conter a resposta do modelo de linguagem ou um erro

    if (response.ok) {
      res.json({ reply: data.choices[0].message.content }); // isso é para retornar a resposta do modelo de linguagem para o cliente em formato JSON, onde a resposta está no campo "content" da primeira escolha (choices[0]) da resposta da API
    } else {
      res.status(response.status).json({ error: data.error.message }); // isso é para retornar o status de erro da API e a mensagem de erro em formato JSON, onde a mensagem de erro está no campo "message" do objeto "error" da resposta da API
    }
  } catch (error) {
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
