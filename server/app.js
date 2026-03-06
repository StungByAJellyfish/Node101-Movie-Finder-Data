require("dotenv").config();

const express = require('express');
const morgan = require('morgan');
const axios = require('axios');

const app = express();
const OMDB_API_KEY = process.env.OMDB_API_KEY;

const cache = {};
var requestCount = 0;

app.use(morgan('dev'));

app.use(function(req, res, next){
    requestCount++
    console.log('request number: ' + requestCount);
    next();
});

app.get('/', async (req, res) => {
    const imdbID = req.query.i;
    const imdbTitle = req.query.t;
    
    if (!imdbID && !imdbTitle) {
        return res.status(200).send('Welcome to the Movie Finder');
    }

    const cacheKey = imdbID || imdbTitle.toLowerCase();
    if (cache[cacheKey]) {
        console.log('Cache for ' + cacheKey);
        return res.status(200).json(cache[cacheKey]);
    }
  
    try {
        let apiUrl;

        if (imdbID) {
            console.log("Accessing OMDB API for " + imdbID);
            apiUrl = `https://www.omdbapi.com/?i=${imdbID}&apikey=${OMDB_API_KEY}`;
        } else {
            console.log("Accessing OMDB API for " + imdbTitle);
            apiUrl = `https://www.omdbapi.com/?t=${encodeURIComponent(imdbTitle)}&apikey=${OMDB_API_KEY}`;
        }

        const response = await axios.get(apiUrl);
        cache[cacheKey] = response.data;
        return res.status(200).json(response.data);
    } catch (error) {
        console.error('Error fetching movie data:', error);
        return res.status(500).json({ error: 'Failed to access movie data.' });
    }
});

module.exports = app;
