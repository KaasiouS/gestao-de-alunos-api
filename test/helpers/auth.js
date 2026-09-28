import request from 'supertest';
import app from '../../src/app.js';

export async function getToken(email, senha) {
  const resposta = await request(app)
    .post('/api/auth/login')
    .send({ email, senha });

  return resposta.body.token;
}

export async function loginComoAdmin() {
  return getToken(process.env.ADMIN_EMAIL, process.env.ADMIN_SENHA);
}

export async function loginComoAluno(email, senha) {
  return getToken(email, senha);
}
