"use strict";

const Constants = require('discordie/lib/Constants');
const Endpoints = Constants.Endpoints;
const IPermissions = require('discordie/lib/interfaces/IPermissions');
const fs = require('fs');
const Request = require('request');
const ClientOAuth2 = require('client-oauth2');

const API_BASE_URL = 'https://discordapp.com/api';

const discordOAuthIdentify = new ClientOAuth2({
    clientId: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    accessTokenUri: API_BASE_URL + '/oauth2/token',
    authorizationUri: API_BASE_URL + '/oauth2/authorize',
    redirectUri: 'http://localhost:3000/oauth2/callback',
    scopes: ['identify']
});

const discordOAuthJoin = new ClientOAuth2({
    clientId: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    accessTokenUri: API_BASE_URL + '/oauth2/token',
    authorizationUri: API_BASE_URL + '/oauth2/authorize',
    redirectUri: 'http://localhost:3000/oauth2/callback',
    scopes: ['guilds.join']
});

var Web = {
    name: 'Core-Web',
    version: '1.0.0',

    enable() {
        this.router.get('/', (req, res) => {
            res.render('index', {title: 'BotAPI', user: req.session.user});
        });

        this.router.get('/about', (req, res) => {
            res.render('about', {title: 'BotAPI', github: 'https://github.com/CrypticStorm/botapi', user: req.session.user});
        });

        this.router.get('/plugins', (req, res) => {
            res.render('plugins', {title: 'BotAPI', user: req.session.user, plugins: this.manager.plugins});
        });

        this.router.get('/login', (req, res) => {
            var uri = discordOAuthIdentify.code.getUri();
            res.redirect(uri);
        });

        this.router.get('/profile', this.isLoggedIn, (req, res) => {
            res.render('profile', {user: req.session.user});
        });

        this.router.get('/join', (req, res) => {
            res.redirect('https://discord.gg/0b7fa5Sh633Bjexn');
        });

        this.router.get('/invite', (req, res) => {
            var uri = 'https://discordapp.com/oauth2/authorize?client_id='+process.env.DISCORD_BOT_ID+'&scope=bot&permissions='+IPermissions.ALL+'&redirect_uri='+'http://localhost:3000';
            res.redirect(uri);
        });

        this.router.all('/oauth2/callback', (req, res) => {
            discordOAuthIdentify.code.getToken(req.url).then(token => {
                Request.get(token.sign({
                    method: 'GET',
                    url: API_BASE_URL + '/users/@me'
                }), (err, response, body) => {
                    if (err) {
                        console.log(err.stack);
                    } else {
                        try {
                            var json = JSON.parse(body);
                            json.avatar = Constants.CDN_ENDPOINT + Endpoints.CDN_AVATAR(json.id, json.avatar);
                            this.manager.get('Core-Users').saveUser(this.manager.bot, json);

                            if (!req.session) {
                                req.session = {};
                            }
                            req.session.user = json;
                            res.redirect('/');
                        } catch(e) {
                            console.log(e.stack);
                        }
                    }
                });
            });
        });
    },

    isLoggedIn(req, res, next) {
        if (req.session.user) {
            return next();
        }
        res.redirect('/');
    }
};

module.exports = Web;