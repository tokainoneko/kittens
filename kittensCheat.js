﻿dojo.declare("classes.managers.Tools", null, {
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
				
                game.cheets.crafts.update();
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
            name: "autoSun",
            title: "Auto Sun",
            description: "",
            enabled: false,
            handler: function(button) {
            },
            action: function(game, self) {
            },
        },
    ],

    constractor: function(game) {
        this.game = game;
        this.crafts = new com.nuclearunicorn.game.Tools.AutoCrafting(this.game);
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
        for (var i = 0; i < this.options.length; i++) {
            this.options[i].action(this.game, this.options[i]);
        }
    },
});

dojo.declare("com.nuclearunicorn.game.Tools.AutoCrafting", null, {
    game: null,
    crafts: null,
	
    constractor: function(game) {
        this.game = game;
        this.crafts = [];
    },
	
    addCraft: function(craft) {
        this.crafts.push(craft);
    },
	
    update: function() {
        dojo.forEach(this.crafts, dojo.hitch(this, function(craft) {
            if (!craft.enabled) {
                return;
            }
			
            craft.action(this.game);
        }));
    },
});

dojo.declare("com.nuclearunicorn.game.ui.GeneralToolsButton", com.nuclearunicorn.game.ui.ButtonModern, {
    getTool: function() {
        return this.game.cheats.getOption(this.id);
    },

    onClick: function() {
        this.animate();
        this.handler(this);
    },

    afterRender: function() {
        this.inherited(arguments);

        var option = this.getTool();
        this.toggle = this.addLink(option.enabled ? "off" : "on",function() {
            var option = this.getTool();
            option.enabled = !option.enabled;
        }, true);
    },

    update: function() {
        this.inherited(arguments);

        var option = this.getTool();
        if (this.toggle) {
            this.toggle.link.innerHTML = option.enabled ? "off" : "on";
        }
    },
});

dojo.declare("com.nuclearunicorn.game.ui.AutoCraftButton", com.nuclearunicorn.game.ui.ButtonModern, {
    auto: false,

    onClick: function() {
        this.animate();
        this.handler(this);
    },

    afterRender: function() {
        this.inherited(arguments);

        this.toggle = this.addLink(this.auto ? "off" : "on", function() {
            this.auto = !this.auto;
        }, true);
    },

    update: function() {
        this.inherited(arguments);

        if (this.toggle) {
            this.toggle.link.innerHTML = this.auto ? "off" : "on";
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
                name: craft.title,
                description: craft.description,
                prices: craft.prices,
                handler: dojo.partial(function(craft, btn) {
                    btn.game.workshop.craft(craft.name, 1);
                }, craft)
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

    this.toolsTab = new com.nuclearunicorn.game.ui.tab.Tools("Cheat", this);
    this.toolsTab.visible = true;
    this.addTab(this.toolsTab);

    this.render();
})();
