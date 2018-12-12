dojo.declare("classes.managers.Tools", com.nuclearunicorn.core.TabManager, {
    game: null,
    crafts: null,

    options: [
        {
            name: "speedUp",
            title: "Speed Up!",
            description: "",
            enabled: false,
            handler: function(button) {
            },
            action: function(game, self) {
            },
        }, {
            name: "autoManagement",
            title: "Auto Management",
            description: "",
            enabled: false,
            handler: function(button) {
            },
            action: function(game, self) {
            },
        }, {
            name: "autoCraft",
            title: "Auto Craft",
            description: "",
            enabled: false,
            handler: function(button) {
            },
            action: function(game, self) {
                if (!self.enabled) {
                    return;
                }

                game.cheats.crafts.update();
            },
        }, {
            name: "autoTrade",
            title: "Auto Trade",
            description: "",
            enabled: false,
            handler: function(button) {
            },
            action: function(game, self) {
            },
        }, {
            name: "autoHunt",
            title: "Auto Hunt",
            description: "",
            enabled: false,
            handler: function(button) {
            },
            action: function(game, self) {
                if (!self.enabled) {
                    return;
                }

                var res = game.resPool.get("manpower");
                if (0.95 < res.value / res.maxValue) {
                    game.village.huntAll();
                }
            },
        }, {
            name: "autoSun",
            title: "Auto Sun",
            description: "",
            enabled: false,
            handler: function(button) {
            },
            action: function(game, self) {
                if (!self.enabled) {
                    return;
                }

                var res = game.resPool.get("faith");
                if (0.95 < res.value / res.maxValue) {
                    game.religion.praise();
                }
            },
        },
    ],

    constructor: function(game) {
        this.game = game;
        this.crafts = new com.nuclearunicorn.game.Tools.AutoCrafting(this.game);

        this.init()
    },

    init: function() {
        dojo.forEach(this.game.workshop.crafts, function(craft) {
            this.crafts.addCraft({
                name: craft.name,
                enabled: false,
                action: dojo.hitch(craft, function(game, self) {
                    if (!self.enabled) {
                        return;
                    }

                    var minAmt = Number.MAX_VALUE;
                    for (var i = 0; i < this.prices.length; i++) {
                        var res = game.resPool.get(this.prices[i].name);
                        if (0.95 < res.value / res.maxValue) {
                            var allAmt = Math.floor(res.value / this.prices[i].val * 0.75);
                            if (allAmt < minAmt) {
                                minAmt = allAmt;
                            }
                        }
                    }
                    game.workshop.craft(self.name, minAmt);
                }),
            });
        }, this);
    },

    getOption: function(name) {
        for (var i = 0; i < this.options.length; i++) {
            var option = this.options[i];
            if (option.name == name) {
                return option;
            }
        }
    },

    update: function() {
        dojo.forEach(this.options, function(option) {
            option.action(this.game, option);
        }, this);
    },
});

dojo.declare("com.nuclearunicorn.game.Tools.AutoCrafting", null, {
    game: null,
    crafts: null,

    constructor: function(game) {
        this.game = game;
        this.crafts = [];
    },

    addCraft: function(craft) {
        this.crafts.push(craft);
    },

    get: function(name) {
        for (var i = 0; i < this.crafts.length; i++) {
            var craft = this.crafts[i];
            if (craft.name == name) {
                return craft;
            }
        }
    },

    update: function() {
        dojo.forEach(this.crafts, dojo.hitch(this, function(craft) {
            if (!craft.enabled) {
                return;
            }

            craft.action(this.game, craft);
        }));
    },
});

dojo.declare("com.nuclearunicorn.game.ui.GeneralToolsButton", com.nuclearunicorn.game.ui.ButtonModern, {
    getTool: function() {
        return this.game.cheats.getOption(this.id);
    },

    onClick: function() {
        var self = this;
        this.animate();
        this.controller.buyItem(this.model, event, function (result) {
            if (result) {
                self.update();
            }
        });
    },

    afterRender: function() {
        this.inherited(arguments);

        var option = this.getTool();
        this.toggle = this.addLink(option.enabled ? "on" : "off", function () {
            var option = this.getTool();
            option.enabled = !option.enabled;
        }, true);
    },

    update: function() {
        this.inherited(arguments);

        var option = this.getTool();
        if (this.toggle) {
            this.toggle.link.innerHTML = option.enabled ? "on" : "off";
        }
    },
});

dojo.declare("com.nuclearunicorn.game.ui.AutoCraftButton", com.nuclearunicorn.game.ui.ButtonModern, {
    getCraft: function() {
        return this.game.cheats.crafts.get(this.id);
    },

    onClick: function() {
        var self = this;
        this.animate();
        this.controller.buyItem(this.model, event, function (result) {
            if (result) {
                self.update();
            }
        });
    },

    afterRender: function() {
        this.inherited(arguments);

        var craft = this.getCraft();
        this.toggle = this.addLink(craft.enabled ? "on" : "off", function () {
            craft.enabled = !craft.enabled;
        }, true);
    },

    update: function() {
        this.inherited(arguments);

        var craft = this.getCraft();
        if (this.toggle) {
            this.toggle.link.innerHTML = craft.enabled ? "on" : "off";
        }
    },
});

dojo.declare("com.nuclearunicorn.game.ui.tab.Tools", com.nuclearunicorn.game.ui.tab, {
    generalPanel: null,
    craftPanel: null,

    render: function(container) {
        this.renderGeneral(container);
        this.renderCraft(container);
    },

    renderGeneral: function(container) {
        this.generalPanel = com.nuclearunicorn.game.ui.Panel("General");
        var content = this.generalPanel.render(container);

        var self = this;
        dojo.forEach(this.game.cheats.options, dojo.hitch(this, function(option) {
            var button = new com.nuclearunicorn.game.ui.GeneralToolsButton({
                id: option.name,
                name: option.title,
                description: option.description,
                handler: option.handler,
                controller: new com.nuclearunicorn.game.ui.ButtonModernController(this.game),
            }, this.game);
            button.render(content);
            this.generalPanel.addChild(button);
        }));
    },

    renderCraft: function(container) {
        this.craftPanel = com.nuclearunicorn.game.ui.Panel("Auto Crafting")
        var content = this.craftPanel.render(container);

        var self = this;
        dojo.forEach(this.game.workshop.crafts, dojo.hitch(this, function(craft) {
            var button = new com.nuclearunicorn.game.ui.AutoCraftButton({
                id: craft.name,
                name: craft.label,
                description: craft.description,
                prices: craft.prices,
                handler: dojo.partial(function(craft, btn) {
                    this.game.workshop.craft(craft.name, 1);
                }, craft),
                controller: new com.nuclearunicorn.game.ui.ButtonModernController(this.game),
            }, this.game);
            button.render(content);
            this.craftPanel.addChild(button);
        }));
    },

    update: function() {
        this.inherited(arguments);

        this.generalPanel.update();
        this.craftPanel.update();
    },
});

dojo.hitch(gamePage, function() {
    if (typeof this.cheats !== 'undefined') {
        return;
    }

    this.cheats = new classes.managers.Tools(this);
    this.timer.addEvent(dojo.hitch(this, function() { this.cheats.update(); }), 1);

    this.toolsTab = new com.nuclearunicorn.game.ui.tab.Tools({ name: "Cheat", id: "Cheat" }, this);
    this.toolsTab.visible = true;
    this.addTab(this.toolsTab);

    this.render();
})();
