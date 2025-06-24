## Dependecies

- nodejs
- MySQL

## Setup

1. In the project directory, run the following command to install the required packages:

    ```
        npm install
    ```

2. Start MySQL server and configure the credentials in the **.env** file.
   Use the **.env.example** file as example.

3. In MySQL, create a database called 'funding', no table is required. You can change the database name
   in **.env** file.
    
4. Execute the following command to init the database with some default data, such as admin account:
    
    ```
        node ./scripts/init_db.js
    ```

## Start The Application

1. To run the application, start the server with the following command:
    
    ```
        node ./src/app.js
    ```

    The server should run at: http://localhost:3000.


## Admin Panel

You can access the admin panel at: http://localhost:3000/admin/.
    
Admin default crendetials are:

- Email: 'admin@admin.com'
- Password: '1234'