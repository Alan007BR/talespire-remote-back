import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import * as net from 'net';
import * as fs from 'fs';


// Configurações do servidor Express
const app = express();
app.use(bodyParser.text({ type: '*/*' }));

const PORT = process.env.PORT || 3000; // Defina a porta do servidor

// Função para enviar mensagem via TCP/IP para o Talespire
const sendToTaleSpire = (message: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const client = new net.Socket();
        const taleSpireHost = '127.0.0.1';
        const taleSpirePort = 11000;

        const connect = client.connect(taleSpirePort, taleSpireHost, () => {
            client.write(message + '\n');
        });

        console.log(connect)

        client.on('data', (data) => {
            client.destroy(); // Encerrar a conexão após o recebimento dos dados
            resolve(data.toString());
        });

        client.on('error', (error) => {
            reject(`Failed to send ${message}: ${error.message}`);
        });

        client.on('close', () => {
            resolve(`Message "${message}" sent successfully.`);
        });
    });
};

// Função para logar a mensagem
const logMessage = (message: string) => {
    console.log(message);
    const logEntry = `${new Date().toISOString()} - Request: ${message}\n`;
    // fs.appendFile('log.txt', logEntry, (err) => {
    //     if (err) {
    //         console.error('Error writing to log file:', err);
    //     }
    // });
};

// Endpoint POST para receber a mensagem
app.post('/', async (req: Request, res: Response) => {
    const msg = req.body;
    console.log(msg)
    // Log da mensagem
    logMessage(msg);

    // Envia a mensagem para o Talespire via TCP/IP
    try {
        const responseMessage = await sendToTaleSpire(msg);
        res.send(responseMessage);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
