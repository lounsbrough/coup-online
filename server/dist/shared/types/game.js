"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseAttributes = exports.Responses = exports.ActionAttributes = exports.InfluenceAttributes = exports.Actions = exports.Influences = void 0;
var Influences;
(function (Influences) {
    Influences["Assassin"] = "Assassin";
    Influences["Contessa"] = "Contessa";
    Influences["Captain"] = "Captain";
    Influences["Ambassador"] = "Ambassador";
    Influences["Duke"] = "Duke";
})(Influences || (exports.Influences = Influences = {}));
var Actions;
(function (Actions) {
    Actions["Assassinate"] = "Assassinate";
    Actions["Steal"] = "Steal";
    Actions["Coup"] = "Coup";
    Actions["Tax"] = "Tax";
    Actions["ForeignAid"] = "Foreign Aid";
    Actions["Income"] = "Income";
    Actions["Exchange"] = "Exchange";
})(Actions || (exports.Actions = Actions = {}));
exports.InfluenceAttributes = {
    [Influences.Assassin]: {
        legalAction: Actions.Assassinate,
        color: {
            light: '#555555',
            dark: '#777777'
        }
    },
    [Influences.Contessa]: {
        legalBlock: Actions.Assassinate,
        color: {
            light: '#E35646',
            dark: '#e87e72'
        }
    },
    [Influences.Captain]: {
        legalAction: Actions.Steal,
        legalBlock: Actions.Steal,
        color: {
            light: '#80C6E5',
            dark: '#afe2f8'
        }
    },
    [Influences.Ambassador]: {
        legalAction: Actions.Exchange,
        legalBlock: Actions.Steal,
        color: {
            light: '#B4CA1F',
            dark: '#d4e65a'
        }
    },
    [Influences.Duke]: {
        legalAction: Actions.Tax,
        legalBlock: Actions.ForeignAid,
        color: {
            light: '#D55DC7',
            dark: '#ec98e2'
        }
    }
};
exports.ActionAttributes = {
    [Actions.Assassinate]: {
        blockable: true,
        challengeable: true,
        coinsRequired: 3,
        color: exports.InfluenceAttributes.Assassin.color,
        requiresTarget: true
    },
    [Actions.Steal]: {
        blockable: true,
        challengeable: true,
        color: exports.InfluenceAttributes.Captain.color,
        requiresTarget: true
    },
    [Actions.Coup]: {
        blockable: false,
        challengeable: false,
        coinsRequired: 7,
        color: {
            light: '#770077',
            dark: '#770077'
        },
        requiresTarget: true
    },
    [Actions.Tax]: {
        blockable: false,
        challengeable: true,
        color: exports.InfluenceAttributes.Duke.color,
        requiresTarget: false
    },
    [Actions.ForeignAid]: {
        blockable: true,
        challengeable: false,
        color: {
            light: '#555555',
            dark: '#555555'
        },
        requiresTarget: false
    },
    [Actions.Income]: {
        blockable: false,
        challengeable: false,
        color: {
            light: '#555555',
            dark: '#555555'
        },
        requiresTarget: false
    },
    [Actions.Exchange]: {
        blockable: false,
        challengeable: true,
        color: exports.InfluenceAttributes.Ambassador.color,
        requiresTarget: false
    }
};
var Responses;
(function (Responses) {
    Responses["Pass"] = "Pass";
    Responses["Challenge"] = "Challenge";
    Responses["Block"] = "Block";
})(Responses || (exports.Responses = Responses = {}));
exports.ResponseAttributes = {
    [Responses.Pass]: {
        color: {
            light: '#007700',
            dark: '#77ee77'
        }
    },
    [Responses.Challenge]: {
        color: {
            light: '#ff7700',
            dark: '#ffaa55'
        }
    },
    [Responses.Block]: {
        color: {
            light: '#770000',
            dark: '#ff6666'
        }
    }
};
//# sourceMappingURL=game.js.map