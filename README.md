# Processamento de Vídeos - Arquitetura Serverless na AWS

## 📌 Descrição
Este projeto foi desenvolvido como parte de um desafio técnico para a FIAP X, onde o objetivo é criar uma aplicação escalável para o processamento de vídeos. A aplicação recebe um vídeo, processa os frames e retorna um arquivo `.zip` com as imagens extraídas.

## 🚀 Arquitetura Utilizada
A arquitetura escolhida é **Serverless na AWS**, utilizando os seguintes serviços:

- **Autenticação:** AWS Cognito
- **Armazenamento de Arquivos:** Amazon S3
- **Banco de Dados:** MongoDB
- **Processamento Assíncrono:** Amazon SQS
- **Notificação em caso de falha:** Nodemailer
- **CI/CD:** GitHub Actions
- **Qualidade e Segurança:** SonarQube
- **Proteção contra uploads maliciosos:** Implementação de filtros para arquivos inválidos

### 🔹 Fluxo da Aplicação
1. O usuário faz login via **AWS Cognito**.
2. Faz upload de um vídeo para o **Amazon S3**.
3. A aplicação dispara um evento para uma **SQS**, processando o vídeo de forma assíncrona.
4. O processamento extrai os frames e gera um arquivo `.zip`.
5. O usuário pode verificar o status dos vídeos processados.
6. Em caso de erro, uma notificação por **e-mail** é enviada.

### ➡️ Representação do fluxo
![Serverless Cloudd Arch](./docs/serverless-cloud-arch.drawio.svg)

## 📂 Estrutura do Projeto
O projeto segue os princípios de **Clean Architecture**:

```
📂 src/
 ┣ 📂 handlers/          # Casos de uso e regras de negócio
 ┣ 📂 domain/            # Entidades do domínio
 ┣ 📂 infra/             # Integração com AWS, MongoDB e SQS
 ┣ 📂 presenters/        # Controladores e interfaces REST
 ┣ 📂 tests/             # Testes unitários e de integração
```
### Representação do Documento
![Data Document representative](./docs/serverless-MER.drawio.svg)

## 📡 Deploy e CI/CD
O projeto utiliza **GitHub Actions** para:
- Executar testes automatizados.
- Analisar a qualidade do código com **SonarQube**.
- Realizar o deploy automático para a AWS.

## ⚖️ Comparação com Kubernetes (EKS)
| Característica       | Serverless AWS  | Kubernetes (EKS) |
|--------------------|----------------|-----------------|
| **Custo Inicial**  | Zero           | Alto           |
| **Escalabilidade** | Automática     | Gerenciada manualmente |
| **Manutenção**     | Baixa          | Alta |
| **Complexidade**   | Simples        | Elevada |

## 🛠️ Tecnologias Utilizadas
- **Node.js** com **TypeScript**
- **AWS Cognito, S3, SQS**
- **MongoDB**
- **Nodemailer** para envio de notificações
- **GitHub Actions e SonarQube**

## 🚀 Como configurar o projeto
1. Clone este repositório:
   ```sh
   git clone https://github.com/FIAP-TEAM-73/video-splitter.git
   ```
2. Instale as dependências:
   ```sh
   cd video-splitter
   npm install
   ```
3. Donwload ffmpeg bin
   ```sh
          mkdir -p bin
          curl -L -o bin/ffmpeg-release.tar.xz /
            https://johnvansickle.com/ffmpeg/releases /
            ffmpeg-release-amd64-static.tar.xz
          
          echo Verify file exists before extraction
          if [ ! -f bin/ffmpeg-release.tar.xz ]; then
            echo "Download failed! Exiting..."
            exit 1
          fi

          echo Extract files
          tar -xvf bin/ffmpeg-release.tar.xz -C bin --strip-components=1

          echo Make FFmpeg executable
          chmod +x bin/ffmpeg
   ```
4. Install Serverless:
   ```sh
    npm i -g serverless
   ```
5. Deploy functions:
   ```sh
   sls deploy --param="db_user=<>" --param="db_password=<>" --param="db_name=<>" --param="smtp_host=smtp.ethereal.email" --param="smtp_user=<>"  --param="smtp_pass=<>"
   ```

> **_NOTE:_** Aplicação não tem Express, então ela não funciona localmente.

## 🧪 Testando Funções via curl

### Sign Up
```sh
curl -i -X POST \
   -H "Content-Type:application/json" \
   -d \
'{
  "email": "any_email@gmail.com.br",
  "password": <your_password>
}' \
 'https://<api_gateway_id>.execute-api.us-east-1.amazonaws.com/dev/user/signup'
```
### Login
```sh
curl -i -X POST \
   -H "Content-Type:application/json" \
   -d \
'{
  "email": "any_email@gmail.com.br",
  "password": <your_password>
}' \
 'https://<api_gateway_id>.execute-api.us-east-1.amazonaws.com/dev/user/login'
```
### Find Videos
```sh
curl -i -X GET \
   -H "Authorization:Bearer <token>" \
 'https://<api_gateway_id>.execute-api.us-east-1.amazonaws.com/dev/video?email=anderson.acdm%40icloud.com&page=1&size=10'
```
### Upload Video
```sh
curl -i -X POST \
   -H "Authorization:Bearer <token>" \
   -H "Content-Type:application/json" \
   -d \
'{
  "email": "anderson.acdm@icloud.com",
  "videoLink": "https://download.samplelib.com/mp4/sample-5s.mp4",
  "interval": 1
}' \
 'https://<api_gateway_id>.execute-api.us-east-1.amazonaws.com/dev/video'
```

## 📜 Contribuição
Contribuições são bem-vindas! Sinta-se à vontade para abrir uma issue ou um pull request.

## 📄 Licença
Este projeto está sob a licença MIT.
