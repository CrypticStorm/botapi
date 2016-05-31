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
    redirectUri: 'http://botapi.xyz/oauth2/callback',
    scopes: ['identify', 'guilds']
});

const discordOAuthJoin = new ClientOAuth2({
    clientId: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    accessTokenUri: API_BASE_URL + '/oauth2/token',
    authorizationUri: API_BASE_URL + '/oauth2/authorize',
    redirectUri: 'http://botapi.xyz/oauth2/callback',
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

        this.router.get('/logout', (req, res) => {
            delete req.session.user;
            res.redirect('/');
        });

        this.router.get('/server/:id', this.isLoggedIn, (req, res) => {
            var data = {
                user: req.session.user
            };
            if (req.session.user && req.session.user.guilds) {
                var guild = req.session.user.guilds.find(guild => guild.id == req.params.id);
                guild.avatar = Constants.API_ENDPOINT + Endpoints.GUILD_ICON(guild.id, guild.icon);
                if (guild != null) {
                    data.guild = guild;
                    data.permissions = new IPermissions(guild.permissions, Constants.PermissionSpecs.Role);
                }
            }
            res.render('server', data);
        });

        this.router.get('/profile', this.isLoggedIn, (req, res) => {
            res.render('profile', {user: req.session.user});
        });

        this.router.get('/join', (req, res) => {
            res.redirect('https://discord.gg/0b7fa5Sh633Bjexn');
        });

        this.router.get('/invite', (req, res) => {
            var uri = 'https://discordapp.com/oauth2/authorize?client_id='+process.env.DISCORD_CLIENT_ID+'&scope=bot&permissions='+IPermissions.ALL+'&redirect_uri='+'http://botapi.xyz/';
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
                            console.log('[Login] Logged In:' + json.username + '#' + json.discriminator);
                            this.manager.get('Core-Users').saveUser(this.manager.bot, json);
                            json.avatar = Constants.CDN_ENDPOINT + Endpoints.CDN_AVATAR(json.id, json.avatar);

                            if (!req.session) {
                                req.session = {};
                            }
                            req.session.user = json;

                            Request.get(token.sign({
                                method: 'GET',
                                url: API_BASE_URL + '/users/@me/guilds'
                            }), (err, response, body) => {
                                if (err) {
                                    console.log(err.stack);
                                } else {
                                    try {
                                        var json = JSON.parse(body);
                                        if (!json.hasOwnProperty('message')) {
                                            json.sort((g1, g2) => g1.name.localeCompare(g2.name));

                                            if (!req.session) {
                                                req.session = {};
                                            }
                                            req.session.user.guilds = json;
                                        }

                                        var redirect_uri = req.session.login_redirect;
                                        if (redirect_uri) {
                                            delete req.session.login_redirect;
                                            res.redirect(redirect_uri);
                                        } else {
                                            res.redirect('/');
                                        }
                                    } catch(e) {
                                        console.log(e.stack);
                                    }
                                }
                            });
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