require('dotenv').config(); //loading env from .env file

const mysql =require('mysql2');

//create a connection to the database
// const  connection = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: 'SummerOfmySQL@34',
//     database: "db2",
// });

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});



//connect to the database
connection.connect((err) =>{
    if(err){
        console.error("Error connecting to MySQL:" , err);
        return;
    }
    console.log('Connected to MySQL databse ');
    
    // Example query to test connection
    connection.query('SHOW TABLES' , (error,results,fields)=> {
        if(error){
            console.error('Error executing query : ' ,error);
            return;
        }
        console.log("Tables in database:" , results);
    });
});


//EXAMPLE QUERIES
//1. Retrieve all movies 

const selectAllMovies = 'SELECT * FROM movies';

connection.query(selectAllMovies , (error , results , fields) =>{
    if (error){
        console.error("Erro excuting query:" , error.stack);
        return;
    }
    console.log("All movies: ", results);
});


//2. Retrieve Movies Released in a specific year 
connection.query('SELECT * FROM movies WHERE release_year = ?' , [2023], (error , result ,fields )=>{
    
})


