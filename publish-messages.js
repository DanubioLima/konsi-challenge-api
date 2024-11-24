// eslint-disable-next-line @typescript-eslint/no-require-imports
const { connect } = require('amqplib');

async function publishMessages() {
  const queue = 'users_cpf';
  const messages = [
    { cpf: '07254726344' },
    { cpf: '07254726344' },
    { cpf: '07254726344' },
  ];

  try {
    const connection = await connect('amqp://localhost');
    const channel = await connection.createChannel();

    await channel.assertQueue(queue, { durable: true });

    messages.forEach((msg) => {
      channel.sendToQueue(queue, Buffer.from(JSON.stringify(msg)));
    });

    setTimeout(() => {
      connection.close();
      console.log('Conexão encerrada.');
    }, 500);
  } catch (error) {
    console.error('Erro ao publicar mensagens:', error);
  }
}

publishMessages();
