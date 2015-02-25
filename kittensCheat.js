dojo.declare("classes.managers.Tools", null, {
    gmae: null,

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
            name: "autoCraft",
            title: "AutoCraft",
            description: "",
            enabled: false,
            handler: function(button) {
            },
            action: function(game, self) {
                if (!self.enabled) {
                    return;
                }
            },
        },
    ],

    constractor: function(game) {
        this.gmae = game;
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
            this.options[i].action(this.gmae, this.options[i]);
        }
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
        this.toggle = this.addLink(option.enabled ? "off" : "on",
            function() {
                var option = this.getTool();
                option.enabled = !option.enabled;
            }, true
        );
    },

    update: function() {
        this.inherited(arguments);

        var option = this.getTool();
        if (this.toggle) {
            this.toggle.link.innerHTML = option.enabled ? "off" : "on";
        }
    },
});

dojo.declare("com.nuclearunicorn.game.ui.tab.Tools", com.nuclearunicorn.game.ui.tab, {
    render: function(container) {
        var generalPanel = com.nuclearunicorn.game.ui.Panel("General");
        var content = generalPanel.render(container);

        this.renderGeneral(container);
        this.renderCraft(container);
    },

    renderGeneral: function(container) {
        for (var i = 0; i < this.game.cheats.options.length; i++) {
            var option = this.game.cheats.options[i];
            var button = new com.nuclearunicorn.game.ui.GeneralToolsButton({
                id: option.name,
                name: option.title,
                description: option.description,
                handler: option.handler,
            }, this.game);
            button.render(content);
        }
    },

    renderCraft: function(container) {
        var craftPanel = com.nuclearunicorn.game.ui.Panel("Auto Crafting")
        var content = craftPanel.render(container);

        var crafts = this.game.workshop.crafts;
        for (var i = 0; i < crafts.length; i++) {
            var craft = crafts[i];
            var button = new com.nuclearunicorn.game.ui.ButtonModern({
                name: craft.name,
            }, this.game);
            button.render(content);

            button.setEnabled(craft.unlocked);
        }
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
