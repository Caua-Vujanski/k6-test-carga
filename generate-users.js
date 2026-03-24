const axios = require('axios');
const fs = require('fs');

const BASE_URL = 'https://erp-api-dev-922117522963.us-central1.run.app';

const URL_LOGIN = `${BASE_URL}/api/v1/app/auth/login`;
const URL_PESSOA = `${BASE_URL}/api/v1/pessoa`;
const URL_USUARIO = `${BASE_URL}/api/v1/usuario`;

const users = [];

function gerarCPF() {
  const random = () => Math.floor(Math.random() * 9);

  let cpf = [];

  for (let i = 0; i < 9; i++) {
    cpf.push(random());
  }

  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += cpf[i] * (10 - i);
  }

  let resto = soma % 11;
  let digito1 = resto < 2 ? 0 : 11 - resto;
  cpf.push(digito1);

  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += cpf[i] * (11 - i);
  }

  resto = soma % 11;
  let digito2 = resto < 2 ? 0 : 11 - resto;
  cpf.push(digito2);

  return cpf.join('');
}

async function login() {
  const params = new URLSearchParams();

  params.append('login', 'admin');
  params.append('password', '7Y/6p0p\\iYd{');

  const res = await axios.post(URL_LOGIN, params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });

  const token = res.headers['access_token'];

  if (!token) {
    throw new Error('Token não encontrado no header');
  }

  console.log('✅ Login realizado com sucesso');

  return token;
}

async function criarUsuarios() {
  const token = await login();

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  for (let i = 1; i <= 50; i++) {
    try {
      const pessoaPayload = {
        nome: `Teste ${i}`,
        nomeSocial: `Teste ${i}`,
        nascimento: "2003-05-07",
        generoId: 1,
        racaId: 3,

        contatos: [
          { tipoContatoId: 2, valor: `(33) 99999-99${i}` },
          { tipoContatoId: 1, valor: `teste${i}@gmail.com` }
        ],

        documentos: [
          { tipoDocumentoId: 1, numero: gerarCPF(i) }
        ],

        enderecos: [
          {
            numero: "12",
            complemento: "",
            bairro: "Zona 08",
            cep: "87050700",
            cidadeId: 6997,
            estadoId: 18,
            logradouro: "Rua Umuarama",
            paisId: 31,
            regiaoId: 5,
            tipoEnderecoId: 1,
            ufId: 18
          }
        ]
      };

      const pessoaRes = await axios.post(URL_PESSOA, pessoaPayload, { headers });

      console.log('🔍 RESPOSTA PESSOA:', pessoaRes.data);

      const pessoaId =
        pessoaRes.data.id ||
        pessoaRes.data.data?.id ||
        pessoaRes.data.content?.id;

      if (!pessoaId) {
        throw new Error('Não foi possível obter o pessoaId');
      }

      console.log(`✅ Pessoa criada: ${pessoaId}`);

      const loginUser = `teste${i}@gmail.com`;
      const senha = '123456';

      const usuarioPayload = {
        departamentoId: 1,
        login: loginUser,
        perfilIds: [3],
        pessoaId: pessoaId,
        usuarioFuncionalidades: []
      };

      await axios.post(URL_USUARIO, usuarioPayload, { headers });

      console.log(`✅ Usuário criado: ${loginUser}`);

      users.push({
        login: loginUser,
        senha: senha
      });

    } catch (err) {
      console.error(`❌ Erro no usuário ${i}`);
      console.error(err.response?.data || err.message);
    }
  }

  fs.writeFileSync('./k6/users.json', JSON.stringify(users, null, 2));

  console.log('🚀 users.json gerado com sucesso');
}

criarUsuarios();