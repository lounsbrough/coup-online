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
        color: '#555555'
    },
    [Influences.Contessa]: {
        legalBlock: Actions.Assassinate,
        color: '#E35646'
    },
    [Influences.Captain]: {
        legalAction: Actions.Steal,
        legalBlock: Actions.Steal,
        color: '#80C6E5'
    },
    [Influences.Ambassador]: {
        legalAction: Actions.Exchange,
        legalBlock: Actions.Steal,
        color: '#B4CA1F'
    },
    [Influences.Duke]: {
        legalAction: Actions.Tax,
        legalBlock: Actions.ForeignAid,
        color: '#D55DC7'
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
        color: '#770077',
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
        color: '#555555',
        requiresTarget: false
    },
    [Actions.Income]: {
        blockable: false,
        challengeable: false,
        color: '#555555',
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
    [Responses.Pass]: { color: '#007700' },
    [Responses.Challenge]: { color: '#ff7700' },
    [Responses.Block]: { color: '#770000' }
};
//# sourceMappingURL=game.js.map