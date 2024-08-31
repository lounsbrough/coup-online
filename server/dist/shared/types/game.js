"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InfluencesRules = exports.Influences = exports.ActionRules = exports.Actions = void 0;
var Actions;
(function (Actions) {
    Actions["Assassinate"] = "Assassinate";
    Actions["Steal"] = "Steal";
    Actions["Coup"] = "Coup";
    Actions["Tax"] = "Tax";
    Actions["ForeignAid"] = "ForeignAid";
    Actions["Income"] = "Income";
    Actions["Exchange"] = "Exchange";
})(Actions || (exports.Actions = Actions = {}));
exports.ActionRules = {
    [Actions.Assassinate]: {
        blockable: true,
        challengeable: true,
        coinsRequired: 3
    },
    [Actions.Steal]: {
        blockable: true,
        challengeable: true
    },
    [Actions.Coup]: {
        blockable: false,
        challengeable: false,
        coinsRequired: 7
    },
    [Actions.Tax]: {
        blockable: false,
        challengeable: true
    },
    [Actions.ForeignAid]: {
        blockable: true,
        challengeable: false
    },
    [Actions.Income]: {
        blockable: false,
        challengeable: false
    },
    [Actions.Exchange]: {
        blockable: false,
        challengeable: true
    }
};
var Influences;
(function (Influences) {
    Influences["Assassin"] = "Assassin";
    Influences["Contessa"] = "Contessa";
    Influences["Captain"] = "Captain";
    Influences["Ambassador"] = "Ambassador";
    Influences["Duke"] = "Duke";
})(Influences || (exports.Influences = Influences = {}));
exports.InfluencesRules = {
    [Influences.Assassin]: {
        legalAction: Actions.Assassinate
    },
    [Influences.Contessa]: {
        legalBlock: Actions.Assassinate
    },
    [Influences.Captain]: {
        legalAction: Actions.Steal,
        legalBlock: Actions.Steal
    },
    [Influences.Ambassador]: {
        legalAction: Actions.Exchange,
        legalBlock: Actions.Steal
    },
    [Influences.Duke]: {
        legalAction: Actions.Tax,
        legalBlock: Actions.ForeignAid
    }
};
//# sourceMappingURL=game.js.map