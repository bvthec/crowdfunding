# WARNING
Project is not secure!

## Instalation Requirements

- node >= v24.7.0 (not tested with previous versions)
- npm  >= 11.5.2

## Setup

1. In the project directory, run the following command to install all the dependecies:

    ```
        npm install
    ```

2. Start mariaDB server and configure the credentials in the **.env** file.
   Use the **.env.example** file as example.

3. In mariaDB, create a database called 'funding', no table is required. You can change the database name
   in **.env** file.
    

## Start The Application

1. Execute the following command if you are running the project for the first time. It will init the database with some default data:
    
    ```
        node ./scripts/init_db.mjs
    ```


2. To run the application, start the server with the following command:
    
    ```
        node ./src/server.mjs
    ```

    The server should run at: http://localhost:3000.

## Admin Panel

You can access the admin panel at: http://localhost:3000/admin/.
    
Admin default crendetials are:

- Email: admin@admin.com
- Password: 1234