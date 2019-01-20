var express = require('express');
var mysql = require('mysql');
var path = require('path');
var app = express();

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'miner',
    password: 'miner123',
    database: 'RecipesWWW'
});



// index page 
app.get('/', function (req, res) {

    var user_recipe_query = `select Recipes.recipe_id as 'recipe_id', Recipes.name as 'recipe_name', Recipes.main_photo_url as 'recipe_main_photo_url' from Recipes;`;
    var user_recipe_info;

    connection.query(user_recipe_query, function (error, results, fields) {
        if (error) throw error;
        user_recipe_info = results;

        console.log(user_recipe_info);
        res.render('pages/index', {
            user_recipe_info: user_recipe_info
        });

    });


});
app.get('/test', function (req, res) {
    res.render('pages/test');
});

app.get('/dodaj_przepis', function (req, res) {
    res.render('pages/dodaj_przepis');
});

// about page 
app.get('/przepisy/:id', function (req, res) {
    var recipe_id = req.params.id;

    var user_recipe_query = `select Users.first_name as 'user_first_name',
    Users.last_name as 'user_last_name', Users.nickname as 'user_nickname', 
    Recipes.datetime as 'recipe_datetime', Recipes.name as 'recipe_name', 
    Recipes.description as 'recipe_description',
    Recipes.main_photo_URL as 'recipe_main_photo_URL' 
    from Recipes left join Users on Recipes.user_id = Users.user_id 
    where recipe_id = ${recipe_id};`;
    var user_recipe_info;

    var tags_query = `select Recipes.recipe_id as 'recipe_id', 
    Tags.name  as 'tag_name'
    from RecipeTags 
    left join Recipes on Recipes.recipe_id = RecipeTags.recipe_id
    left join Tags on Tags.tag_id = RecipeTags.tag_id where Recipes.recipe_id = ${recipe_id};`;
    var tags_info;

    var tags_query = `select Recipes.recipe_id as 'recipe_id', 
      Tags.name  as 'tag_name'
      from RecipeTags 
      left join Recipes on Recipes.recipe_id = RecipeTags.recipe_id
      left join Tags on Tags.tag_id = RecipeTags.tag_id where Recipes.recipe_id = ${recipe_id};`;
    var tags_info;

    var ingredients_query = `select Recipes.recipe_id as 'recipe_id', 
    Ingredients.name as 'ingredient_name', 
    IngredientsInRecipes.amount as 'ingredient_amount',
    MeasurementUnits.name as 'ingredient_unit' 
    from IngredientsInRecipes left join Recipes on Recipes.recipe_id = IngredientsInRecipes.recipe_id 
    left join Ingredients on Ingredients.ingredient_id = IngredientsInRecipes.ingredient_id
    left join MeasurementUnits on MeasurementUnits.measurement_unit_id =  IngredientsInRecipes.measurement_unit_id 
    where Recipes.recipe_id = ${recipe_id}`;
    var ingredients_info;

    var calories_sum_query = `select Recipes.recipe_id as 'recipe_id', 
    sum(IngredientsInRecipes.amount / MeasurementUnits.base_amount * IngredientsCalories.calories) as 'recipe_sum_calories'
    from IngredientsInRecipes left join Recipes on Recipes.recipe_id = IngredientsInRecipes.recipe_id 
    left join Ingredients on Ingredients.ingredient_id = IngredientsInRecipes.ingredient_id
    left join MeasurementUnits on MeasurementUnits.measurement_unit_id =  IngredientsInRecipes.measurement_unit_id
    left join IngredientsCalories on IngredientsCalories.ingredient_id = Ingredients.ingredient_id and IngredientsCalories.measurement_unit_id = MeasurementUnits.measurement_unit_id
    group by recipe_id
    having Recipes.recipe_id = ${recipe_id}`;
    var calories_sum_info;

    var comments_query = `select Comments.recipe_id as 'recipe_id',
    Comments.content as 'comment_content',
    Users.first_name as 'comment_first_name',
    Users.last_name as 'comment_last_name',
    Users.nickname as 'comment_nickname',
    Comments.datetime as 'comment_datetime'
    from Comments
    left join Users on Users.user_id = Comments.user_id
    left join Recipes on Recipes.recipe_id = Comments.recipe_id
    where Recipes.recipe_id = ${recipe_id};`;
    var comments_info;

    var photos_query = `select URL from Photos where recipe_id = ${recipe_id};`;
    var photos_info;

    connection.query(user_recipe_query, function (error, results, fields) {
        if (error) throw error;
        user_recipe_info = results;


        connection.query(tags_query, function (error, results1, fields) {
            if (error) throw error;
            tags_info = results1;

            connection.query(ingredients_query, function (error, results2, fields) {
                if (error) throw error;
                ingredients_info = results2;

                connection.query(calories_sum_query, function (error, results3, fields) {
                    if (error) throw error;
                    calories_sum_info = results3;

                    connection.query(comments_query, function (error, results4, fields) {
                        if (error) throw error;
                        comments_info = results4;

                        console.log(user_recipe_info);
                        connection.query(photos_query, function (error, results5, fields) {
                            if (error) throw error;
                            photos_info = results5;

                            var queries_results = {
                                user_recipe_info: user_recipe_info,
                                tags_info: tags_info,
                                ingredients_info: ingredients_info,
                                calories_sum_info: calories_sum_info,
                                comments_info: comments_info
                            };
                            res.render('pages/przepisy', {
                                user_recipe_info: user_recipe_info,
                                tags_info: tags_info,
                                ingredients_info: ingredients_info,
                                photos_info: photos_info,
                                calories_sum_info: calories_sum_info,
                                comments_info: comments_info
                            });
                        });
                    });
                });


            });
        });
    });














});


var port = 3000;
app.listen(port);
console.log(`Listening on port ${port}`);