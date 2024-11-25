// eslint-disable-next-line @typescript-eslint/no-require-imports
const { connect } = require('amqplib');

async function publishMessages() {
  const queue = 'benefits_cpf';

  const messages = [
    { cpf: '34322835040' },
    { cpf: '86923000041' },
    { cpf: '34322835040' },
    { cpf: '86923000041' },
    { cpf: '56894687030' },
    { cpf: '43351012012' },
    { cpf: '56894687030' },
    { cpf: '41502259079' },
    { cpf: '43351012012' },
    { cpf: '41502259079' },
  ];

  try {
    const connection = await connect('amqp://localhost');
    const channel = await connection.createChannel();

    await channel.assertQueue(queue, { durable: true });

    for (const msg of messages) {
      console.log(`Publicando CPF ${msg.cpf} na fila ${queue}`);
      channel.sendToQueue(queue, Buffer.from(JSON.stringify(msg)));
    }

    setTimeout(() => {
      connection.close();
      console.log('Conexão encerrada.');
    }, 500);
  } catch (error) {
    console.error('Erro ao publicar mensagens:', error);
  }
}

publishMessages();
