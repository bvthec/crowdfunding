Requisitos do Sistema

- nodejs
- MySQL
- npm

COMO EXECUTAR O PROJECTO

1. No directorio do projecto executar:

    ```
        npm install
    ```
Para instalar todos os módulos necessários para executar o sistema

2. Iniciar o servidor MySQL

3. Cria uma base da dados no servidor com o nome "funding"
    
   O sistema pressupõe que existe um usuário com nome "root" e
   sem palavra-passe. Se não for o caso os parametros podem ser
   alterado no ficheiro src/lib/settings.js no objecto database.

4. Após criar a base de dados "funding" executar o seguinte comando:
   no directório do projecto:

   ```
        node scripts/init_db.js
    ```

    para inicializar a base de dados.

5. por fim executar o seguinte comando para inicializar o servidor:

    ```
        node src/app.js
    ```

    e esperar a mensagem de que o servidor está online.

6. Em fim para usar o sistema basta usar o navegador e escrever

    http://localhost:1212/

    Para aceder a administração do sistema usar a seguinte URL:

    http://localhost:1212/admin

    As credênciais do administrador são as seguintes:

    Email: 'admin@admin.com' <br>
    Palavra-passe: '1234'<br>