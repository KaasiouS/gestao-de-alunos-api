import request from 'supertest';
import { expect } from 'chai';
import app from '../src/app.js';
import { loginComoAdmin, loginComoAluno } from './helpers/auth.js';
import cenarios from './fixtures/entregaDeTrabalho.json' with { type: 'json' };

describe('Entrega de trabalho pelo aluno', () => {
  cenarios.forEach(({ cenario, aluno, disciplinaId, trabalho }) => {
    describe(`Cenário: ${cenario}`, () => {
      // E-mail e matrícula precisam ser únicos a cada execução, porque o banco persiste entre rodadas.
      const sufixo = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
      const dadosDoAluno = {
        nome: aluno.nome,
        email: `${aluno.prefixoEmail}.${sufixo}@example.com`,
        matricula: sufixo,
        senha: aluno.senha,
      };

      let tokenAdmin;
      let tokenAluno;
      let alunoId;

      it('deve logar como administrador', async () => {
        tokenAdmin = await loginComoAdmin();

        expect(tokenAdmin).to.be.a('string').and.not.be.empty;
      });

      it('deve cadastrar o aluno', async () => {
        const resposta = await request(app)
          .post('/api/admin/alunos')
          .set('Authorization', `Bearer ${tokenAdmin}`)
          .send(dadosDoAluno);

        expect(resposta.status).to.equal(201);
        expect(resposta.body).to.include({
          nome: dadosDoAluno.nome,
          email: dadosDoAluno.email,
          matricula: dadosDoAluno.matricula,
        });
        expect(resposta.body).to.not.have.property('senha');
        alunoId = resposta.body.id;
      });

      it('deve matricular o aluno na disciplina', async () => {
        const resposta = await request(app)
          .post(`/api/admin/disciplinas/${disciplinaId}/matriculas`)
          .set('Authorization', `Bearer ${tokenAdmin}`)
          .send({ alunoId });

        expect(resposta.status).to.equal(201);
        expect(resposta.body).to.include({ alunoId, disciplinaId });
      });

      it('deve logar como aluno', async () => {
        tokenAluno = await loginComoAluno(dadosDoAluno.email, dadosDoAluno.senha);

        expect(tokenAluno).to.be.a('string').and.not.be.empty;
      });

      it('deve registrar a entrega do trabalho como aluno', async () => {
        const resposta = await request(app)
          .post(`/api/alunos/${alunoId}/trabalhos`)
          .set('Authorization', `Bearer ${tokenAluno}`)
          .send({ disciplinaId, ...trabalho });

        expect(resposta.status).to.equal(201);
        expect(resposta.headers['content-type']).to.include('application/json');
        expect(resposta.body).to.include({
          alunoId,
          disciplinaId,
          titulo: trabalho.titulo,
          descricao: trabalho.descricao,
          status: 'entregue',
        });
        expect(resposta.body).to.have.property('id');
      });
    });
  });
});
